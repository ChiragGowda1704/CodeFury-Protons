# KalaSetu - Artist Showcase Platform 🎨

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







