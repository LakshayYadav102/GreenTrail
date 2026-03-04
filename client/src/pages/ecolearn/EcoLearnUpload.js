import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./EcoLearnUpload.css";

function EcoLearnUpload() {
  const navigate = useNavigate();

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

      await api.post("/ecolearn/upload", formData);

      alert("Video uploaded successfully!");
      navigate("/ecolearn/feed");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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