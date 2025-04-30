# 🎯 Talent Hunt

**Talent Hunt** is a powerful platform built to **empower students** by showcasing their skills, projects, and achievements — while seamlessly connecting them with **mentors, peers**, and **opportunities**.

🚀 Build your portfolio. 🤝 Find teammates. 🎓 Get mentored. 🌱 Grow together.


## 📽️ Demo

🎥 [Insert Video URL Here]


## ✨ Features

- 👤 **Student Profile Management**  
  Create rich, detailed profiles with personal info, education, skills, interests, certifications, projects, and achievements.

- 🛠️ **Skills & Interests**  
  Highlight your strengths, career goals, and passion areas.

- 📁 **Project Portfolio**  
  Showcase your projects with descriptions, tech stacks, GitHub links, and live demos.

- 🏆 **Experience & Achievements**  
  Add internships, hackathons, freelance gigs, and achievements.

- 🧑‍🏫 **Mentorship Connections**  
  Connect with mentors by specifying topics of interest and availability. Mentors manage their own availability and expertise.

- 👥 **Teammate Search**  
  Discover potential teammates based on skills, urgency, and team preferences.

- 🌐 **Social Integration**  
  Link your GitHub, LinkedIn, and personal portfolios.

- 🔧 **Moderation Tools**  
  Admin panel for reviewing profiles, flagging content, and tracking user activity.


## 🧰 Tech Stack

### 🖥️ Frontend
- **Framework:** React  
- **Styling:** Tailwind CSS  
- **State Management:** React Context API  
- **Icons:** Lucide React  

### 🧠 Backend
- **Node.js Server** (Real-time Layer):  
  - Framework: Express.js  
  - DB: MongoDB via Mongoose  

- **Python Server** (Core APIs):  
  - Framework: FastAPI  
  - DB: ChromaDB

### 🔒 Other Tools
- **Authentication:** JWT  
- **Deployment:** Docker  
- **Version Control:** GitHub  


## 🛠️ Getting Started

### 📦 Prerequisites

- Node.js `v16+`  
- Python `3.8+`  
- MongoDB & PostgreSQL  
- npm or yarn


## ⚙️ Installation

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/yourusername/talent-hunt.git
cd talent-hunt
```

### 2️⃣ Install Dependencies

#### Frontend
```sh
cd frontend
npm install
# or
yarn install
```

#### Node.js Backend
```sh
cd ../backend-node
npm install
```

#### Python Backend
```sh
cd ../python_backend
pip install -r requirements.txt
```


## 🔐 Configuration

### 🌍 Environment Variables

#### ➤ Node.js Server (`backend-node/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/talent-hunt
JWT_SECRET=your_jwt_secret
```

#### ➤ Python Server (`python_backend/.env`)
```env
GOOGLE_API_KEY = your_google_api_key
```

#### ➤ Frontend (`frontend/.env`)
```env
REACT_APP_NODE_API_URL=http://localhost:5000
REACT_APP_PYTHON_API_URL=http://localhost:8000
```


## ▶️ Running the Application

1. **Start Node.js Server**
   ```sh
   cd backend-node
   npm start
   ```

2. **Start Python Server**
   ```sh
   cd ../backend-python
   uvicorn main:app --reload
   ```

3. **Start Frontend**
   ```sh
   cd ../frontend
   npm start
   # or
   yarn start
   ```

4. **Visit the App**  
   Open your browser: [http://localhost:3000](http://localhost:3000)


## 📁 Folder Structure

```
Talent-Hunt/
├── backend-node/          # Express.js server for real-time features
│   ├── models/
│   ├── routes/
│   └── ...
├── backend-python/        # FastAPI server for core features
│   ├── app/
│   ├── models/
│   └── ...
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── ...
│   └── ...
└── README.md
```

---

## 🤝 Contributing

1. Fork this repo  
2. Create a new branch (`feature/your-feature-name`)  
3. Commit your changes  
4. Push to your fork  
5. Open a Pull Request

We welcome all ideas, bug fixes, and improvements!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
