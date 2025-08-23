// Page Transition Wrapper Component

import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const PageWrapper = styled.div`
  animation: ${props => {
    switch(props.animation) {
      case 'slideLeft': return slideInLeft;
      case 'slideRight': return slideInRight;
      case 'scale': return scaleIn;
      default: return fadeInUp;
    }
  }} 0.5s ease-out;
  animation-fill-mode: both;
  min-height: 100vh;
`;

const PageTransition = ({ 
  children, 
  animation = 'fadeUp', 
  delay = 0,
  className = '' 
}) => {
  return (
    <PageWrapper 
      animation={animation} 
      style={{ animationDelay: `${delay}s` }}
      className={className}
    >
      {children}
    </PageWrapper>
  );
};

export default PageTransition;
