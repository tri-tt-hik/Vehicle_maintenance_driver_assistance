from django.urls import path
from . import views

urlpatterns = [
    path('vehicles/', views.vehicle_list, name='vehicle_list'),
    path('vehicles/<int:vehicle_id>/', views.vehicle_detail, name='vehicle_detail'),
    path('vehicles/<int:vehicle_id>/upload/', views.upload_document, name='upload_document'),
    path('vehicles/<int:vehicle_id>/documents/', views.get_vehicle_documents, name='get_vehicle_documents'),
    path('detect-upload/', views.upload_detection_video), 
]

