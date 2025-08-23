import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { galleryAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Award, ImageIcon, Heart, Calendar } from 'lucide-react';

const ArtistsContainer = styled.div`
  padding: 2rem;
  color: white;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 2rem;
  text-align: center;
`;

const ArtistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
`;

const ArtistCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const ArtistName = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
`;

const ArtistStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
`;

const BadgeContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const JoinedDate = styled.p`
  color: #999;
  font-size: 0.8rem;
  margin: 1rem 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.2rem;
`;

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await galleryAPI.getArtists();
        setArtists(response);
      } catch (error) {
        toast.error('Failed to fetch artists.');
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

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
    switch (badge.toLowerCase()) {
      case 'premium':
      case 'gold':
      case 'diamond':
        return <Award size={12} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ArtistsContainer>
        <LoadingMessage>Loading artists...</LoadingMessage>
      </ArtistsContainer>
    );
  }

  return (
    <ArtistsContainer>
      <Title>Our Talented Artists</Title>
      <ArtistGrid>
        {artists.map((artist) => (
          <ArtistCard key={artist.id}>
            <ArtistName>{artist.username}</ArtistName>
            
            <ArtistStats>
              <StatItem>
                <ImageIcon size={16} />
                <span>{artist.total_uploads || 0} Uploads</span>
              </StatItem>
              <StatItem>
                <Heart size={16} />
                <span>{artist.total_likes || 0} Likes</span>
              </StatItem>
            </ArtistStats>

            {artist.badges && artist.badges.length > 0 && (
              <BadgeContainer>
                {artist.badges.map((badge, index) => (
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

            <JoinedDate>
              <Calendar size={14} />
              <span>Joined {new Date(artist.created_at).toLocaleDateString()}</span>
            </JoinedDate>
          </ArtistCard>
        ))}
      </ArtistGrid>
    </ArtistsContainer>
  );
};

export default Artists;
