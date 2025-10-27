from rest_framework.response import Response
from rest_framework import status
import secrets
from rest_framework.decorators import api_view
from .services.protocolo_service import *
from .services.usuario_service import *

# -------------------- PROTOCOLO VIEW --------------------
@api_view(['POST'])
def salvar_protocolo_view(request):
    try:
        protocolo_id = salvar_protocolo(request.data)
        return Response({"mensagem": "Protocolo salvo com sucesso!", "id": protocolo_id})
    except Exception as e:
        return Response({"erro": str(e)}, status=500)

@api_view(['GET'])
def listar_todos_protocolos_view(request):
    try:
        protocolos = listar_todos_protocolos()
        return Response(protocolos)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)
    
@api_view(['GET'])
def buscar_protocolo_por_id_view(request, protocolo_id):
    try:
        protocolo = buscar_protocolo_por_id(protocolo_id)
        if protocolo:
            return Response(protocolo)
        return Response({"mensagem": "Protocolo não encontrado."}, status=404)
    except Exception as e:
        return Response({"erro": str(e)}, status=500)

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
