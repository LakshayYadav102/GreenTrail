import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
import "./BlogList.css";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blogs");
        setBlogs(response.data);
      } catch (error) {
        setError("Error fetching blogs. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Alert variant="danger" className="text-center">{error}</Alert>;

  return (
    <Container className="blog-list-container">
      <div className="blog-header">
        <h1>Eco Community Blogs</h1>
        <Link to="/blogs/create" className="create-blog-btn">
          ✍️ Write New Post
        </Link>
      </div>

      {loading && <Spinner animation="border" className="blog-spinner" />}

      {!loading && blogs.length === 0 ? (
        <div className="no-blogs">
          <h3>No posts yet. Be the first to share!</h3>
        </div>
      ) : (
        <div className="blog-grid">
          {blogs.map((blog) => (
            <Card key={blog._id} className="blog-card">
              <Card.Body>
                <Card.Title>{blog.title}</Card.Title>
                <div className="blog-meta">
                  <span>By {blog.author?.username || "Eco Warrior"}</span>
                  <span>{format(new Date(blog.createdAt), "MMM dd, yyyy")}</span>
                </div>
                <Card.Text className="blog-excerpt">
                  {blog.content.substring(0, 150).replace(/<[^>]+>/g, '')}...
                </Card.Text>
                <div className="blog-stats">
                  <span>❤️ {blog.likes}</span>
                  <span>💬 {blog.comments?.length || 0}</span>
                </div>
                <Link to={`/blogs/${blog._id}`} className="read-more-btn">
                  Read Full Article →
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};
export default BlogList;
