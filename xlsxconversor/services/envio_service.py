from ..firebase import db

def salvar_envio(dados):
    # Salva um novo envio no Firestore
    doc_ref = db.collection('ENVIO').add(dados)
    return doc_ref[1].id

def listar_todos_envios():
    # Lista todos os protocolos gravados na base
    docs = db.collection('ENVIO').stream()
    envios = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    return envios

def buscar_envio_por_id(envio_id):
    # Busca protocolo de acordo com o id
    doc = db.collection('ENVIO').document(envio_id).get()
    if doc.exists:
        envio = {**doc.to_dict(), "id": doc.id}
        return envio
    return None

def atualizar_response_envio(envio_id, response_text):
    db.collection('ENVIO').document(envio_id).update({'response_raw': response_text})
