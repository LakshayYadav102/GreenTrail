import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoLearnExplore.css";

const categories = ["All", "Waste", "Energy", "Climate", "Food", "DIY", "Travel"];

function EcoLearnExplore() {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortType, setSortType] = useState("latest");
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, sortType]);

  const fetchVideos = async () => {
    try {
      let url = `http://localhost:5000/api/ecolearn/explore?`;

      if (selectedCategory !== "All") {
        url += `category=${selectedCategory}&`;
      }

      if (sortType === "trending") {
        url += `sort=trending`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setVideos(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Smart feature: Pause all other videos when one is played
  const handlePlay = (e) => {
    const currentVideo = e.target;
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(v => {
      if (v !== currentVideo) {
        v.pause();
      }
    });
  };

  return (
    // Added paddingBottom so the floating navbar doesn't cover the last row of videos
    <div className="explore-container" style={{ paddingBottom: "100px" }}>

      {/* 🔎 Sort Toggle */}
      <div className="sort-toggle">
        <button
          className={sortType === "latest" ? "active" : ""}
          onClick={() => setSortType("latest")}
        >
          Latest
        </button>
        <button
          className={sortType === "trending" ? "active" : ""}
          onClick={() => setSortType("trending")}
        >
          Trending
        </button>
      </div>

      {/* 📂 Categories */}
      <div className="category-row">
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "category active" : "category"}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🎥 Video Grid */}
      <div className="video-grid">
        {videos.length === 0 && (
          <p style={{ textAlign: "center", width: "100%", color: "#aaa", gridColumn: "1 / -1" }}>
            No videos found.
          </p>
        )}
        
        {videos.map((video) => (
          <div key={video._id} className="video-card">
            <video
              src={video.videoUrl}
              controls             // <-- Added controls so users can interact
              preload="metadata"   // <-- Saves bandwidth
              onPlay={handlePlay}  // <-- Prevents overlapping audio
              className="explore-video"
              style={{ width: "100%", height: "220px", objectFit: "cover", backgroundColor: "#000" }}
            />
            <div className="video-info">
              <p 
                style={{ cursor: "pointer", textDecoration: "underline" }} 
                onClick={() => navigate(`/ecolearn/creator/${video.user?._id}`)}
              >
                @{video.user?.username}
              </p>
              <span>{video.views} views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EcoLearnExplore;