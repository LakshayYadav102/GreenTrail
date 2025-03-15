import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Spinner, Alert } from 'react-bootstrap';
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import "./ObjectDetection.css";

const carbonFootprintData = {
  "plastic bottle": { co2: 0.1, alternative: "Use a reusable bottle" },
  "glass bottle": { co2: 0.08, alternative: "Recycle glass bottles" },
  "paper": { co2: 0.05, alternative: "Use digital alternatives" },
  "organic waste": { co2: 0.02, alternative: "Compost food waste" },
  "e-waste": { co2: 50, alternative: "Recycle electronic waste properly" },
};

const wasteClasses = ["plastic bottle", "glass bottle", "paper", "organic waste", "e-waste"];

const ObjectDetection = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [carbonInfo, setCarbonInfo] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [customModel, setCustomModel] = useState(null);
  const [mobileNetModel, setMobileNetModel] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const customModelURL = process.env.PUBLIC_URL + "/models/waste-model/model.json";
        const loadedCustomModel = await tf.loadLayersModel(customModelURL);
        setCustomModel(loadedCustomModel);

        const loadedMobileNet = await mobilenet.load();
        setMobileNetModel(loadedMobileNet);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleClose = () => {
    setShowModal(false);
    setImage(null);
    setPrediction("");
    setCarbonInfo(null);
    setUseCamera(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setCarbonInfo(null);
      setUseCamera(false);
    }
  };

  const startCamera = () => {
    setUseCamera(true);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const { videoWidth, videoHeight } = video;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    const imageUrl = canvas.toDataURL("image/png");
    setImage(imageUrl);
    setUseCamera(false);

    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const classifyImage = async () => {
    if (!imageRef.current) return;
    
    setLoading(true);

    try {
      const tensor = tf.browser.fromPixels(imageRef.current)
        .resizeBilinear([224, 224])
        .toFloat()
        .expandDims()
        .div(tf.scalar(255));

      let detectedItem = "";
      let confidence = 0;

      if (customModel) {
        const predictions = customModel.predict(tensor);
        const predictedClass = predictions.argMax(1).dataSync()[0];
        confidence = Math.max(...predictions.dataSync());
        detectedItem = wasteClasses[predictedClass];
      }

      if ((!carbonFootprintData[detectedItem] || confidence < 0.6) && mobileNetModel) {
        const mobilePredictions = await mobileNetModel.classify(imageRef.current);
        detectedItem = mobilePredictions[0].className.toLowerCase();
        confidence = mobilePredictions[0].probability;
      }

      if (confidence < 0.5) {
        setPrediction("⚠️ Low Confidence - Try Again");
        setCarbonInfo(null);
        return;
      }

      setPrediction(detectedItem);
      setCarbonInfo(carbonFootprintData[detectedItem] || null);
    } catch (error) {
      console.error("Classification error:", error);
      setPrediction("Error analyzing image");
      setCarbonInfo(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button 
        variant="success" 
        className="floating-scan-button"
        onClick={() => setShowModal(true)}
      >
        ♻️ Scan Waste
      </Button>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>AI Waste Scanner</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="object-detection-container">
            <div className="d-flex flex-column gap-3 align-items-center">
              <div className="camera-preview">
                {useCamera ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    className="w-100 rounded border"
                    playsInline
                    onLoadedMetadata={() => {
                      videoRef.current.play().catch(error => {
                        console.error("Error playing video:", error);
                      });
                    }}
                  />
                ) : image ? (
                  <img 
                    src={image} 
                    alt="Uploaded" 
                    ref={imageRef} 
                    className="uploaded-image"
                    onLoad={() => URL.revokeObjectURL(image)}
                  />
                ) : (
                  <div className="placeholder-image bg-light rounded d-flex align-items-center justify-content-center">
                    <span className="text-muted">No image selected</span>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 flex-wrap justify-content-center">
                <label className="btn btn-primary mb-2">
                  📁 Upload Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="d-none" 
                  />
                </label>
                <Button 
                  variant="info" 
                  onClick={startCamera}
                  disabled={useCamera}
                  className="mb-2"
                >
                  📸 Use Camera
                </Button>
                {useCamera && (
                  <Button variant="warning" onClick={captureImage} className="mb-2">
                    📷 Capture
                  </Button>
                )}
                <Button 
                  variant="success" 
                  onClick={classifyImage} 
                  disabled={loading || !image}
                  className="mb-2 analyze-button"
                >
                  {loading ? (
                    <>
                      <Spinner 
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Analyzing...
                    </>
                  ) : (
                    '🔍 Analyze'
                  )}
                </Button>
              </div>

              {prediction && (
                <Alert variant={carbonInfo ? "success" : "warning"} className="w-100">
                  <h5>Detection Result:</h5>
                  <p className="mb-1"><strong>Item:</strong> {prediction}</p>
                  {carbonInfo ? (
                    <>
                      <p className="mb-1"><strong>CO₂ Impact:</strong> {carbonInfo.co2} kg</p>
                      <p className="mb-0"><strong>Tip:</strong> {carbonInfo.alternative}</p>
                    </>
                  ) : (
                    <p className="mb-0">No carbon data available for this item</p>
                  )}
                </Alert>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default ObjectDetection;
