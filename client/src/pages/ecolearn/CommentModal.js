import React, { useEffect, useState } from "react";
import "./CommentModal.css";

function CommentModal({ videoId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isOpen || !videoId) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:5000/api/ecolearn/feed", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to load feed");

        const data = await res.json();
        const video = data.find((v) => v._id === videoId);

        setComments(video?.comments || []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("Couldn't load comments");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isOpen, videoId, token]);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/ecolearn/comment/${videoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: text.trim() }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to post comment");
      }

      const responseData = await res.json();

      if (responseData.success) {
        setComments(responseData.comments || []);
        setText("");
      }
    } catch (err) {
      console.error("Post comment error:", err);
      setError(err.message || "Failed to post comment");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-header">
          <h3>Comments</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="comment-list">
          {loading && <div className="loading">Loading comments...</div>}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && comments.length === 0 && (
            <p className="no-comments">No comments yet. Be the first! 🌱</p>
          )}

          {comments.map((c, index) => (
            <div key={c._id || index} className="comment-item">
              <strong>@{c.user?.username || "anonymous"}</strong>
              <p>{c.text}</p>
              {c.createdAt && (
                <small>{new Date(c.createdAt).toLocaleString()}</small>
              )}
            </div>
          ))}
        </div>

        <div className="comment-input-area">
          <input
            type="text"
            placeholder="Add a thoughtful comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;