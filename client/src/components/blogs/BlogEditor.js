import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./BlogEditor.css";

const BlogEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isPublishing, setIsPublishing] = useState(false);
  const quillRef = useRef(null);
  const navigate = useNavigate();

  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || content === "<p><br></p>") {
      setMessage({ type: "danger", text: "Title and content cannot be empty." });
      return;
    }

    setIsPublishing(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${apiBaseUrl}/api/blogs/create`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: "Story published successfully! Redirecting..." });
      setTimeout(() => navigate("/blogs"), 1500);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setMessage({ type: "danger", text: error.response?.data?.message || "Error publishing blog" });
      setIsPublishing(false);
    }
  };

  return (
    <div className="gt-be-wrapper">
      <div className="gt-be-container">
        
        <header className="gt-be-topbar">
          <div className="gt-be-brand">
            <button type="button" className="gt-be-cancel" onClick={() => navigate("/blogs")}>Cancel</button>
            <span className="gt-be-status">Draft in GreenVerse</span>
          </div>
          <button 
            type="button" 
            className="gt-be-publish-btn" 
            onClick={handleSubmit}
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "Publish Story"}
          </button>
        </header>

        {message.text && (
          <Alert variant={message.type} className="mt-3 mb-4">{message.text}</Alert>
        )}

        <form id="gt-blogForm" className="gt-be-form">
          <input
            type="text"
            className="gt-be-title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="gt-be-quill">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              placeholder="Tell your story..."
              modules={{
                toolbar: [
                  [{ header: [1, 2, false] }],
                  ["bold", "italic", "blockquote"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"]
                ]
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEditor;