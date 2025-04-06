import { useEffect, useState, useRef } from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/VideoUpload.css"; // Import your CSS file

const VideoUpload = ({ vehicleInfo }) => {
  const [vehicleDetails, setVehicleDetails] = useState({
    model: "",
    serviceDate: "",
    purchaseDate: "",
    engineSize: "",
    odometerReading: "",
    fuelEfficiency: "",
  });

  const [tripForm, setTripForm] = useState({
    start: "",
    destination: "",
    startDate: "",
    returnDate: "",
    distance: ""
  });

  const [tripFeasibility, setTripFeasibility] = useState(null);
  const [myTrips, setMyTrips] = useState([]);
  const [activeTab, setActiveTab] = useState("health");

  const reportRef = useRef();

  useEffect(() => {
    if (vehicleInfo) {
      setVehicleDetails({
        model: vehicleInfo.model || "",
        serviceDate: vehicleInfo.serviceDate || "",
        purchaseDate: vehicleInfo.purchaseDate || "",
        engineSize: vehicleInfo.engineSize || "",
        odometerReading: vehicleInfo.odometerReading || "",
        fuelEfficiency: vehicleInfo.fuelEfficiency || "",
      });
    }
  }, [vehicleInfo]);

  useEffect(() => {
    // Load trips from local storage on component mount
    const storedTrips = JSON.parse(localStorage.getItem('myTrips')) || [];
    setMyTrips(storedTrips);
  }, []);

  const calculateDaysSinceService = () => {
    if (!vehicleDetails.serviceDate) return 0;
    const lastService = new Date(vehicleDetails.serviceDate);
    const today = new Date();
    return Math.floor((today - lastService) / (1000 * 3600 * 24));
  };

  const calculateVehicleAge = () => {
    if (!vehicleDetails.purchaseDate) return 0;
    const purchaseDate = new Date(vehicleDetails.purchaseDate);
    return new Date().getFullYear() - purchaseDate.getFullYear();
  };

  const calculateBrakeWear = () => Math.min(100, calculateDaysSinceService() * 0.1);

  const calculateFuelEfficiencyDrop = () => {
    const age = calculateVehicleAge();
    const mileage = parseInt(vehicleDetails.odometerReading) || 0;
    return age * 0.5 + mileage * 0.0001;
  };

  const adjustedFuelEfficiency = () => {
    const baseEfficiency = parseFloat(vehicleDetails.fuelEfficiency) || 0;
    return Math.max(0, baseEfficiency - calculateFuelEfficiencyDrop());
  };

  const calculateEngineEfficiency = () => Math.max(0, 100 - calculateVehicleAge() * 2);

  const brakeWear = calculateBrakeWear();
  const fuelEfficiency = adjustedFuelEfficiency();
  const engineEfficiency = calculateEngineEfficiency();
  const overallHealth = (
    0.4 * (100 - brakeWear) +
    0.3 * fuelEfficiency +
    0.3 * engineEfficiency
  ) / 1.0;

  const needsService =
    brakeWear > 40 || fuelEfficiency < 10 || engineEfficiency < 60 || overallHealth < 50;

  const getStatusColor = (value, type) => {
    if (type === 'brake') return value > 60 ? '#ff4d4d' : value > 20 ? '#ffd633' : '#4CAF50';
    return value < 40 ? '#ff4d4d' : value < 70 ? '#ffd633' : '#4CAF50';
  };

  const speakInsights = () => {
    const msg = new SpeechSynthesisUtterance();
    msg.text = `
      Brake wear is at ${brakeWear.toFixed(1)} percent.
      Fuel efficiency is ${fuelEfficiency.toFixed(1)} percent.
      Engine efficiency is ${engineEfficiency.toFixed(1)} percent.
      Overall vehicle health is ${overallHealth.toFixed(1)} percent.
      ${needsService ? "Attention: Your vehicle needs servicing." : "Good news: Your vehicle does not need servicing at this time."}
    `;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  };

  const downloadPDF = () => {
    const input = reportRef.current;
    html2canvas(input, { scale: 2, backgroundColor: '#040526', useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("vehicle_health_report.pdf");
    });
  };

  const checkTripFeasibility = () => {
    const { start, destination, startDate, returnDate, distance } = tripForm;
  
    // Check for empty fields
    if (!start || !destination || !startDate || !returnDate || !distance) {
      alert("Please fill in all trip details before checking feasibility!");
      return null; // Use `null` to indicate incomplete form
    }
  
    const tripDistance = parseFloat(distance);
    return (
      overallHealth > 50 ||
      (fuelEfficiency > 10 &&
      engineEfficiency > 60 &&
      brakeWear < 40 &&
      tripDistance < 1000)
    );
  };
  const startTrip = () => {
    if (!tripForm.start || !tripForm.destination || !tripForm.startDate || !tripForm.returnDate || !tripForm.distance) {
      alert("Please fill all trip details!");
      return;
    }
    const updatedTrips = [...myTrips, tripForm];
    setMyTrips(updatedTrips);
    localStorage.setItem('myTrips', JSON.stringify(updatedTrips)); // Save trips to local storage
    setTripForm({
      start: "",
      destination: "",
      startDate: "",
      returnDate: "",
      distance: ""
    });
    setTripFeasibility(null);
  };

  return (
    <div className="video-upload-container p-4">
    <div className="tab-buttons">
      <button
        onClick={() => setActiveTab("health")}
        className={`tab-btn ${activeTab === "health" ? "active" : ""}`}
      >
        🩺 Health Analysis
      </button>
      <button
        onClick={() => setActiveTab("trip")}
        className={`tab-btn ${activeTab === "trip" ? "active" : ""}`}
      >
        🧭 Trip Planner
      </button>
    </div>

      {activeTab === "health" && (
        <>
        <h2>Vehicle Health Analysis</h2>
          <h4 className="text-lg font-semibold mb-2 text-blue-900">Vehicle Info</h4>
          <ul className="mb-4 text-blue-900">
            <li><strong>Purchase Date:</strong> {vehicleDetails.purchaseDate}</li>
            <li><strong>Last Service:</strong> {vehicleDetails.serviceDate}</li>
            <li><strong>Engine Size:</strong> {vehicleDetails.engineSize} L</li>
            <li><strong>Odometer:</strong> {vehicleDetails.odometerReading} km</li>
            <li><strong>Fuel Efficiency:</strong> {vehicleDetails.fuelEfficiency} km/L</li>
          </ul>

          <div className="report bg-white text-black p-6 shadow rounded mb-6" ref={reportRef}>
            <h4 className="text-lg font-bold mb-4 text-blue-900">Vehicle Health Analytics Report</h4>
            <p className="text-blue-900"><strong>Days Since Last Service:</strong> {calculateDaysSinceService()} days</p>
            <p className="text-blue-900"><strong>Vehicle Age:</strong> {calculateVehicleAge()} years</p>
            <p className="text-blue-900"><strong>Brake Wear:</strong> {brakeWear.toFixed(1)}%</p>
            <p className="text-blue-900"><strong>Adjusted Fuel Efficiency:</strong> {fuelEfficiency.toFixed(1)} km/L</p>
            <p className="text-blue-900"><strong>Engine Efficiency:</strong> {engineEfficiency.toFixed(1)}%</p>
            <p className="text-blue-900"><strong>Consider servicing your vehicle if brake wear is greater than 40% or fuel efficiency is less than 10 or the engine efficiency is less than 60</strong></p>
            <p className={`p-3 mt-4 text-white font-semibold rounded shadow-lg text-center ${needsService ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`}>
              {needsService ? "🚨 Vehicle needs servicing." : "✅ Vehicle is in good condition."}
            </p>

            {needsService && (
              <div className="bg-red-100 text-red-900 mt-4 p-4 rounded shadow">
                <h5 className="font-bold mb-2">⚠ Components Needing Attention:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {brakeWear > 40 && <li>🔧 <strong>Brake Pads:</strong> {brakeWear.toFixed(1)}% wear.</li>}
                  {fuelEfficiency < 10 && <li>🛢️ <strong>Fuel System:</strong> Efficiency at {fuelEfficiency.toFixed(1)} km/L.</li>}
                  {engineEfficiency < 60 && <li>🛠️ <strong>Engine Check:</strong> Efficiency at {engineEfficiency.toFixed(1)}%.</li>}
                  {overallHealth < 50 && <li>📉 <strong>General Maintenance:</strong> Overall health is low.</li>}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
              {[{
                label: "Brake Wear",
                value: brakeWear,
                type: 'brake'
              }, {
                label: "Fuel Efficiency",
                value: fuelEfficiency,
                type: 'other'
              }, {
                label: "Engine Efficiency",
                value: engineEfficiency,
                type: 'other'
              }, {
                label: "Overall Health",
                value: overallHealth,
                type: 'other',
                fontBold: true
              }].map(({ label, value, type, fontBold }, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div style={{ width: 100, height: 100 }}>
                    <CircularProgressbar
                      value={value}
                      text={`${value.toFixed(1)}%`}
                      styles={buildStyles({
                        pathColor: getStatusColor(value, type),
                        textColor: 'black',
                        textSize: '18px'
                      })}
                    />
                  </div>
                  <p className={`text-sm ${fontBold ? 'font-bold' : ''} text-blue-900`}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={speakInsights} className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 transition-all">🔊 Speak Insights</button>
            <button onClick={downloadPDF} className="bg-green-600 text-white px-5 py-2 rounded shadow hover:bg-green-700 transition-all">📄 Download PDF</button>
          </div>
        </>
      )}

      {/* Trip Planner */}
      {activeTab === "trip" && (
          <div className="trip-planner-container">
            <h2 className="trip-title">Trip Planner</h2>
            <h4 className="section-title">Plan a New Trip</h4>

            <div className="trip-inputs">
              <input placeholder="Start Location" value={tripForm.start} onChange={(e) => setTripForm({ ...tripForm, start: e.target.value })} />
              <input placeholder="Destination" value={tripForm.destination} onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })} />
              <input type="date" value={tripForm.startDate} onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })} />
              <input type="date" value={tripForm.returnDate} onChange={(e) => setTripForm({ ...tripForm, returnDate: e.target.value })} />
              <input placeholder="Distance (km)" type="number" value={tripForm.distance} onChange={(e) => setTripForm({ ...tripForm, distance: e.target.value })} className="full-span" />
            </div>

            <div className="trip-buttons">
            <button
              onClick={() => {
                const result = checkTripFeasibility();
                if (result !== null) setTripFeasibility(result);
              }}
              className="check-btn"
            >
              ✅ Check Feasibility
            </button>
              <button onClick={startTrip} className="start-btn">🚗 Start Trip</button>
            </div>

            {tripFeasibility !== null && (
              <p className={`feasibility-msg ${tripFeasibility ? 'success' : 'error'}`}>
                {tripFeasibility ? "✅ Vehicle is fit for this trip." : "❌ Vehicle may not be in optimal condition for this trip."}
              </p>
            )}

            <h5 className="section-title">My Trips</h5>
            {myTrips.length === 0 ? (
              <p className="empty-state">No trips recorded yet.</p>
            ) : (
              <ul className="trip-list">
                {myTrips.map((trip, index) => (
                  <li key={index}>
                    {vehicleInfo.model} | {trip.start} ➡ {trip.destination} | {trip.startDate} to {trip.returnDate} | {trip.distance} km
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
    </div>
  );
};

export default VideoUpload;