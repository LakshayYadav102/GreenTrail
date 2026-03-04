import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoLearnUpload.css";

function EcoLearnUpload() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [videoFile, setVideoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("Waste");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile || !caption) {
      alert("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("caption", caption);
    formData.append("category", category);

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/ecolearn/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Video uploaded successfully!");
        navigate("/ecolearn/feed");
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CUSTOM UPLOAD HEADER */}
      <div className="ecolearn-standalone-header">
        <h2 onClick={() => navigate("/ecolearn/feed")} style={{cursor: 'pointer'}}>EcoLearn</h2>
      </div>

      <div className="upload-container">
        <h2>Upload Eco Video 🌱</h2>

        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
          />

          {previewUrl && (
            <video
              src={previewUrl}
              autoPlay
              loop
              muted
              playsInline
              className="preview-video"
            />
          )}

          <input
            type="text"
            placeholder="Enter caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Waste">Waste</option>
            <option value="Energy">Energy</option>
            <option value="Climate">Climate</option>
            <option value="Food">Food</option>
            <option value="DIY">DIY</option>
            <option value="Travel">Travel</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </>
  );
}

export default EcoLearnUpload;