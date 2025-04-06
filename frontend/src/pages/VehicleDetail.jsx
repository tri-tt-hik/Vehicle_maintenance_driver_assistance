// src/components/VehicleDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import VideoUpload from "./VideoUpload";
import "../styles/VehicleDetail.css";

function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    api.get(`/api/vehicles/${id}/`)
      .then((res) => setVehicle(res.data))
      .catch((err) => {
        console.error("Vehicle fetch error:", err);
        alert("Failed to load vehicle details");
      });
  }, [id]);

  if (!vehicle) return <p>Loading vehicle details...</p>;

  return (
    <div className="vehicle-detail-container">
      <h1>Vehicle Details</h1>
      <h2>Owner: {vehicle.owner}</h2>
      <h2>{vehicle.make} {vehicle.model}</h2>
      <p><strong>Type:</strong> {vehicle.type}</p>
      <p><strong>Color:</strong> {vehicle.vcolor}</p>
      <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
      <p><strong>Transmission:</strong> {vehicle.transmission}</p>
      <p><strong>Fuel Type:</strong> {vehicle.fuel_type}</p>
      <p><strong>ARAI Mileage:</strong> {vehicle.mileage} km</p>
      <p><strong>Engine Capacity:</strong> {vehicle.engine_capacity} L</p>
      <p><strong>Odometer:</strong> {vehicle.odometer} km</p>
      <p><strong>Purchase Date:</strong> {vehicle.purchase_date}</p>
      <p><strong>Last Service Date:</strong> {vehicle.last_service_date}</p>

      <hr style={{ margin: "2rem 0", borderColor: "#ccc" }} />

      
      <VideoUpload
        vehicleInfo={{
            model: vehicle.model,
          serviceDate: vehicle.last_service_date,
          purchaseDate: vehicle.purchase_date,
          engineSize: vehicle.engine_capacity,
          odometerReading: vehicle.odometer,
          fuelEfficiency: vehicle.mileage,
        }}
      />
    </div>
  );
}

export default VehicleDetail;
