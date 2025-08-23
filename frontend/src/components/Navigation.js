// Navigation component with sidebar layout

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
  X,
  User,
  Users,
  FileText
} from 'lucide-react';

const NavContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SidebarToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: #5a6fd8;
    transform: translateY(-1px);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #333;
  font-weight: 500;

  @media (max-width: 768px) {
    display: none;
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

const LanguageSwitcher = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
`;

const LangButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: ${props => props.active ? '#667eea' : 'inherit'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.9rem;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const Sidebar = styled.div`
  position: fixed;
  top: 70px;
  left: 0;
  width: 280px;
  height: calc(100vh - 70px);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 999;
  overflow-y: auto;
`;

const SidebarContent = styled.div`
  padding: 2rem 1.5rem;
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const SidebarLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.isActive ? '#667eea' : '#333'};
  background: ${props => props.isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  font-weight: ${props => props.isActive ? '600' : '400'};
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: translateX(5px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: ${props => props.show ? 1 : 0};
  visibility: ${props => props.show ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const MainContent = styled.div`
  margin-left: ${props => props.sidebarOpen ? '280px' : '0'};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Navigation = ({ user, onLogout, children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const isActiveRoute = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
  };

  const currentLang = localStorage.getItem('lang') || 'en';

  return (
    <>
      <NavContainer>
        <TopBar>
          <LeftSection>
            <SidebarToggle onClick={toggleSidebar}>
              <Menu size={20} />
              {t('menu') || 'Menu'}
            </SidebarToggle>
            
            <Logo>
              <Palette size={28} />
              {t('appTitle')}
            </Logo>
          </LeftSection>

          <TopBarActions>
            <LanguageSwitcher>
              <LangButton 
                active={currentLang === 'en'} 
                onClick={() => changeLang('en')}
              >
                EN
              </LangButton>
              <span>|</span>
              <LangButton 
                active={currentLang === 'hi'} 
                onClick={() => changeLang('hi')}
              >
                हिं
              </LangButton>
              <span>|</span>
              <LangButton 
                active={currentLang === 'kn'} 
                onClick={() => changeLang('kn')}
              >
                ಕ
              </LangButton>
            </LanguageSwitcher>

            <UserInfo>
              <span>{t('welcome', { name: user?.username || '' })}</span>
              <LogoutButton onClick={onLogout}>
                <LogOut size={16} />
                {t('logout')}
              </LogoutButton>
            </UserInfo>
          </TopBarActions>
        </TopBar>
      </NavContainer>

      <Overlay show={isSidebarOpen} onClick={closeSidebar} />

      <Sidebar isOpen={isSidebarOpen}>
        <SidebarContent>
          <SidebarSection>
            <SectionTitle>{t('navigation') || 'Navigation'}</SectionTitle>
            
            <SidebarLink 
              to="/dashboard" 
              isActive={isActiveRoute('/dashboard')}
              onClick={closeSidebar}
            >
              <Home />
              {t('dashboard')}
            </SidebarLink>

            <SidebarLink 
              to="/gallery" 
              isActive={isActiveRoute('/gallery')}
              onClick={closeSidebar}
            >
              <ImageIcon />
              {t('gallery')}
            </SidebarLink>

            <SidebarLink 
              to="/upload" 
              isActive={isActiveRoute('/upload')}
              onClick={closeSidebar}
            >
              <Upload />
              {t('uploadArt')}
            </SidebarLink>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>{t('tools') || 'Tools'}</SectionTitle>
            
            <SidebarLink 
              to="/enhance" 
              isActive={isActiveRoute('/enhance')}
              onClick={closeSidebar}
            >
              <Palette />
              {t('enhance')}
            </SidebarLink>

            <SidebarLink 
              to="/game" 
              isActive={isActiveRoute('/game')}
              onClick={closeSidebar}
            >
              <GamepadIcon />
              {t('aiDrawGame')}
            </SidebarLink>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>{t('community') || 'Community'}</SectionTitle>
            
            <SidebarLink 
              to="/artists" 
              isActive={isActiveRoute('/artists')}
              onClick={closeSidebar}
            >
              <Users />
              {t('artists') || 'Artists'}
            </SidebarLink>

            <SidebarLink 
              to="/profile" 
              isActive={isActiveRoute('/profile')}
              onClick={closeSidebar}
            >
              <User />
              {t('profile') || 'Profile'}
            </SidebarLink>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>{t('shop') || 'Shop'}</SectionTitle>
            
            <SidebarLink 
              to="/cart" 
              isActive={isActiveRoute('/cart')}
              onClick={closeSidebar}
            >
              <ShoppingCart />
              {t('cart')}
            </SidebarLink>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>{t('compliance') || 'Compliance'}</SectionTitle>
            
            <SidebarLink 
              to="/export-compliance" 
              isActive={isActiveRoute('/export-compliance')}
              onClick={closeSidebar}
            >
              <FileText />
              {t('exportCompliance')}
            </SidebarLink>
          </SidebarSection>
        </SidebarContent>
      </Sidebar>

      <MainContent sidebarOpen={isSidebarOpen && window.innerWidth > 768}>
        {children}
      </MainContent>
    </>
  );
};

export default Navigation;
