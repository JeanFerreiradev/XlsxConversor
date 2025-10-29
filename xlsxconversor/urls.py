from django.urls import path
from .views import *

urlpatterns = [
    # -------------------- PROTOCOLO URLS --------------------
    path('upload_bmp/', upload_bmp, name='upload_bmp'),
    path('submission/<int:pk>/', submission_detail),
    path('consult_protocol/<int:pk>/', consult_protocol),
    
    # -------------------- USUARIO URLS --------------------
    path('login/', login_view, name='login'),
]
