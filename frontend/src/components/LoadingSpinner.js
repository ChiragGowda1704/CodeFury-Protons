// Professional Loading Component

import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const wave = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1.0); }
`;

// Spinner Loader
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.size === 'small' ? '1rem' : '2rem'};
`;

const Spinner = styled.div`
  width: ${props => {
    switch(props.size) {
      case 'small': return '20px';
      case 'large': return '50px';
      default: return '30px';
    }
  }};
  height: ${props => {
    switch(props.size) {
      case 'small': return '20px';
      case 'large': return '50px';
      default: return '30px';
    }
  }};
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Wave Loader
const WaveContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  padding: 2rem;
`;

const WaveBar = styled.div`
  width: 4px;
  height: 20px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 2px;
  animation: ${wave} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
`;

// Pulse Loader
const PulseContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

const PulseDot = styled.div`
  width: 12px;
  height: 12px;
  background: linear-gradient(45deg, #f093fb, #f5576c);
  border-radius: 50%;
  margin: 0 3px;
  animation: ${pulse} 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

// Skeleton Loader
const SkeletonContainer = styled.div`
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin: 0.5rem 0;
`;

const SkeletonLine = styled.div`
  height: ${props => props.height || '15px'};
  width: ${props => props.width || '100%'};
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.2) 50%, 
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 200% 100%;
  animation: ${keyframes`
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  `} 2s infinite;
  border-radius: 5px;
  margin: 0.5rem 0;
`;

// Main Loading Component
const LoadingSpinner = ({ type = 'spinner', size = 'medium', text = '', className = '' }) => {
  const renderLoader = () => {
    switch (type) {
      case 'wave':
        return (
          <WaveContainer className={className}>
            <WaveBar delay={0} />
            <WaveBar delay={0.1} />
            <WaveBar delay={0.2} />
            <WaveBar delay={0.3} />
            <WaveBar delay={0.4} />
          </WaveContainer>
        );
      
      case 'pulse':
        return (
          <PulseContainer className={className}>
            <PulseDot delay={0} />
            <PulseDot delay={0.2} />
            <PulseDot delay={0.4} />
          </PulseContainer>
        );
      
      case 'skeleton':
        return (
          <SkeletonContainer className={className}>
            <SkeletonLine height="20px" width="80%" />
            <SkeletonLine height="15px" width="60%" />
            <SkeletonLine height="15px" width="90%" />
          </SkeletonContainer>
        );
      
      default:
        return (
          <SpinnerContainer className={className}>
            <Spinner size={size} />
            {text && <span style={{ marginLeft: '10px', color: 'white' }}>{text}</span>}
          </SpinnerContainer>
        );
    }
  };

  return renderLoader();
};

// Full Page Loading Overlay
const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
`;

const LoadingText = styled.p`
  color: white;
  margin-top: 1rem;
  font-size: 1.1rem;
  text-align: center;
`;

export const LoadingOverlay = ({ text = 'Loading...', type = 'spinner' }) => (
  <OverlayContainer>
    <LoadingSpinner type={type} size="large" />
    <LoadingText>{text}</LoadingText>
  </OverlayContainer>
);

export default LoadingSpinner;
