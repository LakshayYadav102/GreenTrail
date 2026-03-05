import React, { useState, useEffect } from "react";
import api from "../services/api"; 
import { Container, Form, Button, Card, Spinner, Alert, Row, Col } from "react-bootstrap";
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
      const response = await api.get("/profile");

      setUser(response.data);
      setUpdatedUser({
        username: response.data.username || "",
        mobile: response.data.mobile || "",
        dob: response.data.dob ? response.data.dob.split("T")[0] : "",
        address: response.data.address || "",
      });
      setProfilePic(response.data.profilePic);
    } catch (error) {
      setError("Failed to fetch profile.");
      console.error("Profile fetch error:", error);
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
      await api.put("/profile", updatedUser);
      setSuccessMessage("Profile updated successfully!");
      fetchUserProfile();
    } catch (error) {
      setError("Failed to update profile.");
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setUploading(true);
      
      // 🟢 FIX: Removed the manual headers so Axios can set the boundary automatically!
      const response = await api.post("/profile/upload", formData);
      
      setProfilePic(response.data.profilePic);
      setSuccessMessage("Profile picture updated!");
      
      window.dispatchEvent(new Event('storage'));
      
      fetchUserProfile();
    } catch (error) {
      setError("Failed to upload profile picture.");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5 text-success" />;

  return (
    <div className="gv-profile-page-wrapper">
      <Container className="gv-profile-container">
        <div className="gv-profile-header text-center mb-4">
          <h2 className="gv-profile-title">Your Profile</h2>
          {error && <Alert variant="danger" className="alert-pop">{error}</Alert>}
          {successMessage && <Alert variant="success" className="alert-pop">{successMessage}</Alert>}
        </div>

        <Card className="gv-profile-card glassmorphism mb-4 text-center border-success w-100">
          <Card.Body>
            <h4 className="gv-greencoin-title">
              <span className="gv-coin-icon">🪙</span>
              {user?.greenCoins || 0} GreenCoins
            </h4>
            <p className="gv-text-muted-custom small mb-0">
              Your universal GreenVerse currency. Earn more by offsetting carbon, sharing rides, and rescuing food!
            </p>
          </Card.Body>
        </Card>

        <Card className="gv-profile-card glassmorphism w-100">
          <Card.Body className="p-4 p-md-5 w-100">
            <div className="gv-avatar-section">
              <div className="gv-avatar-wrapper">
                <img
                  src={profilePic || "/default-avatar.png"}
                  alt="Profile"
                  className="gv-profile-pic"
                />
                <label className="gv-upload-overlay">
                  {uploading ? (
                    <div className="gv-upload-spinner">
                      <Spinner animation="border" variant="light" size="sm" />
                    </div>
                  ) : (
                    <>
                      <span className="gv-upload-icon">📷</span>
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
              <p className="gv-avatar-instruction mt-3">Click image to update photo</p>
            </div>

            <Form onSubmit={handleUpdateProfile} className="w-100">
              <Row className="w-100 m-0">
                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={updatedUser.username}
                      onChange={handleChange}
                      className="gv-form-input"
                      placeholder="Enter username"
                      required
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Mobile Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="mobile"
                      value={updatedUser.mobile}
                      onChange={handleChange}
                      className="gv-form-input"
                      placeholder="Enter mobile number"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Date of Birth</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="dob" 
                      value={updatedUser.dob} 
                      onChange={handleChange} 
                      className="gv-form-input"
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} className="px-md-3 px-0 mb-3">
                  <Form.Group className="text-start w-100">
                    <Form.Label className="gv-form-label">Address</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      name="address" 
                      value={updatedUser.address} 
                      onChange={handleChange} 
                      className="gv-form-input"
                      rows={1}
                      placeholder="Enter your address"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="text-center mt-4 w-100">
                <Button 
                  type="submit" 
                  variant="success" 
                  className="gv-save-button px-5 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;