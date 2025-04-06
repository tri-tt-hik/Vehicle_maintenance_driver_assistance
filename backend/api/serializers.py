from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Vehicle, Document
from .models import DetectionVideo  # Add this at the top

class DetectionVideoSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True)
    class Meta:
        model = DetectionVideo
        fields = ['id', 'file', 'uploaded_at']

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'file']

class VehicleSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    owner = serializers.ReadOnlyField(source='owner.username')  # 🛠️ This is the missing piece

    class Meta:
        model = Vehicle
        fields = [
            'id', 'type', 'model', 'purchase_date', 'documents', 'make',
            'vcolor', 'license_plate', 'transmission', 'fuel_type', 'mileage',
            'engine_capacity', 'odometer', 'last_service_date', 'owner'  # 👈 include it here!
        ]
        read_only_fields = ['owner']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user



