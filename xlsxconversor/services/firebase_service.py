import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import logging
import json
import os
import shutil
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

class FirestoreService:
    """Serviço para operações no Firestore"""
    def __init__(self, credentials_path=None, media_root=None):
        """
        Inicializa conexão com Firestore
        
        Args:
            credentials_path: Caminho para arquivo de credenciais Firebase
            media_root: Diretório raiz para armazenamento local de arquivos
        """
        self.db = None
        self.media_root = media_root or os.path.join(os.getcwd(), 'media')
        self._initialize_firebase(credentials_path)
    
    def _initialize_firebase(self, credentials_path):
        """Inicializa Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                if credentials_path:
                    # Verifica se arquivo de credenciais existe
                    if not os.path.exists(credentials_path):
                        raise FileNotFoundError(f"Arquivo de credenciais não encontrado: {credentials_path}")
                    
                    cred = credentials.Certificate(credentials_path)
                    firebase_admin.initialize_app(cred)
                    logger.info(f"Firestore inicializado com credenciais: {credentials_path}")
                else:
                    # Verifica variáveis de ambiente
                    project_id = os.environ.get('FIREBASE_PROJECT_ID')
                    if not project_id:
                        raise ValueError("FIREBASE_PROJECT_ID não definido nas variáveis de ambiente")
                    
                    firebase_admin.initialize_app()
                    logger.info(f"Firestore inicializado com credenciais de ambiente - Project: {project_id}")
            
            self.db = firestore.client()
            
            # Testa conexão
            self.db.collection('test').limit(1).get()
            
            # Inicializa estrutura de pastas para armazenamento local
            self._initialize_local_storage()
            
            logger.info("Firestore inicializado com sucesso e conexão testada")
            
        except FileNotFoundError as e:
            logger.error(f"Arquivo de credenciais não encontrado: {str(e)}")
            self.db = None
        except ValueError as e:
            logger.error(f"Configuração inválida: {str(e)}")
            self.db = None
        except Exception as e:
            logger.error(f"Erro ao inicializar Firestore: {str(e)}")
            logger.error(f"Tipo do erro: {type(e).__name__}")
            self.db = None
            # Não levanta exceção para permitir modo desenvolvimento sem Firebase
    
    def _initialize_local_storage(self):
        """Inicializa estrutura de pastas para armazenamento local"""
        try:
            # Cria diretórios se não existirem
            os.makedirs(self.media_root, exist_ok=True)
            os.makedirs(os.path.join(self.media_root, 'uploads'), exist_ok=True)
            os.makedirs(os.path.join(self.media_root, 'xml_gerado'), exist_ok=True)
            os.makedirs(os.path.join(self.media_root, 'xml_assinado'), exist_ok=True)
            
            logger.info(f"Estrutura de armazenamento local criada: {self.media_root}")
            
        except Exception as e:
            logger.error(f"Erro ao criar estrutura de armazenamento local: {str(e)}")

    def obter_estatisticas_por_estado(self):
        """
        Obtém estatísticas agrupadas por estado
        
        Returns:
            dict com estastísticas por estado
        """
        try:
            # Verifica se Firestore está inicializado
            if self.db is None:
                logger.warning("Firestore não inicializado, retornando estatísticas vazias")
                return {}
            
            docs = self.db.collection('bmp_submissions').stream()
            
            stats = {}
            
            for doc in docs:
                data = doc.to_dict()
                estado = data.get('estado_origem', 'DESCONHECIDO')
                status = data.get('status', 'desconhecido')
                
                if estado not in stats:
                    stats[estado] = {
                        'total': 0,
                        'sucesso': 0,
                        'erro': 0,
                        'processando': 0
                    }
                
                stats[estado]['total'] += 1
                if status == 'sucesso':
                    stats[estado]['sucesso'] += 1
                elif status == 'erro':
                    stats[estado]['erro'] += 1
                elif status == 'processando':
                    stats[estado]['processando'] += 1
                
            logger.info(f"Estatísticas calculadas para {len(stats)} estados")
            return stats
            
        except Exception as e:
            logger.error((f"Erro ao obter estatísticas: {str(e)}"))
            return {}
