import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./EcoLearnUpload.css";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function EcoLearnUpload() {
  const navigate = useNavigate();

  const [videoFile,   setVideoFile]   = useState(null);
  const [previewUrl,  setPreviewUrl]  = useState("");
  const [caption,     setCaption]     = useState("");
  const [category,    setCategory]    = useState("Waste");
  const [loading,     setLoading]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg,    setErrorMsg]    = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size before doing anything
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      setVideoFile(null);
      setPreviewUrl("");
      return;
    }

    setErrorMsg("");
    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!videoFile) {
      setErrorMsg("Please select a video file.");
      return;
    }
    if (!caption.trim()) {
      setErrorMsg("Please enter a caption.");
      return;
    }

    const formData = new FormData();
    formData.append("video",    videoFile);
    formData.append("caption",  caption.trim());
    formData.append("category", category);

    try {
      setLoading(true);
      setUploadProgress(0);

      await api.post("/ecolearn/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 minutes — enough for large video uploads to Cloudinary
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(pct);
          }
        },
      });

      alert("Video uploaded successfully! You earned 2 ICT 🌿");
      navigate("/ecolearn/feed");

    } catch (error) {
      console.error("Upload error:", error);
      if (error.code === "ECONNABORTED") {
        setErrorMsg("Upload timed out. Please try a smaller video file (under 50MB) or check your internet connection.");
      } else {
        setErrorMsg(error.response?.data?.message || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="ecolearn-standalone-header">
        <h2 onClick={() => navigate("/ecolearn/feed")} style={{ cursor: "pointer" }}>
          EcoLearn
        </h2>
      </div>

      <div className="upload-container">
        <h2>Upload Eco Video 🌱</h2>

        {errorMsg && (
          <div style={{
            background: "rgba(211,47,47,0.15)",
            border: "1px solid #d32f2f",
            borderRadius: "8px",
            padding: "12px 16px",
            color: "#ff5252",
            marginBottom: "16px",
            fontSize: "0.9rem"
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">

          <div style={{ marginBottom: "12px" }}>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={loading}
            />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "6px 0 0" }}>
              Max file size: {MAX_FILE_SIZE_MB}MB · Supported: MP4, MOV, AVI, WebM
            </p>
            {videoFile && (
              <p style={{ color: "#69f0ae", fontSize: "0.8rem", margin: "4px 0 0" }}>
                ✅ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)}MB)
              </p>
            )}
          </div>

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
            disabled={loading}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="Waste">Waste</option>
            <option value="Energy">Energy</option>
            <option value="Climate">Climate</option>
            <option value="Food">Food</option>
            <option value="DIY">DIY</option>
            <option value="Travel">Travel</option>
          </select>

          {/* Progress bar — only visible while uploading */}
          {loading && (
            <div style={{ margin: "12px 0" }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontSize: "0.85rem",
                color: "#fff"
              }}>
                <span>
                  {uploadProgress < 100
                    ? "Uploading to Cloudinary..."
                    : "Processing video..."}
                </span>
                <span style={{ color: "#69f0ae", fontWeight: "700" }}>
                  {uploadProgress}%
                </span>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "8px",
                height: "10px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#00c853,#69f0ae)",
                  borderRadius: "8px",
                  transition: "width 0.3s ease"
                }} />
              </div>
              {uploadProgress === 100 && (
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", marginTop: "6px" }}>
                  100% uploaded — waiting for Cloudinary to process the video. This may take a moment...
                </p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading || !videoFile}>
            {loading
              ? uploadProgress < 100
                ? `Uploading... ${uploadProgress}%`
                : "Processing..."
              : "Upload Video"}
          </button>

        </form>
      </div>
    </>
  );
}

export default EcoLearnUpload;