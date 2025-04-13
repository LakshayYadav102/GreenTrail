import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Container, Button, Spinner, Alert, Form } from "react-bootstrap";
import "./BlogDetails.css";

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        const storedUserId = localStorage.getItem("userId");
        setBlog(response.data);
        setHasLiked(response.data.likedBy.includes(storedUserId));
        setUserId(storedUserId);
      } catch (error) {
        setError("Error fetching blog.");
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
        window.location.href = "/login";
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/blogs/${id}/like`,
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
        window.location.href = "/login";
      }
      console.error("Error liking blog:", error);
    }
  };

  const handleComment = async () => {
    if (!comment) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/comment`,
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

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;

  return (
    <Container className="blog-detail-container">
      {blog && (
        <>
          <article className="blog-article">
            <header className="article-header">
              <h1>{blog.title}</h1>
              <div className="author-info">
                <div className="author-meta">
                  <span>By {blog.author?.username || "Eco Warrior"}</span>
                  <span>{format(new Date(blog.createdAt), "MMM dd, yyyy • h:mm a")}</span>
                </div>
                <div className="article-stats">
                  <span>❤️ {blog.likes} Likes</span>
                  <span>👁️ {blog.views} Views</span>
                </div>
              </div>
            </header>

            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            <div className="interaction-section">
              <Button 
                variant={hasLiked ? "danger" : "outline-danger"} 
                onClick={handleLike}
                disabled={hasLiked}
              >
                {hasLiked ? "❤️ Liked" : "❤️ Like"} ({blog.likes})
              </Button>
            </div>
          </article>

          <section className="comments-section">
            <h3>💬 Comments ({blog.comments.length})</h3>
            
            <Form className="comment-form">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button onClick={handleComment} className="mt-3">
                Post Comment
              </Button>
            </Form>

            <div className="comment-list">
              {blog.comments.map((c, index) => (
                <div key={index} className="comment-card">
                  <div className="comment-header">
                    <strong>{c.user?.username || "Anonymous"}</strong>
                    <span>{format(new Date(c.timestamp), "MMM dd, yyyy")}</span>
                  </div>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </Container>
  );
};

export default BlogDetails;