import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Spinner, Alert } from 'react-bootstrap';
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";
import { createPortal } from 'react-dom';
import "./ObjectDetection.css";

const carbonFootprintData = {
  "plastic bottle": { co2: 0.1, alternative: "Use a reusable bottle" },
  "glass bottle": { co2: 0.08, alternative: "Recycle glass bottles" },
  "paper": { co2: 0.05, alternative: "Use digital alternatives" },
  "organic waste": { co2: 0.02, alternative: "Compost food waste" },
  "e-waste": { co2: 50, alternative: "Recycle electronic waste properly" },
};

const wasteClasses = ["plastic bottle", "glass bottle", "paper", "organic waste", "e-waste"];

// SMART TRANSLATOR: Maps MobileNet's 1000 categories into your 5 waste classes
const mobileNetSmartMap = {
  "water bottle": "plastic bottle",
  "pop bottle": "plastic bottle",
  "pill bottle": "plastic bottle",
  "beer bottle": "glass bottle",
  "wine bottle": "glass bottle",
  "envelope": "paper",
  "menu": "paper",
  "book": "paper",
  "carton": "paper",
  "paper towel": "paper",
  "banana": "organic waste",
  "apple": "organic waste",
  "orange": "organic waste",
  "lemon": "organic waste",
  "strawberry": "organic waste",
  "laptop": "e-waste",
  "monitor": "e-waste",
  "desktop computer": "e-waste",
  "cellular telephone": "e-waste",
  "mouse": "e-waste",
  "keyboard": "e-waste",
  "ipod": "e-waste",
};

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

        const loadedMobileNet = await mobilenet.load({ version: 2, alpha: 1.0 }); // Using a higher accuracy MobileNet version
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
      setPrediction("");
      setCarbonInfo(null);
      setUseCamera(false);
    }
  };

  const startCamera = () => {
    setUseCamera(true);
    setPrediction("");
    setCarbonInfo(null);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => console.error("Error accessing camera:", error));
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
      // 1. FIX: Grab the original image as a tensor
      const rawImageTensor = tf.browser.fromPixels(imageRef.current);
      
      // 2. FIX: Center-Crop to Square to prevent "Squishing" distortion
      const height = rawImageTensor.shape[0];
      const width = rawImageTensor.shape[1];
      const minDim = Math.min(height, width);
      const startY = Math.floor((height - minDim) / 2);
      const startX = Math.floor((width - minDim) / 2);
      const croppedTensor = tf.slice(rawImageTensor, [startY, startX, 0], [minDim, minDim, 3]);

      // 3. FIX: Resize and properly normalize math for Teachable Machine (-1 to 1)
      const tensor = tf.image.resizeBilinear(croppedTensor, [224, 224])
        .toFloat()
        .div(tf.scalar(127.5))
        .sub(tf.scalar(1))
        .expandDims();

      let detectedItem = "";
      let confidence = 0;

      // --- PHASE 1: CUSTOM TEACHABLE MACHINE MODEL ---
      if (customModel) {
        const predictions = customModel.predict(tensor);
        const dataSync = predictions.dataSync();
        const predictedClassIndex = predictions.argMax(1).dataSync()[0];
        
        confidence = dataSync[predictedClassIndex];
        detectedItem = wasteClasses[predictedClassIndex];
      }

      // --- PHASE 2: MOBILENET FALLBACK WITH SMART MAPPING ---
      // If custom model is unsure (< 0.70) or fails, use MobileNet
      if (confidence < 0.70 && mobileNetModel) {
        const mobilePredictions = await mobileNetModel.classify(imageRef.current);
        const rawPrediction = mobilePredictions[0].className.toLowerCase();
        confidence = mobilePredictions[0].probability;

        // Try to translate the generic MobileNet word into our Waste dictionary
        const foundKey = Object.keys(mobileNetSmartMap).find(key => rawPrediction.includes(key));
        
        if (foundKey) {
          detectedItem = mobileNetSmartMap[foundKey];
        } else {
          detectedItem = rawPrediction; // Keep raw if no translation found
        }
      }

      // Clean up memory to prevent browser lag
      tf.dispose([rawImageTensor, croppedTensor, tensor]);

      // Final decision
      if (confidence < 0.5) {
        setPrediction("⚠️ Item unclear - Please take a closer photo.");
        setCarbonInfo(null);
      } else {
        setPrediction(detectedItem);
        setCarbonInfo(carbonFootprintData[detectedItem] || null);
      }

    } catch (error) {
      console.error("Classification error:", error);
      setPrediction("Error analyzing image");
      setCarbonInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const floatingButton = (
    <Button 
      variant="success" 
      className="floating-scan-button"
      onClick={() => setShowModal(true)}
    >
      ♻️ Scan Waste
    </Button>
  );

  return (
    <>
      {createPortal(floatingButton, document.body)}
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
                    className="w-100 h-100 rounded border"
                    style={{ objectFit: 'cover' }}
                    playsInline
                    onLoadedMetadata={() => videoRef.current.play().catch(e => console.error(e))}
                  />
                ) : image ? (
                  <img 
                    src={image} 
                    alt="Uploaded" 
                    ref={imageRef} 
                    className="uploaded-image"
                  />
                ) : (
                  <div className="placeholder-image bg-light rounded d-flex align-items-center justify-content-center h-100">
                    <span className="text-muted">No image selected</span>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 flex-wrap justify-content-center mt-3">
                <label className="btn btn-primary mb-2" style={{ cursor: 'pointer' }}>
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
                  disabled={loading || !image || useCamera}
                  className="mb-2 analyze-button"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Analyzing...
                    </>
                  ) : (
                    '🔍 Analyze'
                  )}
                </Button>
              </div>

              {prediction && (
                <Alert variant={carbonInfo ? "success" : "warning"} className="w-100 mt-3">
                  <h5>Detection Result:</h5>
                  <p className="mb-1 text-capitalize"><strong>Item:</strong> {prediction}</p>
                  {carbonInfo ? (
                    <>
                      <p className="mb-1"><strong>CO₂ Impact:</strong> {carbonInfo.co2} kg</p>
                      <p className="mb-0"><strong>Tip:</strong> {carbonInfo.alternative}</p>
                    </>
                  ) : (
                    <p className="mb-0">No carbon data available for this exact item. Please try scanning a Plastic/Glass bottle, E-waste, Paper, or Organic waste.</p>
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