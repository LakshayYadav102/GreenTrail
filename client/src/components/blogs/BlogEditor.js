import React, { useState, useRef } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import "./BlogEditor.css";

const BlogEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const quillRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/blogs/create",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage("Blog published successfully!");
      setTimeout(() => window.location.href = "/blogs", 1500);
    } catch (error) {
      if(error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      setMessage(error.response?.data?.message || "Error publishing blog");
    }
  };

  return (
    <Container className="editor-container">
      <div className="editor-header">
        <h1>Create New Post</h1>
        <Button type="submit" form="blogForm" className="publish-btn">
          Publish
        </Button>
      </div>

      {message && <Alert variant={message.includes("success") ? "success" : "danger"}>{message}</Alert>}

      <Form id="blogForm" onSubmit={handleSubmit}>
        <Form.Group className="title-group">
          <Form.Control
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={10}
          />
        </Form.Group>

        <Form.Group className="content-group">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"]
              ]
            }}
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default BlogEditor;