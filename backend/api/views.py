from django.db.models.manager import BaseManager
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Vehicle, Document
from .serializers import VehicleSerializer, DocumentSerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework import generics
from .models import DetectionVideo
from .serializers import DetectionVideoSerializer
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from project.video_stream import run_vehicle_detection


from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny

@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def upload_detection_video(request):
    serializer = DetectionVideoSerializer(data=request.data)
    if serializer.is_valid():
        video_instance = serializer.save()
        run_vehicle_detection(video_instance.file.path)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def vehicle_list(request):
    if request.method == 'GET':
        vehicles: BaseManager[Vehicle] = Vehicle.objects.filter(owner=request.user)
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def vehicle_detail(request, vehicle_id):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)

    if request.method == 'GET':
        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data)

    elif request.method == 'DELETE':
        vehicle.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request, vehicle_id):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    serializer = DocumentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(vehicle=vehicle)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vehicle_documents(request, vehicle_id):
    vehicle = get_object_or_404(Vehicle, id=vehicle_id, owner=request.user)
    documents = vehicle.documents.all()
    serializer = DocumentSerializer(documents, many=True)
    return Response(serializer.data)
