# 🌍 GreenVerse

**GreenVerse** (formerly *GreenTrail*) is the world’s first sustainability super-platform. It bridges the gap between individual eco-conscious living and enterprise-level ESG (Environmental, Social, Governance) compliance. 

By gamifying daily sustainable actions for individuals and seamlessly translating those micro-actions into verifiable compliance data for corporations, GreenVerse turns a company's workforce into an active asset for footprint reduction.

---

## 🌟 The GreenVerse Ecosystem (Core Modules)

GreenVerse has evolved from a standalone tracker into a comprehensive suite of environmental tools:

### 🏢 Corporate Sync (B2B ESG Command Center)
- **Employee-Driven Data:** Flips the traditional top-down ESG model. Employees log grassroots actions (carpooling, energy savings) which feed directly into corporate sustainability reports.
- **BRSR Compliance:** Tailor-made to map employee micro-contributions directly to SEBI's BRSR mandate, aiding listed companies in auditing Scope 3 emissions.
- **Auditor Dashboard:** Dedicated portals for corporate auditors to access verified, immutable logs of company-wide sustainability metrics.

### 🌱 GreenTrail (Personal Footprint Hub)
- **Live Environmental Data:** Real-time Weather & AQI updates using OpenWeatherMap API.
- **Emission Analytics:** Visualize personal trends in carbon emissions and toggle dynamic graph views.
- **AI Carbon Prediction:** Uses trained ML models (LSTM / Random Forest) to forecast future user emissions based on historical activity, weather, and lifestyle.
- **Tree Offset & Donation:** Calculate trees needed to offset lifetime emissions and donate directly to NGOs. 

### 🚗 Carpooling & EV
- Share sustainable rides with colleagues and community members.
- Locate nearby EV charging stations to support green transportation and significantly reduce commute emissions.

### 🍎 Food Rescue
- Combat food waste by directly connecting users with local NGOs.
- Request food pickups for excess food to ensure nothing goes to landfills.

### 👓 GreenScan (AR/VR)
- Step into immersive augmented and virtual reality experiences.
- Visually interact with digital climate solutions and see the true, physical scale of climate impact.

### 📺 GreenStream & EcoLearn
- A curated visual knowledge hub and feed.
- Watch educational videos and read blogs on sustainability, climate action, and eco-friendly living.

### 🎮 Gamification & Challenges
- **Eco Games & Quizzes:** Play games with an environmental twist.
- **AI Chatbot:** Virtual assistant for sustainability queries.
- **Object Detection:** Scan daily items (e.g., plastics) to instantly receive their environmental impact and recycling feedback.

---

## 🏗️ The 3-Level Architecture

GreenVerse is built on a highly scalable, microservices-inspired architecture designed to handle real-time environmental tracking and complex compliance reporting simultaneously.

### 1. Presentation & Immersion Layer (Client-Side)
The user-facing ecosystem built to ensure high engagement through gamification and accessibility.
*   **Web Dashboard:** Built with React.js and React Bootstrap, featuring interactive analytics, live footprint graphs, and a real-time ESG tracker.
*   **Immersive Modules:** The `GreenScan` AR/VR module built for spatial web interactions, allowing users to visualize climate impact physically.
*   **Real-time Feedback:** Integration with OpenWeatherMap APIs to contextualize user actions with live environmental data (AQI, temperature).

### 2. Application & Intelligence Layer (Server-Side)
The brain of the platform that handles data processing, routing, and predictive analytics.
*   **Core Backend:** A Node.js & Express.js REST API handling JWT authentication, route protection, and database queries.
*   **Machine Learning Microservice:** A Python-based intelligence engine running LSTM and Random Forest algorithms. It analyzes historical lifestyle inputs and local weather data to forecast future carbon emissions dynamically.
*   **Compliance Sync Engine:** The middleware that intercepts corporate employee actions (e.g., a logged carpool) and translates them into standardized ESG reporting metrics.

