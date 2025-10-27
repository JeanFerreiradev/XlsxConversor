from ..firebase import db
from ..exceptions import *
import logging

logger = logging.getLogger(__name__)

def login(codigo_usuario, senha):
    docs = db.collection('USUARIO').stream()
    if docs:
        for doc in docs:
            doc_data = doc.to_dict()
            if doc_data.get('CODIGO') == codigo_usuario and doc_data.get('SENHA') == senha:
                return doc_data
            logger.warning('Usuário ou senha incorretos.')
            raise ResourceUnauthorizedException('Usuário ou senha incorretos.', status_code=401, detail='Usuário ou senha incorretos.')
    logger.warning('Nenhum usuário encontrado.')
    raise ResourceNotFoundException('Usuário não encontrado.', status_code=404, detail='Nenhum usuário não encontrado.')
