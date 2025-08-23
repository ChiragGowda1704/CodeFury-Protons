// Floating Action Button Component

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ShoppingCart, Plus, Upload, Palette } from 'lucide-react';

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
`;

const FabContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
`;

const FabButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${float} 3s ease-in-out infinite;
  position: relative;
  
  &:hover {
    transform: translateY(-2px) scale(1.1);
    box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
    animation: ${pulse} 1.5s infinite;
  }
  
  &:active {
    transform: translateY(0) scale(1.05);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f5576c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(245, 87, 108, 0.3);
  animation: ${pulse} 2s infinite;
`;

const FloatingActionButton = ({ 
  icon = 'cart', 
  onClick, 
  badge = null,
  className = '',
  title = ''
}) => {
  const renderIcon = () => {
    switch(icon) {
      case 'cart':
        return <ShoppingCart size={24} />;
      case 'plus':
        return <Plus size={24} />;
      case 'upload':
        return <Upload size={24} />;
      case 'palette':
        return <Palette size={24} />;
      default:
        return <ShoppingCart size={24} />;
    }
  };

  return (
    <FabContainer className={className}>
      <FabButton onClick={onClick} title={title}>
        {renderIcon()}
        {badge && <Badge>{badge}</Badge>}
      </FabButton>
    </FabContainer>
  );
};

export default FloatingActionButton;
