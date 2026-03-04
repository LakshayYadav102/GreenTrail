import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api"; // Updated to use central api
import "./CreatorProfile.css";

function CreatorProfile() {
  const { userId } = useParams();
  const [creator, setCreator] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const token = localStorage.getItem("token");

  // Determine current user ID to check if viewing own profile
  let currentUserId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.userId || payload.id || payload._id;
    } catch (e) {
      console.error("Token decoding failed", e);
    }
  }
  
  const isOwnProfile = String(currentUserId) === String(userId);

  useEffect(() => {
    const fetchCreator = async () => {
      if (!userId) {
        setError("Missing user ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Updated to use the api instance. 
        // Token headers are automatically attached by the interceptor.
        const res = await api.get(`/ecolearn/creator/${userId}`);

        const data = res.data;

        if (!data.creator) {
          throw new Error("No creator data returned from server");
        }

        setCreator(data.creator);
        setIsFollowing(data.creator.isFollowing || false); 
        setVideos(data.videos || []);
      } catch (err) {
        console.error("Failed to load creator profile:", err);
        setError(err.response?.data?.message || err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCreator();
  }, [userId]); // Removed token dependency as it's handled globally

  const handleFollowClick = async () => {
    if (!token) return alert("Please log in to follow users");
    
    try {
      setFollowLoading(true);
      
      // Updated to use api instance
      const res = await api.post(`/ecolearn/follow/${userId}`);
      
      const data = res.data;

      setIsFollowing(data.following);
      setCreator((prev) => ({
        ...prev,
        followersCount: data.followersCount
      }));

    } catch (err) {
      console.error("Follow error:", err);
      alert("Failed to follow user");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to completely delete this video?")) return;
    
    try {
      // Updated to use api instance
      const res = await api.delete(`/ecolearn/video/${videoId}`);
      
      if (res.status === 200 || res.status === 204) { // Axios standard ok statuses
        // Remove video from UI instantly
        setVideos((prev) => prev.filter(v => v._id !== videoId));
      } else {
        alert(res.data?.message || "Failed to delete video");
      }
    } catch (err) {
      console.error("Delete Error", err);
      alert(err.response?.data?.message || "Server error while deleting video.");
    }
  };

  if (loading) return <div className="creator-loading">Loading profile...</div>;
  if (error) return <div className="creator-error">Error: {error}</div>;
  if (!creator) return <div className="creator-not-found">Creator not found</div>;

  return (
    <div className="creator-container" style={{ paddingBottom: "100px" }}>
      <div className="creator-header">
        <h2>@{creator.username || "Unknown user"}</h2>

        <div className="creator-stats">
          <span>{creator.followersCount ?? 0} Followers</span>
          <span>{creator.followingCount ?? 0} Following</span>
        </div>

        {/* HIDE BUTTON IF IT IS OUR OWN PROFILE */}
        {!isOwnProfile && (
          <button
            className={`creator-follow-btn ${isFollowing ? "following" : ""}`}
            onClick={handleFollowClick}
            disabled={!token || followLoading}
          >
            {followLoading ? "Processing..." : isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      <div className="creator-video-grid">
        {videos.length === 0 ? (
          <p style={{textAlign: 'center', gridColumn: '1 / -1', padding: '60px 0', color: '#888'}}>
            No approved videos yet.
          </p>
        ) : (
          videos.map((video) => (
            <div key={video._id} className="creator-video-card">
              <div style={{ position: "relative" }}>
                <video
                  src={video.videoUrl}
                  muted
                  playsInline
                  controls
                  preload="metadata"
                />
                
                {/* DELETE BUTTON - ONLY SHOWS ON OWN PROFILE */}
                {isOwnProfile && (
                  <button 
                    className="eco-delete-btn" 
                    onClick={() => handleDeleteVideo(video._id)}
                    title="Delete Video"
                  >
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="video-caption">{video.caption || ""}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CreatorProfile;