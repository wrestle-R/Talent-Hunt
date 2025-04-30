# Talent Hunt

Talent Hunt is a comprehensive platform designed to empower students by helping them showcase their skills, projects, and achievements while connecting with mentors and peers. The platform provides a collaborative environment for students to build their profiles, find teammates, seek mentorship, and explore opportunities for growth.

## Features

- **Student Profile Management:**  
  Students can create detailed profiles, including personal information, education, skills, interests, certifications, projects, and achievements.

- **Skills & Interests:**  
  Add and manage skills, career goals, and fields of interest.

- **Project Portfolio:**  
  Showcase projects with descriptions, tech stacks, GitHub links, and live demos.

- **Experience & Achievements:**  
  Document internships, hackathons, freelance work, and other experiences, along with notable achievements.

- **Mentorship Connections:**  
  Students can seek mentorship by specifying topics of interest and preferred working hours. Mentors can manage their profiles and availability.

- **Teammate Search:**  
  Students can search for teammates for projects or hackathons based on skills, urgency, and team size preferences.

- **Social Integration:**  
  Add links to GitHub, LinkedIn, and personal portfolios.

- **Moderation Tools:**  
  Moderators can review student profiles, flag inappropriate content, and analyze user activity.

## Tech Stack

### Frontend
- **Framework:** React
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Icons:** Lucide React

### Backend
1. **Node.js Server:**
   - **Framework:** Express.js
   - **Purpose:** Handles real-time features, such as notifications and chat functionalities.
   - **Database:** MongoDB (via Mongoose)

2. **Python Server:**
   - **Framework:** FastAPI
   - **Purpose:** Manages core APIs for user profiles, projects, and mentorship data.
   - **Database:** PostgreSQL (via SQLAlchemy)

### Other Tools
- **Authentication:** JWT-based authentication
- **Deployment:** Dockerized services for scalability
- **Version Control:** GitHub

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- Python 3.8+
- npm or yarn
- MongoDB and PostgreSQL databases

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/talent-hunt.git
   cd talent-hunt
   ```

2. **Install frontend dependencies:**
   ```sh
   cd frontend
   npm install
   # or
   yarn install
   ```

3. **Install backend dependencies:**
   - **Node.js Server:**
     ```sh
     cd ../backend-node
     npm install
     ```
   - **Python Server:**
     ```sh
     cd ../backend-python
     pip install -r requirements.txt
     ```

### Configuration

1. **Environment Variables:**
   - Create `.env` files in both backend directories (`backend-node` and `backend-python`) with the following variables:
     - **Node.js Server:**
       ```
       PORT=5000
       MONGO_URI=mongodb://localhost:27017/talent-hunt
       JWT_SECRET=your_jwt_secret
       ```
     - **Python Server:**
       ```
       DATABASE_URL=postgresql://user:password@localhost:5432/talent_hunt
       SECRET_KEY=your_secret_key
       ```

2. **Frontend Configuration:**
   - Update the API URLs in the frontend `.env` file:
     ```
     REACT_APP_NODE_API_URL=http://localhost:5000
     REACT_APP_PYTHON_API_URL=http://localhost:8000
     ```

### Running the Application

1. **Start the Node.js backend server:**
   ```sh
   cd backend-node
   npm start
   ```

2. **Start the Python backend server:**
   ```sh
   cd backend-python
   uvicorn main:app --reload
   ```

3. **Start the frontend development server:**
   ```sh
   cd ../frontend
   npm start
   # or
   yarn start
   ```

4. **Access the application:**  
   Open your browser and visit `http://localhost:3000`.

## Folder Structure

```
Talent-Hunt/
├── backend-node/          # Node.js backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── ...
├── backend-python/        # Python backend server
│   ├── app/               # FastAPI application
│   ├── models/            # SQLAlchemy models
│   └── ...
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Context API for state management
│   │   └── ...
│   └── ...
└── README.md
```

## Contributing

Contributions are welcome! Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Open a pull request.

## License

This project is licensed under the MIT License.

---

**Note:** Update the repository URL and environment variables as per your setup.
