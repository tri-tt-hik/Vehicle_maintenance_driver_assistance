import React, { useState } from "react";
import axios from "axios";
import "../styles/Detection.css"; // Importing the CSS file

function Detection() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!videoFile) {
      setMessage("Please select a video file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      setUploading(true);
      setMessage("Uploading and processing...");

      const res = await axios.post("http://localhost:8000/api/detect-upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Video uploaded and processed successfully!");
    } catch (err) {
      setMessage("Upload failed. Check console.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="detection-container">
      <h2 className="detection-title">Vehicle Detection</h2>

      <input
        type="file"
        accept="video/*"
        onChange={handleVideoChange}
        className="detection-file"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="detection-button"
      >
        {uploading ? "Processing..." : "Upload & Detect"}
      </button>

      {message && <div className="detection-message">{message}</div>}
    </div>
  );
}

export default Detection;
