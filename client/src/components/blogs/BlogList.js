import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Spinner, Alert } from "react-bootstrap";
import "./BlogList.css";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/blogs`);
        setBlogs(response.data);
      } catch (error) {
        setError("Error fetching blogs. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [apiBaseUrl]);

  if (loading) return (
    <div className="gt-premium-loader">
      <div className="gt-premium-spinner"></div>
      <p>Loading Eco Journal...</p>
    </div>
  );
  
  if (error) return <Alert variant="danger" className="text-center m-4">{error}</Alert>;

  return (
    <div className="gt-premium-blog-page">
      
      {/* High-End Animated Hero Section */}
      <section className="gt-premium-hero">
        <div className="gt-hero-glow"></div>
        <div className="gt-premium-hero-content">
          <span className="gt-hero-badge">GreenVerse Community</span>
          <h1 className="gt-hero-title">The Eco Journal</h1>
          <p className="gt-hero-subtitle">
            Discover insights, stories, and breakthroughs in sustainability from eco-warriors around the globe.
          </p>
          <Link to="/blogs/create" className="gt-hero-create-btn">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Write a Story
          </Link>
        </div>
      </section>

      {/* Blog Grid Layout */}
      <div className="gt-premium-container">
        {blogs.length === 0 ? (
          <div className="gt-premium-empty">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
            <h3>No stories published yet</h3>
            <p>Be the first to share your journey with the community.</p>
          </div>
        ) : (
          <div className="gt-premium-grid">
            {blogs.map((blog, index) => (
              <div 
                key={blog._id} 
                className="gt-premium-card" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Dynamically generated beautiful cover image based on Blog ID */}
                <div className="gt-card-image-wrapper">
                  <img 
                    src={`https://picsum.photos/seed/${blog._id}/600/400`} 
                    alt="Blog Cover" 
                    className="gt-card-cover-image" 
                  />
                  <div className="gt-card-author-pill">
                    <img src="/default-avatar.png" alt="Author" className="gt-author-avatar-small" />
                    <span>{blog.author?.username || "Eco Warrior"}</span>
                  </div>
                </div>

                <div className="gt-card-content">
                  <div className="gt-card-meta">
                    <span className="gt-date">{format(new Date(blog.createdAt), "MMM dd, yyyy")}</span>
                  </div>
                  
                  <Link to={`/blogs/${blog._id}`} className="gt-card-title-link">
                    <h2 className="gt-card-title">{blog.title}</h2>
                  </Link>
                  
                  <p className="gt-card-excerpt">
                    {blog.content.substring(0, 140).replace(/<[^>]+>/g, '')}...
                  </p>
                </div>
                
                <div className="gt-card-footer">
                  <div className="gt-card-stats">
                    <div className="gt-stat-item heart">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      <span>{blog.likes}</span>
                    </div>
                    <div className="gt-stat-item comment">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                      <span>{blog.comments?.length || 0}</span>
                    </div>
                  </div>
                  <Link to={`/blogs/${blog._id}`} className="gt-read-more-arrow">
                    Read <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;