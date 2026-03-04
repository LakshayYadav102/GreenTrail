import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Centralized API instance
import "./EcoLearnFeed.css";
import CommentModal from "./CommentModal";

function EcoLearnFeed() {
  const videoRefs = useRef([]);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [likingVideos, setLikingVideos] = useState(new Set());
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [muted, setMuted] = useState(true);
  const [showFeedback, setShowFeedback] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Decode Token to get current logged-in user ID
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
        // CLEANED FOR HOSTING: Replaced native fetch with api instance
        const res = await api.get("/ecolearn/feed");
        setVideos(res.data || []);
        setError(null);
      } catch (err) {
        console.error("Feed fetch error:", err);
        setError("Failed to load videos");
      }
    };
    fetchVideos();
  }, []); // Removed token dependency as it's handled globally by interceptor

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
            setTimeout(() => {
              if (!video.paused && !video.ended) {
                // CLEANED FOR HOSTING: Track views via api service
                api.post(`/ecolearn/view/${video.dataset.id}`).catch(() => {});
              }
            }, 3500);
          } else {
            video.pause();
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

  const handleLike = async (videoId) => {
    if (!token) return alert("Please login to like videos");
    if (likingVideos.has(videoId)) return;

    setLikingVideos((prev) => new Set([...prev, videoId]));
    const previousVideos = [...videos];

    // Optimistic UI Update
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
      // CLEANED FOR HOSTING
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
      console.error("Like error:", err);
      setVideos(previousVideos); // Revert on failure
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
    if (!userId) return alert("Cannot follow - missing user ID");
    if (followingUsers.has(userId)) return;

    setFollowingUsers((prev) => new Set([...prev, userId]));
    const previousVideos = [...videos];

    // Optimistic UI Update
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
      // CLEANED FOR HOSTING
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
      console.error("[Follow] Error:", err);
      setVideos(previousVideos); // Revert on failure
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
      <header className="ecolearn-top-header">
        <h2>EcoLearn</h2>
      </header>

      <main className="video-feed">
        {error && <div className="error-message">{error}</div>}

        {videos.length === 0 && !error && (
          <div className="empty-state">
            <h2>No eco videos yet 🌱</h2>
            <p>Be the first to share!</p>
          </div>
        )}

        {videos.map((video) => (
          <div key={video._id} className="video-container">
            <video
              ref={(el) => el && videoRefs.current.push(el)}
              data-id={video._id}
              src={video.videoUrl}
              className="fullscreen-video"
              loop
              muted={muted}
              playsInline
              onClick={handleVideoClick}
            />

            {showFeedback && (
              <div className="video-feedback">
                {showFeedback === "muted" ? "🔇 Muted" : "🔊 Sound On"}
              </div>
            )}

            <div className="video-overlay">
              <div className="caption-area">
                <h3>{video.caption}</h3>
                <p className="tags">#{video.category}</p>
              </div>

              <div className="right-side-actions">
                <button
                  className={`action-btn ${likingVideos.has(video._id) ? "liking" : ""}`}
                  onClick={() => handleLike(video._id)}
                  disabled={likingVideos.has(video._id)}
                >
                  <span className="icon">{video.userLiked ? "❤️" : "🤍"}</span>
                  <span className="count">{video.likesCount ?? 0}</span>
                </button>

                <button
                  className="action-btn"
                  onClick={() => setSelectedVideo(video._id)}
                >
                  <span className="icon">💬</span>
                  <span className="count">{video.comments?.length || 0}</span>
                </button>
              </div>

              <div className="bottom-user-info">
                <span
                  className="username clickable"
                  onClick={() => {
                    if (video.user?._id) {
                      navigate(`/ecolearn/creator/${video.user._id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (video.user?._id) {
                        navigate(`/ecolearn/creator/${video.user._id}`);
                      }
                    }
                  }}
                >
                  @{video.user?.username || "user"}
                </span>

                {/* HIDE FOLLOW BUTTON IF VIDEO BELONGS TO CURRENT LOGGED IN USER */}
                {video.user?._id && String(video.user._id) !== String(currentUserId) && (
                  <button
                    className={`follow-btn ${
                      followingUsers.has(video.user._id)
                        ? "following"
                        : video.isFollowing
                        ? "followed"
                        : ""
                    }`}
                    onClick={() => handleFollow(video.user._id)}
                    disabled={followingUsers.has(video.user._id)}
                  >
                    {followingUsers.has(video.user._id)
                      ? "Processing..."
                      : video.isFollowing
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
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