### 3. Data & Compliance Layer (Storage & Audit)
The foundational layer designed for immutable record-keeping and corporate transparency.
*   **NoSQL Database:** MongoDB (via Mongoose) handles highly flexible, document-based storage for diverse activities (food rescue, transport, donations).
*   **Audit Trail System:** Stores timestamped, cryptographically secure logs of all employee micro-actions, generating the raw data required for corporate BRSR reporting.

---

## 👥 The 3 User Profiles

GreenVerse relies on a tri-party ecosystem where grassroots action fuels top-down compliance.

| Profile | Role | Platform Experience | Core Objective |
| :--- | :--- | :--- | :--- |
| **User A: The Eco-Warrior** | Individual Citizen | Uses GreenTrail to track personal footprint, donates trees, rescues food, and learns via GreenStream. | To reduce personal carbon footprint and participate in community sustainability challenges. |
| **User B: The Corporate Employee** | Enterprise Contributor | Logs into a specialized synced portal. Their everyday eco-actions (carpooling, energy saving) are gamified and tracked. | To boost their employer’s real-time ESG score while competing in inter-departmental green leaderboards. |
| **User C: The Auditor** | Corporate Compliance | Accesses a dedicated `/corporate-dashboard` containing macro-level, verified data visualizations and logs. | To effortlessly export immutable Scope 3 emission data for mandatory BRSR (Business Responsibility and Sustainability Reporting). |

---

## 📊 The ESG Metrics Matrix

GreenVerse comprehensively covers the entire ESG spectrum, providing a holistic view of corporate responsibility.

### 🌿 E - Environmental Impact
Focuses on direct ecological footprint reduction and resource management.
*   **Scope 3 Emission Reduction:** Kilograms of CO₂ avoided via the Carpooling & EV module.
*   **Waste Diversion:** Kilograms of food rescued and diverted from methane-producing landfills.
*   **Active Sequestration:** Total trees planted and verified via NGO partnerships (Offset Tracking).

### 🤝 S - Social Responsibility
Focuses on community engagement, education, and social equity.
*   **Community Welfare:** Number of successful food donations connecting corporate cafeterias to local NGOs.
*   **Workforce Education:** Employee engagement hours tracked via `GreenStream` and `EcoLearn` educational modules.
*   **Behavioral Shifts:** Gamification metrics showing user adoption rates of sustainable daily habits.

### ⚖️ G - Governance & Transparency
Focuses on auditable compliance, ethical operations, and data integrity.
*   **BRSR Alignment:** Automated mapping of employee activities to specific principles mandated by SEBI for corporate sustainability reporting.
*   **Infrastructural Transparency:** Public, real-time display of GreenVerse's own server emissions vs. offsets, maintaining a verifiable **Carbon Negative** platform status.
*   **Data Verifiability:** Immutable logs of all corporate employee actions to prevent "greenwashing" during compliance audits.

---

## 💻 Tech Stack

### Frontend
- **React.js** & **React Router**
- **React Bootstrap** & Custom CSS Animations
- **Axios** for API integration

### Backend & Cloud
- **Node.js + Express**
- **MongoDB with Mongoose**
- **JWT Authentication**
- **Cloud Infrastructure:** Render, Netlify, Cloudinary


---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB instance (local or Atlas)
- Python 3.x (for the ML microservice)

### Steps
1. Clone the repository: `git clone https://github.com/yourusername/greenverse.git`
2. Install frontend dependencies: `cd client && npm install`
3. Install backend dependencies: `npm install`
4. Set up environment variables (`.env`):
   - `MONGO_URI`
   - `JWT_SECRET`
5. Start the backend server: `npm run server`
6. Start the frontend client: `npm start`

---

## 🚀 Live Website

Check out the live deployment of GreenVerse here:
👉 **[Visit GreenVerse](https://greenverse1.netlify.app/)**

---

## 👥 Team & Acknowledgments

**Built by:** 
* Lakshay Yadav (22csu102) 
