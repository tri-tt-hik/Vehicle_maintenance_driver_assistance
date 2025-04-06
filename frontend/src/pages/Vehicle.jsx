import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Vehicle.css";
import { ACCESS_TOKEN } from "../constants";
import { useNavigate } from "react-router-dom";

function Vehicle() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [username, setUsername] = useState(""); // store logged-in username



  const [form, setForm] = useState({
    type: "",
    make: "",
    model: "",
    purchase_date: "",
    vcolor: "",
    license_plate: "",
    transmission: "",
    fuel_type: "",
    mileage: "",
    engine_capacity: "",
    odometer: "",
    last_service_date: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    api
      .get("/api/vehicles/")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("Fetch error:", err));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      engine_capacity: form.engine_capacity
        ? parseFloat(form.engine_capacity)
        : null,
      odometer: form.odometer ? parseInt(form.odometer) : null,
      purchase_date: form.purchase_date || null,
      last_service_date: form.last_service_date || null,
    };

    api
      .post("/api/vehicles/", payload)
      .then(() => {
        fetchVehicles();
        setForm({
          type: "",
          make: "",
          model: "",
          purchase_date: "",
          vcolor: "",
          license_plate: "",
          transmission: "",
          fuel_type: "",
          mileage: "",
          engine_capacity: "",
          odometer: "",
          last_service_date: "",
        });
        alert("Vehicle added successfully!");
      })
      .catch((err) => {
        console.error("Vehicle POST error:", err.response?.data || err.message);
        const errors = err.response?.data;

        if (errors?.license_plate) {
          alert(`Error: ${errors.license_plate[0]}`);
        } else {
          alert("Something went wrong. Please check the form and try again.");
        }
      });
  };

  const handleDelete = (id) => {
    api.delete(`/api/vehicles/${id}/`).then(() => {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    });
  };

  return (
    <div className="vehicle-container">
      <h2 className="vehicle-header"> Your Vehicles</h2>
      <ul className="vehicle-list">
        {vehicles.map((v) => (
          <li key={v.id}>
            <span className="owner-info">Owner: {v.owner || "N/A"}</span>
            <button className="vehicle-item" onClick={() => navigate(`/vehicles/${v.id}`)}>
            {v.make} {v.model} - {v.vcolor} | Plate: {v.license_plate}
          </button>
            <button className="delete-button" onClick={() => handleDelete(v.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <h3 className="vehicle-subheader">Add Vehicle</h3>
      <form onSubmit={handleSubmit} className="vehicle-form">
        <input name="type" value={form.type} onChange={handleChange} placeholder="Type" required />
        <input name="make" value={form.make} onChange={handleChange} placeholder="Make" />
        <input name="model" value={form.model} onChange={handleChange} placeholder="Model" required />

        <label htmlFor="purchase_date">Purchase Date:</label>
        <input
          type="date"
          name="purchase_date"
          value={form.purchase_date}
          onChange={handleChange}
        />

        <input name="vcolor" value={form.vcolor} onChange={handleChange} placeholder="Color" />
        <input name="license_plate" value={form.license_plate} onChange={handleChange} placeholder="License Plate" />
        <input name="transmission" value={form.transmission} onChange={handleChange} placeholder="Transmission" />
        <input name="fuel_type" value={form.fuel_type} onChange={handleChange} placeholder="Fuel Type" />
        {form.fuel_type.toLowerCase() === "electric" ? (
          <input
            name="mileage"
            value={form.mileage}
            onChange={handleChange}
            placeholder="Range (km)"
          />
        ) : (
          <input
            name="mileage"
            value={form.mileage}
            onChange={handleChange}
            placeholder="Mileage (km/L)"
          />
        )}
        <input
          name="engine_capacity"
          value={form.engine_capacity}
          onChange={handleChange}
          placeholder={
            form.fuel_type.toLowerCase() === "electric"
              ? "Battery Capacity (kWh)"
              : "Engine Capacity (L)"
          }
        />
        <input name="odometer" value={form.odometer} onChange={handleChange} placeholder="Odometer (km)" />

        <label htmlFor="last_service_date">Last Service Date:</label>
        <input
          type="date"
          name="last_service_date"
          value={form.last_service_date}
          onChange={handleChange}
        />

        <button type="submit">Add Vehicle</button>
      </form>
    </div>
  );
}

export default Vehicle;
