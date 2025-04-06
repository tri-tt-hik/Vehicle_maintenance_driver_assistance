from django.db import models
from django.contrib.auth.models import User

class Vehicle(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    make = models.CharField(max_length=50, blank=True, null=True)
    model = models.CharField(max_length=100)
    purchase_date = models.DateField(blank=True, null=True)
    vcolor = models.CharField(max_length=50, blank=True, null=True)
    license_plate = models.CharField(max_length=20, unique=True, blank=True, null=True)
    transmission = models.CharField(max_length=20, blank=True, null=True)
    fuel_type = models.CharField(max_length=20, blank=True, null=True)
    mileage = models.IntegerField(blank=True, null=True)
    engine_capacity = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    odometer = models.IntegerField(blank=True, null=True)
    last_service_date = models.DateField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['owner', 'license_plate'], name='unique_plate_per_user')
        ]

    

    def __str__(self):
        return (
            f"{self.owner.username}'s Vehicle: {self.type} {self.make} {self.model} "
            f"({self.purchase_date}) | Color: {self.vcolor} | Plate: {self.license_plate} | "
            f"Transmission: {self.transmission} | Fuel: {self.fuel_type} | Mileage: {self.mileage} km | "
            f"Engine: {self.engine_capacity}L | Odometer: {self.odometer} km | "
            f"Last Service: {self.last_service_date}"
        )


class Document(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="vehicle_documents/")

    def __str__(self):
        return f"Document for {self.vehicle}"
    
class DetectionVideo(models.Model):
    file = models.FileField(upload_to='detection_videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video uploaded at {self.uploaded_at}"

