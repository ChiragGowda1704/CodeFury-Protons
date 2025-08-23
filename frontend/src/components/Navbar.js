// Navigation bar component

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  Upload, 
  ImageIcon, 
  BarChart3, 
  Palette, 
  GamepadIcon, 
  ShoppingCart,
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
  }
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  animation: slideDown 0.6s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    color: #764ba2;
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: translateY(-1px);
    
    &:before {
      width: 80%;
    }
  }

  &:active {
    transform: translateY(0);
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
  const { t, i18n } = useTranslation();

  const isActiveRoute = (path) => location.pathname === path;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo>
          <Palette size={28} />
          {t('appTitle')}
        </Logo>

        <NavLinks isOpen={isMobileMenuOpen}>
          <NavLink 
            to="/dashboard" 
            isActive={isActiveRoute('/dashboard')}
            onClick={closeMobileMenu}
          >
            <Home size={18} />
            {t('dashboard')}
          </NavLink>

          <NavLink 
            to="/gallery" 
            isActive={isActiveRoute('/gallery')}
            onClick={closeMobileMenu}
          >
            <ImageIcon size={18} />
            {t('gallery')}
          </NavLink>

          <NavLink 
            to="/upload" 
            isActive={isActiveRoute('/upload')}
            onClick={closeMobileMenu}
          >
            <Upload size={18} />
            {t('uploadArt')}
          </NavLink>

          {/* Style Transfer link removed */}

          <NavLink 
            to="/enhance" 
            isActive={isActiveRoute('/enhance')}
            onClick={closeMobileMenu}
          >
            <Palette size={18} />
            {t('enhance')}
          </NavLink>

          <NavLink 
            to="/export-compliance" 
            isActive={isActiveRoute('/export-compliance')}
            onClick={closeMobileMenu}
          >
            <BarChart3 size={18} />
            {t('exportCompliance')}
          </NavLink>

          <NavLink 
            to="/game" 
            isActive={isActiveRoute('/game')}
            onClick={closeMobileMenu}
          >
            <GamepadIcon size={18} />
            {t('aiDrawGame')}
          </NavLink>

          <NavLink 
            to="/artists" 
            isActive={isActiveRoute('/artists')}
            onClick={closeMobileMenu}
          >
            <BarChart3 size={18} />
            {t('artists') || 'Artists'}
          </NavLink>

          <NavLink 
            to="/profile" 
            isActive={isActiveRoute('/profile')}
            onClick={closeMobileMenu}
          >
            <BarChart3 size={18} />
            {t('profile') || 'Profile'}
          </NavLink>

          <NavLink 
            to="/cart" 
            isActive={isActiveRoute('/cart')}
            onClick={closeMobileMenu}
          >
            <ShoppingCart size={18} />
            {t('cart')}
          </NavLink>

          {/* Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => changeLang('en')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: localStorage.getItem('lang') === 'en' ? '#667eea' : 'inherit' }}>EN</button>
            <span>/</span>
            <button onClick={() => changeLang('hi')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: localStorage.getItem('lang') === 'hi' ? '#667eea' : 'inherit' }}>हिं</button>
            <span>/</span>
            <button onClick={() => changeLang('kn')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: localStorage.getItem('lang') === 'kn' ? '#667eea' : 'inherit' }}>ಕ</button>
          </div>

          <UserInfo onClick={closeMobileMenu}>
            <span>{t('welcome', { name: user?.username || '' })}</span>
            <LogoutButton onClick={onLogout}>
              <LogOut size={16} />
              {t('logout')}
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
