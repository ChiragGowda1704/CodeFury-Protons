// Upload page for artwork submission

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { Upload as UploadIcon, Image, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import { uploadAPI, mlAPI, handleApiError } from '../services/api';

const UploadContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
`;

const UploadCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const DropzoneArea = styled.div`
  border: 3px dashed ${props => props.isDragActive ? '#667eea' : '#ddd'};
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.05)' : 'rgba(248, 249, 250, 0.5)'};
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 2rem;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const DropzoneContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #666;
`;

const DropzoneIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const DropzoneText = styled.div`
  font-size: 1.125rem;
  font-weight: 500;
`;

const DropzoneSubtext = styled.div`
  font-size: 0.875rem;
  color: #999;
`;

const PreviewArea = styled.div`
  margin-bottom: 2rem;
`;

const PreviewImage = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff6b6b;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
    transform: scale(1.1);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ClassifySection = styled.div`
  background: rgba(102, 126, 234, 0.05);
  border-radius: 10px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const ClassifyButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ClassificationResult = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #28a745;
`;

const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #28a745;
`;

const ResultText = styled.div`
  color: #333;
  margin-bottom: 0.5rem;
`;

const ConfidenceBar = styled.div`
  background: #e9ecef;
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
`;

const ConfidenceFill = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100%;
  width: ${props => props.confidence * 100}%;
  transition: width 0.5s ease;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 10px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Upload = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 500  // Default price in INR
  });
  const [classification, setClassification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setClassification(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setClassification(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const classifyImage = async () => {
    if (!selectedFile) return;

    setClassifying(true);
    try {
      const result = await mlAPI.classifyImage(selectedFile);
      setClassification(result);
      toast.success('Image classified successfully!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Classification failed: ${errorMessage}`);
    } finally {
      setClassifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title for your artwork');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('title', formData.title);
      if (formData.description) {
        uploadFormData.append('description', formData.description);
      }
      uploadFormData.append('price', formData.price || 500);

      const uploadResult = await uploadAPI.uploadArtwork(uploadFormData);
      
      // If we have classification data, update the artwork
      if (classification) {
        try {
          await mlAPI.classifyAndSaveArtwork(uploadResult.id);
        } catch (error) {
          console.log('Failed to save classification, but upload succeeded');
        }
      }

      toast.success('Artwork uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setFormData({ title: '', description: '' });
      setClassification(null);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <UploadContainer>
      <Title>Upload Your Artwork</Title>

      <UploadCard>
        {!selectedFile ? (
          <DropzoneArea {...getRootProps()} isDragActive={isDragActive}>
            <input {...getInputProps()} />
            <DropzoneContent>
              <DropzoneIcon>
                <UploadIcon size={24} />
              </DropzoneIcon>
              <DropzoneText>
                {isDragActive ? 'Drop your image here...' : 'Drag & drop an image here'}
              </DropzoneText>
              <DropzoneSubtext>
                or click to select a file (max 10MB)
              </DropzoneSubtext>
            </DropzoneContent>
          </DropzoneArea>
        ) : (
          <PreviewArea>
            <PreviewImage>
              <PreviewImg src={preview} alt="Preview" />
              <RemoveButton onClick={removeFile}>
                <X size={16} />
              </RemoveButton>
            </PreviewImage>

            <ClassifySection>
              <ClassifyButton 
                onClick={classifyImage} 
                disabled={classifying}
              >
                {classifying ? 'Classifying...' : 'Classify Art Style with AI'}
              </ClassifyButton>
              
              {classification && (
                <ClassificationResult>
                  <ResultHeader>
                    <CheckCircle size={18} />
                    Classification Result
                  </ResultHeader>
                  <ResultText>
                    <strong>Predicted Style:</strong> {classification.predicted_style}
                  </ResultText>
                  <ResultText>
                    <strong>Confidence:</strong> {(classification.confidence_score * 100).toFixed(1)}%
                  </ResultText>
                  
                  {/* Horse Detection Results */}
                  {classification.features?.yolo_detection && (
                    <ResultText>
                      <strong>Horse Detected:</strong> {classification.features.yolo_detection.horse_detected ? 
                        `Yes (${(classification.features.yolo_detection.horse_confidence * 100).toFixed(1)}% confidence)` : 
                        'No'
                      }
                    </ResultText>
                  )}
                  
                  {/* Color Analysis */}
                  {classification.features?.color_analysis && (
                    <div style={{ marginTop: '1rem' }}>
                      <ResultText>
                        <strong>Color Analysis:</strong>
                      </ResultText>
                      <div style={{ fontSize: '0.9rem', color: '#ddd', marginLeft: '1rem' }}>
                        {classification.features.color_analysis.warm_ratio > 0.3 && (
                          <div>• Warm colors predominant</div>
                        )}
                        {classification.features.color_analysis.earth_ratio > 0.3 && (
                          <div>• Earth tones detected</div>
                        )}
                        {classification.features.color_analysis.vibrant_warm > 0.25 && (
                          <div>• Vibrant warm palette</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <ConfidenceBar>
                    <ConfidenceFill confidence={classification.confidence_score} />
                  </ConfidenceBar>
                </ClassificationResult>
              )}
            </ClassifySection>
          </PreviewArea>
        )}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">Artwork Title *</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter a title for your artwork"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description (Optional)</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your artwork, inspiration, or technique..."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="price">Price (₹ INR) *</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price in rupees"
              min="1"
              required
            />
          </FormGroup>

          <SubmitButton 
            type="submit" 
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Artwork'}
          </SubmitButton>
        </Form>
      </UploadCard>
    </UploadContainer>
  );
};

export default Upload;
