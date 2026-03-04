import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./CommentModal.css";

function CommentModal({ videoId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !videoId) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/ecolearn/feed");
        const video = res.data.find((v) => v._id === videoId);
        setComments(video?.comments || []);
      } catch (err) {
        console.error(err);
        setError("Couldn't load comments");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [isOpen, videoId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post(`/ecolearn/comment/${videoId}`, {
        text: text.trim()
      });

      if (res.data.success) {
        setComments(res.data.comments || []);
        setText("");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to post comment");
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