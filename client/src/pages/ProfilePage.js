import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import "./ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    username: "",
    mobile: "",
    dob: "",
    address: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setUpdatedUser({
        username: response.data.username,
        mobile: response.data.mobile || "",
        dob: response.data.dob ? response.data.dob.split("T")[0] : "",
        address: response.data.address || "",
      });
      setProfilePic(response.data.profilePic);
    } catch (error) {
      setError("Failed to fetch profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/profile", updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccessMessage("Profile updated successfully!");
      fetchUserProfile();
    } catch (error) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("userId", localStorage.getItem("userId"));

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:5000/api/profile/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setProfilePic(response.data.profilePic);
      setSuccessMessage("Profile picture updated!");
      fetchUserProfile();
    } catch (error) {
      setError("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;

  return (
    <Container className="profile-container">
      <div className="profile-header">
        <h2 className="profile-title">User Profile</h2>
        {error && <Alert variant="danger" className="alert-pop">{error}</Alert>}
        {successMessage && <Alert variant="success" className="alert-pop">{successMessage}</Alert>}
      </div>

      <Card className="profile-card glassmorphism">
        <Card.Body className="profile-body">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                src={profilePic ? `http://localhost:5000${profilePic}` : "/default-avatar.png"}
                alt="Profile"
                className="profile-pic"
              />
              <label className="upload-overlay">
                {uploading ? (
                  <div className="upload-spinner">
                    <Spinner animation="border" variant="light" />
                  </div>
                ) : (
                  <>
                    <span className="upload-icon">📷</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfilePicUpload} 
                      className="d-none" 
                    />
                  </>
                )}
              </label>
            </div>
            <p className="avatar-instruction">Click to update photo</p>
          </div>

          <Form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-grid">
              <Form.Group className="form-group">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={updatedUser.username}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile"
                  value={updatedUser.mobile}
                  onChange={handleChange}
                  className="form-input"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control 
                  type="date" 
                  name="dob" 
                  value={updatedUser.dob} 
                  onChange={handleChange} 
                  className="form-input"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Address</Form.Label>
                <Form.Control 
                  as="textarea" 
                  name="address" 
                  value={updatedUser.address} 
                  onChange={handleChange} 
                  className="form-input"
                  rows={3}
                />
              </Form.Group>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="save-button"
              disabled={loading}
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Save Changes'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfilePage;