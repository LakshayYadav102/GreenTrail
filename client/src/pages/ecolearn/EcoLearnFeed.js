import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; 
import "./EcoLearnFeed.css";
import CommentModal from "./CommentModal";

function EcoLearnFeed() {
  const videoRefs = useRef([]);
  const progressRefs = useRef({});
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [likingVideos, setLikingVideos] = useState(new Set());
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [muted, setMuted] = useState(true);
  const [showFeedback, setShowFeedback] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Track playback progress
  const [videoProgress, setVideoProgress] = useState({});
  // Toggle Fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  let currentUserId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload.userId || payload.id || payload._id;
    } catch (e) {
      console.error("Token decoding failed", e);
    }
  }

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/ecolearn/feed");
        setVideos(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Feed fetch error:", err);
        setError("Failed to load videos");
      }
    };
    fetchVideos();
  }, []);

  // Auto-play via Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setTimeout(() => {
              if (!video.paused && !video.ended) {
                api.post(`/ecolearn/view/${video.dataset.id}`).catch(() => {});
              }
            }, 3500);
          } else {
            video.pause();
            video.currentTime = 0; 
          }
        });
      },
      { threshold: 0.65 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => videoRefs.current.forEach((v) => v && observer.unobserve(v));
  }, [videos]);

  const handleVideoClick = (e) => {
    e.stopPropagation();
    setMuted((prevMuted) => {
      const willBeMuted = !prevMuted;
      setShowFeedback(willBeMuted ? "muted" : "unmuted");
      setTimeout(() => setShowFeedback(null), 1500);
      return willBeMuted;
    });
  };

  const handleTimeUpdate = (videoId, e) => {
    const video = e.target;
    const progress = (video.currentTime / video.duration) * 100;
    setVideoProgress(prev => ({ ...prev, [videoId]: progress }));
  };

  const handleProgressClick = (videoId, e) => {
    e.stopPropagation();
    const progressBar = progressRefs.current[videoId];
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    const videoElement = videoRefs.current.find(v => v && v.dataset.id === videoId);
    if (videoElement) {
      videoElement.currentTime = percentage * videoElement.duration;
    }
  };

  const handleLike = async (videoId) => {
    if (!token) return alert("Please login to like videos");
    if (likingVideos.has(videoId)) return;

    setLikingVideos((prev) => new Set([...prev, videoId]));
    const previousVideos = [...videos];

    setVideos((prev) =>
      prev.map((v) =>
        v._id === videoId
          ? {
              ...v,
              likesCount: v.userLiked ? v.likesCount - 1 : v.likesCount + 1,
              userLiked: !v.userLiked,
            }
          : v
      )
    );

    try {
      const res = await api.post(`/ecolearn/like/${videoId}`);
      const data = res.data;
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId
            ? { ...v, likesCount: data.totalLikes, userLiked: data.liked }
            : v
        )
      );
    } catch (err) {
      setVideos(previousVideos);
      alert("Failed to update like");
    } finally {
      setLikingVideos((prev) => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  const handleFollow = async (userId) => {
    if (!token) return alert("Please login to follow users");
    if (!userId) return;
    if (followingUsers.has(userId)) return;

    setFollowingUsers((prev) => new Set([...prev, userId]));
    const previousVideos = [...videos];

    setVideos((prev) =>
      prev.map((video) =>
        video.user?._id === userId
          ? {
              ...video,
              user: {
                ...video.user,
                followersCount: video.isFollowing
                  ? (video.user.followersCount || 0) - 1
                  : (video.user.followersCount || 0) + 1,
              },
              isFollowing: !video.isFollowing,
            }
          : video
      )
    );

    try {
      const res = await api.post(`/ecolearn/follow/${userId}`);
      const data = res.data;
      setVideos((prev) =>
        prev.map((video) =>
          video.user?._id === userId
            ? {
                ...video,
                user: { ...video.user, followersCount: data.followersCount },
                isFollowing: data.following,
              }
            : video
        )
      );
    } catch (err) {
      setVideos(previousVideos);
      alert("Failed to follow/unfollow");
    } finally {
      setFollowingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  return (
    <div className="ecolearn-app">
      
      {/* GLOBAL GREENVERSE HOME BUTTON */}
      <button className="el-global-home-btn" onClick={() => navigate("/")}>
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        GreenVerse
      </button>

      <main className="el-video-feed">
        {error && <div className="el-error-message">{error}</div>}

        {videos.length === 0 && !error && (
          <div className="el-empty-state">
            {/* 🟢 UPDATED EMPTY STATE TEXT */}
            <h2>No GreenStream videos yet 🌱</h2>
            <p>Be the first to share!</p>
          </div>
        )}

        {videos.map((video, index) => (
          <div key={video._id} className="el-video-container">
            
            {/* BOTTOM LEFT EXTERNAL INFO (Desktop Shorts Style) */}
            <div className={`el-desktop-bottom-left ${isFullscreen ? 'hidden' : ''}`}>
              <div className="el-user-row">
                <img 
                  className="el-avatar" 
                  src={video.user?.profilePic || "https://ui-avatars.com/api/?name=" + (video.user?.username || "Eco")} 
                  alt="Creator"
                  onClick={() => video.user?._id && navigate(`/ecolearn/creator/${video.user._id}`)}
                />
                <span 
                  className="el-username"
                  onClick={() => video.user?._id && navigate(`/ecolearn/creator/${video.user._id}`)}
                >
                  @{video.user?.username || "user"}
                </span>

                {video.user?._id && String(video.user._id) !== String(currentUserId) && (
                  <button
                    className={`el-subscribe-btn ${video.isFollowing ? "followed" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleFollow(video.user._id); }}
                    disabled={followingUsers.has(video.user._id)}
                  >
                    {followingUsers.has(video.user._id)
                      ? "..."
                      : video.isFollowing
                      ? "Following"
                      : "Subscribe"}
                  </button>
                )}
              </div>
              <p className="el-caption">
                {video.caption} <span className="el-tags">#{video.category}</span>
              </p>
            </div>

            {/* CENTER PLAYER WRAPPER */}
            <div className={`el-center-layout ${isFullscreen ? 'fullscreen-mode' : 'constrained-mode'}`}>
              
              {/* THE VIDEO BOX */}
              <div className="el-player-box">
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  data-id={video._id}
                  src={video.videoUrl}
                  className="el-video-element"
                  loop
                  muted={muted}
                  playsInline
                  onClick={handleVideoClick}
                  onTimeUpdate={(e) => handleTimeUpdate(video._id, e)}
                />

                {showFeedback && (
                  <div className="el-video-feedback">
                    {showFeedback === "muted" ? "🔇 Muted" : "🔊 Sound On"}
                  </div>
                )}

                {/* FULLSCREEN TOGGLE */}
                <button 
                  className="el-toggle-screen-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(!isFullscreen);
                  }}
                >
                  {isFullscreen ? (
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                  )}
                </button>

                {/* PROGRESS BAR */}
                <div 
                  className="el-progress-bar-container"
                  ref={el => progressRefs.current[video._id] = el}
                  onClick={(e) => handleProgressClick(video._id, e)}
                >
                  <div 
                    className="el-progress-bar-fill" 
                    style={{ width: `${videoProgress[video._id] || 0}%` }}
                  ></div>
                </div>

                {/* Mobile overlay info (only visible on small screens) */}
                <div className="el-mobile-overlay-info">
                  <div className="el-user-row">
                    <img src={video.user?.profilePic || "https://ui-avatars.com/api/?name=Eco"} alt="Creator" />
                    <span className="el-username">@{video.user?.username || "user"}</span>
                  </div>
                  <p className="el-caption">{video.caption}</p>
                </div>
              </div>

              {/* RIGHT SIDEBAR (Outside video box on desktop) */}
              <div className="el-right-sidebar">
                
                <button
                  className={`el-sidebar-btn ${video.userLiked ? "liked" : ""}`}
                  onClick={() => handleLike(video._id)}
                  disabled={likingVideos.has(video._id)}
                >
                  <div className="el-sidebar-icon-circle">
                    <svg 
                      fill={video.userLiked ? "#ff0050" : "rgba(255, 255, 255, 0.1)"} 
                      stroke={video.userLiked ? "#ff0050" : "currentColor"} 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <span className="el-sidebar-count">{video.likesCount ?? 0}</span>
                </button>

                <button
                  className="el-sidebar-btn"
                  onClick={() => setSelectedVideo(video._id)}
                >
                  <div className="el-sidebar-icon-circle">
                    <svg fill="rgba(255, 255, 255, 0.1)" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.36 5.47.22.215.344.51.344.814v2.793c0 .59.652.95 1.146.611l3.24-2.222A8.961 8.961 0 0012 20.25z" />
                    </svg>
                  </div>
                  <span className="el-sidebar-count">{video.comments?.length || 0}</span>
                </button>

              </div>

            </div>

          </div>
        ))}
      </main>

      <CommentModal
        videoId={selectedVideo}
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}

export default EcoLearnFeed;