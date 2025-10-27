from django.urls import path
from .views import *

urlpatterns = [
    # -------------------- PROTOCOLO URLS --------------------
    path('protocolos/', listar_todos_protocolos_view),
    path('protocolos/salvar/', salvar_protocolo_view),
    path('protocolos/<str:protocolo_id>/', buscar_protocolo_por_id_view),
    
    # -------------------- USUARIO URLS --------------------
    path('login/', login_view, name='login'),
]
