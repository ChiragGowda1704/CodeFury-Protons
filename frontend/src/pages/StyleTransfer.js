// Style Transfer page for converting images to folk art styles

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { Upload as UploadIcon, Palette, Download, X, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

import { mlAPI, handleApiError } from '../services/api';

const StyleTransferContainer = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 3rem;
  font-size: 1.125rem;
`;

const TransferCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 25px;
  font-weight: 600;
  margin: 0 0.5rem;
  
  @media (max-width: 768px) {
    margin: 0;
    justify-content: center;
  }
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UploadSection = styled.div``;

const StyleSection = styled.div``;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const DropzoneArea = styled.div`
  border: 3px dashed ${props => props.isDragActive ? '#667eea' : '#ddd'};
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragActive ? 'rgba(102, 126, 234, 0.05)' : 'rgba(248, 249, 250, 0.5)'};
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 1rem;

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
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const PreviewImage = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 200px;
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

const StyleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const StyleOption = styled.div`
  border: 3px solid ${props => props.selected ? '#667eea' : '#e1e5e9'};
  border-radius: 15px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? 'rgba(102, 126, 234, 0.1)' : 'white'};

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }
`;

const StyleIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${props => props.color || '#667eea'};
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StyleName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
`;

const TransferButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ResultSection = styled.div`
  background: rgba(102, 126, 234, 0.05);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
`;

const ResultGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ResultImage = styled.div`
  text-align: center;
`;

const ResultImg = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const ResultLabel = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const ResultStats = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-around;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.875rem;
`;

const DownloadButton = styled.button`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(40, 167, 69, 0.3);
  }
`;

const StyleTransfer = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [result, setResult] = useState(null);
  const [availableStyles, setAvailableStyles] = useState([]);

  // Fetch available styles from the backend or gallery
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        // Try to get styles from gallery endpoint
        const response = await fetch('http://localhost:8000/api/gallery/artworks?limit=100');
        if (response.ok) {
          const artworks = await response.json();
          const styles = [...new Set(artworks.map(artwork => artwork.art_form).filter(Boolean))];
          const styleOptions = styles.map(style => ({
            name: style.toLowerCase(),
            label: style,
            color: '#4F46E5' // Default color
          }));
          setAvailableStyles(styleOptions);
        } else {
          // Fallback to default styles
          setAvailableStyles([
            { name: 'warli', label: 'Warli', color: '#8B4513' },
            { name: 'madhubani', label: 'Madhubani', color: '#DC143C' },
            { name: 'pithora', label: 'Pithora', color: '#4F46E5' }
          ]);
        }
      } catch (error) {
        console.log('Failed to fetch styles, using defaults');
        setAvailableStyles([
          { name: 'warli', label: 'Warli', color: '#8B4513' },
          { name: 'madhubani', label: 'Madhubani', color: '#DC143C' },
          { name: 'pithora', label: 'Pithora', color: '#4F46E5' }
        ]);
      }
    };
    fetchStyles();
  }, []);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
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
    setResult(null);
  };

  const handleStyleSelect = (styleName) => {
    setSelectedStyle(styleName);
  };

  const handleTransfer = async () => {
    if (!selectedFile || !selectedStyle) {
      toast.error('Please select an image and a style');
      return;
    }

    setTransferring(true);
    try {
      const transferResult = await mlAPI.styleTransfer(selectedFile, selectedStyle);
      setResult(transferResult);
      toast.success('Style transfer completed!');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Style transfer failed: ${errorMessage}`);
    } finally {
      setTransferring(false);
    }
  };

  const downloadResult = () => {
    if (result?.image_base64) {
      // Use base64 data for download
      const link = document.createElement('a');
      link.href = result.image_base64;
      link.download = `styled_${selectedStyle}_${Date.now()}.jpg`;
      link.click();
    } else if (result?.output_image_path) {
      // Fallback to file path
      const link = document.createElement('a');
      link.href = `http://localhost:8000/${result.output_image_path}`;
      link.download = 'styled_artwork.jpg';
      link.click();
    }
  };

  const currentStep = !selectedFile ? 1 : !selectedStyle ? 2 : !result ? 3 : 4;

  return (
    <StyleTransferContainer>
      <Title>AI Style Transfer</Title>
      <Subtitle>Transform your photos into beautiful Indian folk art styles</Subtitle>

      <TransferCard>
        <StepIndicator>
          <Step active={currentStep >= 1}>1. Upload Image</Step>
          <Step active={currentStep >= 2}>2. Choose Style</Step>
          <Step active={currentStep >= 3}>3. Transform</Step>
          <Step active={currentStep >= 4}>4. Download</Step>
        </StepIndicator>

        <ContentArea>
          <UploadSection>
            <SectionTitle>Upload Your Image</SectionTitle>
            {!selectedFile ? (
              <DropzoneArea {...getRootProps()} isDragActive={isDragActive}>
                <input {...getInputProps()} />
                <DropzoneContent>
                  <DropzoneIcon>
                    <UploadIcon size={20} />
                  </DropzoneIcon>
                  <div>
                    {isDragActive ? 'Drop your image here...' : 'Drag & drop or click to select'}
                  </div>
                </DropzoneContent>
              </DropzoneArea>
            ) : (
              <PreviewImage>
                <PreviewImg src={preview} alt="Preview" />
                <RemoveButton onClick={removeFile}>
                  <X size={16} />
                </RemoveButton>
              </PreviewImage>
            )}
          </UploadSection>

          <StyleSection>
            <SectionTitle>Choose Art Style</SectionTitle>
            <StyleGrid>
              {availableStyles.map((style) => (
                <StyleOption
                  key={style.name}
                  selected={selectedStyle === style.name}
                  onClick={() => handleStyleSelect(style.name)}
                >
                  <StyleIcon color={style.color}>
                    <Palette size={20} />
                  </StyleIcon>
                  <StyleName>{style.label}</StyleName>
                </StyleOption>
              ))}
            </StyleGrid>
          </StyleSection>
        </ContentArea>

        <TransferButton
          onClick={handleTransfer}
          disabled={!selectedFile || !selectedStyle || transferring}
        >
          <Sparkles size={20} />
          {transferring ? 'Transforming...' : 'Apply Style Transfer'}
        </TransferButton>

        {result && (
          <ResultSection>
            <SectionTitle>Style Transfer Result</SectionTitle>
            
            <ResultStats>
              <StatItem>
                <StatValue>{result.transfer_score.toFixed(2)}</StatValue>
                <StatLabel>Transfer Score</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{result.processing_time.toFixed(1)}s</StatValue>
                <StatLabel>Processing Time</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{selectedStyle}</StatValue>
                <StatLabel>Applied Style</StatLabel>
              </StatItem>
            </ResultStats>

            <ResultGrid>
              <ResultImage>
                <ResultLabel>Original</ResultLabel>
                <ResultImg src={preview} alt="Original" />
              </ResultImage>
              <ResultImage>
                <ResultLabel>Styled Result</ResultLabel>
                <ResultImg 
                  src={result.image_base64 || `http://localhost:8000/${result.output_image_path}`} 
                  alt="Styled"
                />
              </ResultImage>
            </ResultGrid>

            <DownloadButton onClick={downloadResult}>
              <Download size={18} />
              Download Styled Image
            </DownloadButton>
          </ResultSection>
        )}
      </TransferCard>
    </StyleTransferContainer>
  );
};

export default StyleTransfer;
