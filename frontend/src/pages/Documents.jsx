import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Documents.css"; // Import the CSS

function Documents() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);

  const DJANGO_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    api.get("/api/vehicles/").then((res) => setVehicles(res.data));
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      api.get(`/api/vehicles/${selectedVehicle}/documents/`).then((res) => setDocuments(res.data));
    } else {
      setDocuments([]);
    }
  }, [selectedVehicle]);

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    api
      .post(`/api/vehicles/${selectedVehicle}/upload/`, formData)
      .then(() => {
        alert("Uploaded!");
        setFile(null);
        return api.get(`/api/vehicles/${selectedVehicle}/documents/`);
      })
      .then((res) => setDocuments(res.data));
  };

  return (
    <div className="documents-container">
      <h2 className="documents-heading">Upload Vehicle Document</h2>
      <form className="upload-form" onSubmit={handleUpload}>
        <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} required>
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} - {v.license_plate}
            </option>
          ))}
        </select>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
          <hr style={{ margin: "2rem 0", borderColor: "#ccc" }} />
      {selectedVehicle && (
        <div className="documents-section">
          <h3>Uploaded Documents</h3>
          {documents.length === 0 ? (
            <p className="no-docs">No documents uploaded yet.</p>
          ) : (
            <ul className="documents-list">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <a href={`${DJANGO_BASE_URL}${doc.file}`} target="_blank" rel="noreferrer">
                    {doc.file.split("/").pop()}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Documents;
