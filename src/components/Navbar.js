// Navigation bar component

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  Upload, 
  ImageIcon, 
  BarChart3, 
  Palette, 
  GamepadIcon, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    flex-direction: column;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.isActive ? '#667eea' : '#333'};
  background: ${props => props.isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  font-weight: ${props => props.isActive ? '600' : '400'};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #333;
  font-weight: 500;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #ff6b6b;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
    transform: translateY(-1px);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo>
          <Palette size={28} />
          Artist Showcase
        </Logo>

        <NavLinks isOpen={isMobileMenuOpen}>
          <NavLink 
            to="/dashboard" 
            isActive={isActiveRoute('/dashboard')}
            onClick={closeMobileMenu}
          >
            <Home size={18} />
            Dashboard
          </NavLink>

          <NavLink 
            to="/gallery" 
            isActive={isActiveRoute('/gallery')}
            onClick={closeMobileMenu}
          >
            <ImageIcon size={18} />
            Gallery
          </NavLink>

          <NavLink 
            to="/upload" 
            isActive={isActiveRoute('/upload')}
            onClick={closeMobileMenu}
          >
            <Upload size={18} />
            Upload Art
          </NavLink>

          <NavLink 
            to="/style-transfer" 
            isActive={isActiveRoute('/style-transfer')}
            onClick={closeMobileMenu}
          >
            <BarChart3 size={18} />
            Style Transfer
          </NavLink>

          <NavLink 
            to="/game" 
            isActive={isActiveRoute('/game')}
            onClick={closeMobileMenu}
          >
            <GamepadIcon size={18} />
            AI Draw Game
          </NavLink>

          <UserInfo onClick={closeMobileMenu}>
            <span>Welcome, {user?.username}!</span>
            <LogoutButton onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </LogoutButton>
          </UserInfo>
        </NavLinks>

        <MobileMenuButton onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </MobileMenuButton>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
