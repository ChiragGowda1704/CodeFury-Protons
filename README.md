# Artist Showcase Platform 🎨

A comprehensive platform for showcasing Indian folk art with ML-powered features including art style classification and style transfer. **Now powered by MongoDB for enhanced scalability and performance!**

## 🚀 Features

### Authentication
- **Secure JWT Authentication**: Login/Signup with secure token-based authentication
- **User Management**: Profile management and session handling

### Artist Showcase Platform
- **Upload Artwork**: Upload and showcase your art pieces
- **ML Art Classification**: Automatically classify art styles (Folk Art/Modern Art/Classical Art)
- **Gallery**: Browse and explore uploaded artworks with filtering options
- **Search Functionality**: Search artworks by title, description, or style

### AI-Powered Features
- **Style Classification**: CNN-based model for classifying art styles
- **Style Transfer**: Convert photos into folk art styles using neural style transfer
- **Confidence Scoring**: Get accuracy metrics for classifications

### Analytics Dashboard
- **Metrics Overview**: View platform statistics and user analytics
- **Confusion Matrix**: Visualize model performance
- **Style Distribution**: Charts showing popular art styles
- **Recent Activity**: Track latest uploads and activities

### Gamified Content
- **AI Drawing Game**: Interactive drawing game with AI prompts
- **Scoring System**: Earn points and level up
- **Downloadable Artwork**: Save your creations

## 📁 Project Structure

```
Artist-Showcase-Platform/
├── backend/                 # FastAPI Backend with MongoDB
│   ├── app/
│   │   ├── routes/         # API routes (auth, upload, gallery, ml, dashboard)
│   │   ├── models/         # MongoDB models and Pydantic schemas
│   │   └── utils/          # Utility functions (auth, database, file handling)
│   ├── uploads/            # Uploaded images storage
│   ├── main.py             # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components (Login, Dashboard, Gallery, etc.)
│   │   └── services/       # API service functions
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── ml_models/              # Machine Learning Models
│   ├── classifier/         # Art style classification CNN
│   └── style_transfer/     # Neural style transfer model
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **MongoDB**: NoSQL document database for scalability
- **Beanie**: Async ODM (Object Document Mapper) for MongoDB
- **Motor**: Async MongoDB driver
- **JWT**: Secure authentication
- **Python-multipart**: File upload handling

### Frontend  
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Axios**: HTTP client for API calls
- **Recharts**: Data visualization
- **React Dropzone**: File upload component
- **React Toastify**: Notifications

### Machine Learning
- **PyTorch**: Deep learning framework
- **TorchVision**: Computer vision utilities
- **PIL/OpenCV**: Image processing
- **Scikit-learn**: ML utilities
- **NumPy**: Numerical computing

## 🚀 Local Setup Instructions

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- MongoDB (local installation or MongoDB Atlas account)
- Git installed

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Artist-Showcase-Platform
```

### 2. MongoDB Setup

**Option A: Local MongoDB Installation**
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# Windows
# Download and install MongoDB Community Server from mongodb.com
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://cloud.mongodb.com
2. Create a new cluster
3. Get your connection string

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and configure
cp .env.example .env
# Edit .env with your MongoDB settings:
# MONGODB_URL=mongodb://localhost:27017  # or your Atlas connection string
# DATABASE_NAME=artist_showcase
# JWT_SECRET=your-super-secret-jwt-key

# Initialize MongoDB database
python init_mongodb.py

# Start the backend server
python main.py
```

The backend will be running at `http://localhost:8000`

### 4. Frontend Setup

```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will be running at `http://localhost:3000`

### 5. Environment Configuration

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=artist_showcase

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME=Artist Showcase Platform

# Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

**Important Notes:**
- Change `JWT_SECRET` to a secure random string in production
- For MongoDB Atlas, use your cluster connection string for `MONGODB_URL`
- Ensure MongoDB is running before starting the backend



