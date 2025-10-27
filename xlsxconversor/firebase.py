import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import os
load_dotenv()

# Caminho da chave privada do firebase
cred = credentials.Certificate(os.environ.get("FIREBASEKEY_PATH"))

# Evita inicialização duplicada
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Cliente do Firestore
db = firestore.client()
