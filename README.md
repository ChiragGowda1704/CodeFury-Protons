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

## 📱 How to Use

### 1. Authentication
1. Navigate to `http://localhost:3000`
2. Create an account or login with existing credentials
3. You'll be redirected to the dashboard

### 2. Upload Artwork
1. Go to "Upload Art" page
2. Drag & drop or select an image file
3. Add title and description
4. Click "Classify Art Style with AI" for automatic classification
5. Submit the artwork

### 3. Browse Gallery
1. Visit the "Gallery" page
2. Browse all uploaded artworks
3. Filter by art style (Warli, Madhubani, Pithora)
4. Search by title or description
5. Switch between grid and list views

### 4. Style Transfer
1. Go to "Style Transfer" page
2. Upload a photo (selfie or any image)
3. Choose target folk art style
4. Click "Apply Style Transfer"
5. Download the transformed image

### 5. AI Drawing Game
1. Navigate to "AI Draw Game"
2. Click "Start Game"
3. Follow the AI prompts
4. Draw using the provided tools
5. Earn points and level up

### 6. Dashboard Analytics
1. View platform statistics on the dashboard
2. See art style distribution charts
3. Monitor recent uploads
4. Check ML model performance metrics

## 🧠 ML Models

### Art Style Classifier
- **Architecture**: Custom CNN with 4 convolutional blocks
- **Classes**: Warli, Madhubani, Pithora
- **Input**: 224x224 RGB images
- **Features**: Transfer learning ready, data augmentation support

### Style Transfer Model
- **Base**: VGG19 feature extractor
- **Technique**: Neural Style Transfer with Gram matrices
- **Styles**: Pre-trained on Indian folk art patterns
- **Fallback**: Simple color transformation for demo

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh-token` - Refresh JWT token

### Upload
- `POST /api/v1/upload/artwork` - Upload artwork
- `GET /api/v1/upload/artwork/{id}` - Get artwork by ID
- `DELETE /api/v1/upload/artwork/{id}` - Delete artwork

### Gallery
- `GET /api/v1/gallery/artworks` - Get all artworks (with pagination)
- `GET /api/v1/gallery/artworks/user/{user_id}` - Get user's artworks
- `GET /api/v1/gallery/artworks/style/{style}` - Filter by style
- `GET /api/v1/gallery/search` - Search artworks

### Machine Learning
- `POST /api/v1/ml/classify` - Classify image style
- `POST /api/v1/ml/style-transfer` - Apply style transfer
- `GET /api/v1/ml/model-metrics` - Get model performance

### Dashboard
- `GET /api/v1/dashboard/metrics` - Platform metrics
- `GET /api/v1/dashboard/confusion-matrix` - Model confusion matrix
- `GET /api/v1/dashboard/user-analytics` - User analytics

## 🎯 Hackathon Ready Features

### MVP Components ✅
- ✅ User authentication with JWT
- ✅ File upload and storage
- ✅ Image gallery with search/filter
- ✅ ML-powered art classification
- ✅ Style transfer functionality
- ✅ Analytics dashboard
- ✅ Interactive drawing game
- ✅ Responsive design
- ✅ Error handling and notifications

### Demo Data
- Mock classification results for immediate testing
- Sample art style data
- Fallback image processing for style transfer
- Random analytics data for dashboard

### Performance Optimizations
- Image resizing and compression
- Lazy loading for gallery
- Pagination for large datasets
- Background processing for ML operations

## 🔄 Future Enhancements

1. **Real Training Data**: Collect and train models on actual Indian folk art datasets
2. **Advanced Analytics**: More detailed user behavior tracking
3. **Social Features**: Comments, likes, and sharing
4. **Mobile App**: React Native mobile application
5. **Real-time Features**: WebSocket for live drawing collaboration
6. **Advanced ML**: Object detection within artworks
7. **Export Options**: PDF portfolios, high-res downloads

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure Python 3.8+ is installed
   - Check virtual environment activation
   - Verify all dependencies are installed

2. **Frontend won't start**
   - Ensure Node.js 16+ is installed
   - Delete `node_modules` and run `npm install` again
   - Check for port conflicts

3. **Image upload fails**
   - Check file size (max 10MB)
   - Ensure supported format (jpg, png, gif, bmp)
   - Verify backend upload directory permissions

4. **ML models not working**
   - Models use fallback mock predictions for demo
   - For production, train with actual datasets
   - Check GPU availability for faster processing

## 📄 License

This project is created for hackathon purposes. Feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎨 Acknowledgments

- Indian folk art traditions (Warli, Madhubani, Pithora)
- Open source ML frameworks and libraries
- React and FastAPI communities

---

**Happy Coding! 🚀** Build something amazing with this Artist Showcase Platform!
