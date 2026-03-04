import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Spinner, Alert } from "react-bootstrap";
import "./BlogDetails.css";

const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to generate beautiful initial-based avatars
const generateAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Eco')}&background=2ecc71&color=fff&bold=true&rounded=true`;
};

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/blogs/${id}`);
        const storedUserId = localStorage.getItem("userId");
        setBlog(response.data);
        setHasLiked(response.data.likedBy.includes(storedUserId));
      } catch (error) {
        setError("Error fetching blog. It might have been deleted.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.put(
        `${apiBaseUrl}/api/blogs/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlog(prev => ({
        ...prev,
        likes: response.data.likes,
        likedBy: response.data.likedBy
      }));
      setHasLiked(true);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${apiBaseUrl}/api/blogs/${id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBlog(prev => ({
        ...prev,
        comments: [...prev.comments, response.data.comment]
      }));
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <div className="gt-bd-loader"><Spinner animation="border" variant="success" /></div>;
  if (error) return <Alert variant="danger" className="text-center m-5">{error}</Alert>;

  const authorName = blog.author?.username || "Eco Warrior";

  return (
    <div className="gt-bd-wrapper">
      {blog && (
        <main className="gt-bd-container">
          
          <button className="gt-bd-back-link" onClick={() => navigate("/blogs")}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Community
          </button>

          <article className="gt-bd-article">
            <header className="gt-bd-header">
              <h1 className="gt-bd-title">{blog.title}</h1>
              
              <div className="gt-bd-meta-bar">
                <div className="gt-bd-author-group">
                  {/* Replaced broken image with dynamic avatar generator */}
                  <img src={generateAvatar(authorName)} alt="Author" className="gt-bd-avatar" />
                  <div className="gt-bd-details">
                    <span className="gt-bd-name">{authorName}</span>
                    <span className="gt-bd-date">
                      {format(new Date(blog.createdAt), "MMM dd, yyyy")} · {blog.views} Views
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Premium Cover Image matching the list page */}
            <div className="gt-bd-cover-wrapper">
               <img 
                  src={`https://picsum.photos/seed/${blog._id}/1200/600`} 
                  alt="Article Cover" 
                  className="gt-bd-cover-image" 
                />
            </div>

            <div 
              className="gt-bd-body"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            
            <div className="gt-bd-footer-actions">
              <button 
                className={`gt-bd-huge-like-btn ${hasLiked ? 'liked' : ''}`} 
                onClick={handleLike}
                disabled={hasLiked}
              >
                <svg className="gt-like-svg" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                {hasLiked ? "Liked" : "Applaud this story"} ({blog.likes})
              </button>
            </div>
          </article>

          <hr className="gt-bd-divider" />

          {/* Comments Section */}
          <section className="gt-bd-comments-section">
            <h3 className="gt-bd-comments-title">Responses ({blog.comments.length})</h3>
            
            <form className="gt-bd-comment-form" onSubmit={handleComment}>
              <textarea
                className="gt-bd-comment-input"
                rows="3"
                placeholder="What are your thoughts?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
              <div className="gt-bd-comment-submit-row">
                <button type="submit" className="gt-bd-comment-btn">Respond</button>
              </div>
            </form>

            <div className="gt-bd-comments-list">
              {blog.comments.map((c, index) => {
                const commentAuthor = c.user?.username || "Anonymous";
                return (
                  <div key={index} className="gt-bd-comment-bubble">
                    <div className="gt-bd-comment-header">
                      <img src={generateAvatar(commentAuthor)} alt="User" className="gt-bd-avatar-small" />
                      <div>
                        <strong className="gt-bd-comment-author">{commentAuthor}</strong>
                        <span className="gt-bd-comment-date">{format(new Date(c.timestamp), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                    <p className="gt-bd-comment-text">{c.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      )}
    </div>
  );
};

export default BlogDetails;