from django.urls import path
from .views import *

urlpatterns = [
    path('obter_estatisticas_por_estado/', obter_estatisticas_por_estado, name='obter_estatisticas_por_estado'),
    
    # -------------------- PROTOCOLO URLS --------------------
    path('upload_bmp/', upload_bmp, name='upload_bmp'),
    path('submission/<int:pk>/', submission_detail),
    path('consult_protocol/<int:pk>/', consult_protocol),
    
    # -------------------- USUARIO URLS --------------------
    path('login/', login_view, name='login'),
]
