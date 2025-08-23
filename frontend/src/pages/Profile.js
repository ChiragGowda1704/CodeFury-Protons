import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { galleryAPI, authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { ImageIcon, Trash2, Award, Calendar, Heart } from 'lucide-react';

const ProfileContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: auto;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
`;

const ProfileHeader = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: #333;
  text-align: center;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled.h2`
  font-size: 2rem;
  margin: 0;
  color: #333;
`;

const UserStats = styled.div`
  display: flex;
  gap: 2rem;
  margin: 1rem 0;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Badge = styled.span`
  background: ${props => props.color || '#6c757d'};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const ArtworksSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  color: #333;
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ArtworkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const ArtworkCard = styled.div`
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

const ArtworkImage = styled.div`
  width: 100%;
  height: 200px;
  background: url(${props => props.src}) center/cover;
  background-color: #f8f9fa;
  position: relative;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(220, 53, 69, 1);
    transform: scale(1.1);
  }
`;

const ArtworkInfo = styled.div`
  padding: 1rem;
`;

const ArtworkTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
`;

const ArtworkMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.2rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 2rem;
`;

const Profile = ({ user }) => {
  const [userArtworks, setUserArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchUserArtworks = async () => {
      if (!user) return;
      
      try {
        const artworks = await galleryAPI.getUserArtworks(user.id);
        setUserArtworks(artworks);
      } catch (error) {
        toast.error('Failed to fetch your artworks.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserArtworks();
  }, [user]);

  const deleteArtwork = async (artworkId) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) {
      return;
    }

    try {
      setDeleting(artworkId);
      await galleryAPI.deleteArtwork(artworkId);
      setUserArtworks(prev => prev.filter(artwork => artwork.id !== artworkId));
      toast.success('Artwork deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete artwork.');
    } finally {
      setDeleting(null);
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge.toLowerCase()) {
      case 'premium':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'gold':
        return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
      case 'diamond':
        return 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)';
      default:
        return '#6c757d';
    }
  };

  const getBadgeIcon = (badge) => {
    return <Award size={12} />;
  };

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingMessage>Loading profile...</LoadingMessage>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <LoadingMessage>Please log in to view your profile.</LoadingMessage>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Title>My Profile</Title>
      
      <ProfileHeader>
        <UserInfo>
          <UserName>{user.username}</UserName>
          
          <UserStats>
            <StatItem>
              <ImageIcon size={16} />
              <span>{user.total_uploads || userArtworks.length} Uploads</span>
            </StatItem>
            <StatItem>
              <Heart size={16} />
              <span>{userArtworks.reduce((total, artwork) => total + (artwork.like_count || 0), 0)} Likes</span>
            </StatItem>
            <StatItem>
              <Calendar size={16} />
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </StatItem>
          </UserStats>

          {user.badges && user.badges.length > 0 && (
            <BadgeContainer>
              {user.badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  style={{ background: getBadgeColor(badge) }}
                >
                  {getBadgeIcon(badge)}
                  {badge}
                </Badge>
              ))}
            </BadgeContainer>
          )}
        </UserInfo>
      </ProfileHeader>

      <ArtworksSection>
        <SectionTitle>
          <ImageIcon size={20} />
          My Artworks ({userArtworks.length})
        </SectionTitle>
        
        {userArtworks.length === 0 ? (
          <EmptyMessage>
            You haven't uploaded any artworks yet. Start creating and share your art with the world!
          </EmptyMessage>
        ) : (
          <ArtworkGrid>
            {userArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id}>
                <ArtworkImage src={`http://localhost:8000/uploads/${artwork.filename}`}>
                  <DeleteButton 
                    onClick={() => deleteArtwork(artwork.id)}
                    disabled={deleting === artwork.id}
                  >
                    <Trash2 size={16} />
                  </DeleteButton>
                </ArtworkImage>
                <ArtworkInfo>
                  <ArtworkTitle>{artwork.title}</ArtworkTitle>
                  <ArtworkMeta>
                    <span>{artwork.predicted_style}</span>
                    <span>{artwork.like_count || 0} ❤️</span>
                  </ArtworkMeta>
                </ArtworkInfo>
              </ArtworkCard>
            ))}
          </ArtworkGrid>
        )}
      </ArtworksSection>
    </ProfileContainer>
  );
};

export default Profile;
