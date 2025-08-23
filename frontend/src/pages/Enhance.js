import React, { useState } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { mlAPI } from '../services/api';

const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const Drop = styled.div`
  border: 2px dashed #ddd; border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer;
`;

const Img = styled.img`
  max-width: 100%; border-radius: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.08);
`;

const Slider = styled.input` width: 100%; margin: 1rem 0; `;

const Button = styled.button`
  background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; border:none; padding:0.75rem 1.25rem; border-radius:10px; cursor:pointer;
`;

export default function Enhance() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [strength, setStrength] = useState(0.6);
  const [selectedEffects, setSelectedEffects] = useState(['default']);

  const availableEffects = [
    { value: 'default', label: 'Default Enhancement' },
    { value: 'sharpen', label: 'Sharpen' },
    { value: 'contrast', label: 'Contrast Boost' },
    { value: 'brightness', label: 'Brightness' },
    { value: 'denoise', label: 'Noise Reduction' },
    { value: 'vintage', label: 'Vintage Effect' },
    { value: 'vignette', label: 'Vignette' },
    { value: 'edges', label: 'Edge Enhancement' },
    { value: 'cartoon', label: 'Cartoon Style' }
  ];

  const onDrop = (accepted) => {
    const f = accepted[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpg','.jpeg','.png','.webp'] }, multiple:false });

  const toggleEffect = (effect) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const runEnhance = async () => {
    if (!file) { toast.error('Select an image'); return; }
    try {
      const res = await mlAPI.enhanceImage(file, strength, selectedEffects);
      setResult(res);
      toast.success('Enhanced!');
    } catch (e) {
      toast.error('Enhancement failed');
    }
  };

  return (
    <Container>
      <Card>
        <h2 style={{color:'#333', marginTop:0}}>Image Enhancer</h2>
        <Row>
          <div>
            <Drop {...getRootProps()} style={{ background:isDragActive? 'rgba(102,126,234,0.06)':'#fafafa' }}>
              <input {...getInputProps()} />
              {preview ? <Img src={preview} alt="preview" /> : <p>Drop or click to choose an image</p>}
            </Drop>
            <div>
              <label>Strength: {strength.toFixed(2)}</label>
              <Slider type="range" min="0.2" max="1.5" step="0.05" value={strength} onChange={(e)=>setStrength(parseFloat(e.target.value))} />
            </div>
            <div>
              <label style={{marginBottom:'0.5rem', display:'block'}}>Effects:</label>
              <div style={{display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'1rem'}}>
                {availableEffects.map(effect => (
                  <label key={effect.value} style={{
                    display:'flex', 
                    alignItems:'center', 
                    gap:'0.25rem',
                    background: selectedEffects.includes(effect.value) ? '#667eea' : '#f0f0f0',
                    color: selectedEffects.includes(effect.value) ? 'white' : '#333',
                    padding:'0.25rem 0.5rem',
                    borderRadius:'5px',
                    cursor:'pointer',
                    fontSize:'0.8rem'
                  }}>
                    <input 
                      type="checkbox" 
                      checked={selectedEffects.includes(effect.value)}
                      onChange={() => toggleEffect(effect.value)}
                      style={{display:'none'}}
                    />
                    {effect.label}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={runEnhance}>Enhance Image</Button>
          </div>
          <div>
            {result ? (
              <div>
                <p style={{color:'#555'}}>Enhanced Result</p>
                <Img src={result.image_base64 || result.output_url} alt="result" />
              </div>
            ) : (
              <div style={{color:'#777'}}>Enhanced image will appear here</div>
            )}
          </div>
        </Row>
      </Card>
    </Container>
  );
}
