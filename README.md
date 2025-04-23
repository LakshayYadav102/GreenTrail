# 🌱 GreenTrail

GreenTrail is an interactive web platform promoting eco-conscious living through carbon footprint tracking, sustainability insights, and educational tools. Users can monitor their environmental impact, visualize data, offset carbon emissions, and even explore green challenges, games, and blogs — all in one place.

---

## 🌟 Features

### 📊 Dashboard
- **Live Weather & AQI Data**: Real-time updates using OpenWeatherMap API.
- **Typing Eco-Quotes**: Dynamic motivational quotes on sustainability.
- **Interactive Cards**: Quick access to footprint tracking, donation, activity history, and analytics.

### 📉 Emission Analytics
- Visualize trends in your carbon emissions.
- Toggle graph view using a dedicated analytics card.
- Powered by a dynamic `GraphComponent`.

### 🤖 AI & Machine Learning
- **Carbon Footprint Prediction**:
  - Uses a trained model (LSTM / Random Forest) to forecast user emissions.
  - Based on historical activity, weather, and lifestyle data.
- **Simulation Support (Upcoming)**:
  - Predict how lifestyle changes (like reduced travel) could affect emissions.

### 🌍 Track Your Activities
- Record transportation, diet, and energy usage.
- Calculate and visualize total carbon emissions.
- Compare real-time data with predicted emissions.

### 🌳 Tree Offset & Donation
- View trees needed to offset lifetime emissions.
- Donate directly to NGOs or via EcoTrack to plant trees.
- Track donation history.

### 🧠 Chatbot
- Integrated virtual assistant to answer sustainability and app-related queries.

### 🛰️ Object Detection
- Upload or scan daily objects (e.g., plastic items) to receive environmental impact feedback.

### 📝 Blogs
- Read curated content on sustainability, tips for green living, and environmental news.

### 🎯 Challenges
- Participate in eco-friendly challenges to gamify your green journey.

### 🎮 Eco Games
- Play games with an environmental twist to raise awareness through fun.

---

## 💻 Tech Stack

### Frontend
- **React.js**
- **React Bootstrap**
- **Custom CSS Animations**
- **Axios for API calls**

### Backend
- **Node.js + Express**
- **MongoDB with Mongoose**
- **JWT Authentication**
- **RESTful API Design**

### ML Model (Carbon Prediction)
- Pretrained on user history + weather + lifestyle data
- Algorithms: `Random Forest`, `LSTM` (selectable based on use-case)
- Integrated with backend routes
- Automatically predicts future carbon emissions on user login

---

## 📦 Installation

### Prerequisites
- Node.js
- MongoDB
- Python (for ML model)


