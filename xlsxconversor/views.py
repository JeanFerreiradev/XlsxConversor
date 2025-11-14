from rest_framework.response import Response
from rest_framework import status
import secrets
import tempfile, os, traceback
from django.conf import settings
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
import logging

from .services.envio_service import *
from .services.usuario_service import login
from .services.xml_service import *
from .services.soap_service import *
from .services.firebase_service import FirestoreService
from .exceptions import *
from lxml import etree

logger = logging.getLogger(__name__)

# Inicializa serviço que faz conexão com o Firestore
def inicializar_firestore_service():
    """Inicializa serviço que faz conexão com o Firestore"""
    try:
        credentials_path = os.environ.get("FIREBASEKEY_PATH")
        media_root = os.path.join(settings.BASE_DIR, 'media')
        
        service = FirestoreService(credentials_path, media_root)
        
        # Testa se o Firestore está funcionando
        if service.db is not None:
            logger.info("Firestore inicializado com sucesso")
            return service
        else:
            logger.warning("Firestore falhou na inicialização")
            return None
        
    except Exception as e:
        logger.error(f"Erro ao inicializar firestore: {e}")
        return None

firestore_service = inicializar_firestore_service()

@api_view(['GET'])
def obter_estatisticas_por_estado(request):
    try:
        stats = firestore_service.obter_estatisticas_por_estado()
        return Response(stats)
    except Exception as e:
        return Response({"erro": {str(e)}}, status=500)

# -------------------- PROTOCOLO VIEW --------------------
@api_view(['POST'])
def salvar_envio_view(request):
    try:
        protocolo_id = salvar_envio(request.data)
        return Response({"mensagem": "Protocolo salvo com sucesso!", "id": protocolo_id})
    except Exception as e:
        return Response({"erro": str(e)}, status=500)

@api_view(['GET'])
def listar_todos_envios_view(request):
    try:
        protocolos = listar_todos_envios()
        return Response(protocolos)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)
    
@api_view(['GET'])
def buscar_envio_por_id_view(request, protocolo_id):
    try:
        protocolo = buscar_envio_por_id(protocolo_id)
        if protocolo:
            return Response(protocolo)
        return Response({"mensagem": "Protocolo não encontrado."}, status=404)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)
    

@csrf_exempt
def upload_bmp(request):
    if request.method != 'POST':
        return HttpResponseBadRequest('Use POST com form-data (campo: file).')

    f = request.FILES.get('file')
    if not f:
        return HttpResponseBadRequest('Arquivo não enviado.')

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
    try:
        for chunk in f.chunks():
            tmp.write(chunk)
        tmp.flush()
        tmp.close()

        # 1) Converte XLSX → XML
        xml_bytes = xlsx_to_bmp_xml(tmp.name)

        # 2) Assina XML
        signed = sign_xml_with_pfx(xml_bytes, tag_to_sign='a025')

        # 3) Envia ao WebService SOAP
        resp = send_bmp_xml(signed)
        response_text = getattr(resp, 'text', str(resp))
        status = 'SENT'
        protocol = None
        
        print(response_text)

        try:
            root = etree.fromstring(resp.content)
            prot = root.find('.//Protocolo')
            if prot is not None and prot.text:
                protocol = prot.text.strip()
            else:
                status = 'SENT_NO_PROTOCOL'
        except Exception:
            status = 'SENT_ERROR_PARSING'

        # 4) Salva no Firestore via service
        dados = {
            'original_filename': f.name,
            'status': status,
            'protocol': protocol,
            'xml': xml_bytes.decode('utf-8'),
            'signed_xml': signed.decode('utf-8'),
            'response_raw': response_text,
        }
        envio_id = salvar_envio(dados)

        return JsonResponse({'id': envio_id, 'status': status, 'protocol': protocol})

    except Exception as e:
        trace = traceback.format_exc()
        erro = {
            'original_filename': f.name,
            'status': 'ERROR',
            'response_raw': trace
        }
        salvar_envio(erro)
        return JsonResponse({'error': str(e), 'trace': trace}, status=500)

    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


def submission_detail(request, envio_id):
    envio = buscar_envio_por_id(envio_id)
    if not envio:
        return HttpResponse(status=404)
    return JsonResponse(envio)


@csrf_exempt
def consult_protocol(request, envio_id):
    envio = buscar_envio_por_id(envio_id)
    if not envio:
        return HttpResponse(status=404)

    protocol_number = envio.get('protocol')
    if not protocol_number:
        return JsonResponse({'error': 'Nenhum protocolo armazenado.'}, status=400)

    resp = consult_protocol_ws(protocol_number)
    response_text = getattr(resp, 'text', str(resp))

    # Atualiza o protocolo no Firestore
    atualizar_response_envio(envio_id, response_text)

    return JsonResponse({'status': 'OK', 'response': response_text})


# -------------------- USUARIO VIEW --------------------
@api_view(['POST'])
def login_view(request):
    try:
        data = request.data
        print(data)
        codigo_usuario = data.get('username')
        senha = data.get('password')

        if not codigo_usuario or not senha:
            return Response({"detail": "Usuário e senha são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        usuario = login(codigo_usuario, senha)

        if usuario:
            token = secrets.token_hex(32)
            return Response({"token": token, "usuario": usuario})
        else:
            return Response({"detail": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except ResourceNotFoundException as e:
        return Response({"erro": e.message, "detail": e.detail}, status=e.status_code)
    except ResourceUnauthorizedException as e:
        return Response({"erro": e.message, "detail": e.detail}, status=e.status_code)
