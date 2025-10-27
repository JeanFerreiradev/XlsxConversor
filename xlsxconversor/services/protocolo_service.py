from ..firebase import db

def salvar_protocolo(dados):
    # Salva um novo protocolo no Firestore
    doc_ref = db.collection('PROTOCOLO').add(dados)
    return doc_ref[1].id

def listar_todos_protocolos():
    # Lista todos os protocolos gravados na base
    docs = db.collection('PROTOCOLO').stream()
    protocolos = [{**doc.to_dict(), "id": doc.id} for doc in docs]
    return protocolos

def buscar_protocolo_por_id(protocolo_id):
    # Busca protocolo de acordo com o id
    doc = db.collection('PROTOCOLO').document(protocolo_id).get()
    if doc.exists:
        protocolo = {**doc.to_dict(), "id": doc.id}
        return protocolo
    return None

