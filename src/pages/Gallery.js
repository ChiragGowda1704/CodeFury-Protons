// Gallery page for browsing artworks

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Grid, List, Heart, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

import { galleryAPI, handleApiError } from '../services/api';

const GalleryContainer = styled.div`
  padding: 2rem;
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

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.8);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: #666;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.8);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 0.25rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : 'transparent'};
  color: ${props => props.active ? '#333' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ArtworkGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => 
    props.viewMode === 'grid' ? 
    'repeat(auto-fill, minmax(280px, 1fr))' : 
    '1fr'
  };
  gap: 2rem;
  margin-bottom: 2rem;
`;

const ArtworkCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: ${props => props.viewMode === 'list' ? 'flex' : 'block'};

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ArtworkImage = styled.img`
  width: ${props => props.viewMode === 'list' ? '200px' : '100%'};
  height: ${props => props.viewMode === 'list' ? '150px' : '200px'};
  object-fit: cover;
  cursor: pointer;
`;

const ArtworkInfo = styled.div`
  padding: 1.5rem;
  flex: 1;
`;

const ArtworkTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ArtworkMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.875rem;
`;

const StyleTag = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ConfidenceScore = styled.span`
  color: #28a745;
  font-weight: 500;
`;

const ArtworkDescription = styled.p`
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 2rem auto;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: white;
  font-size: 1.125rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: white;
  padding: 4rem 2rem;
  font-size: 1.125rem;
`;

const Gallery = ({ user }) => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchArtworks(true);
  }, [searchQuery, styleFilter]);

  const fetchArtworks = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setArtworks([]);
      } else {
        setLoadingMore(true);
      }

      const params = {
        skip: reset ? 0 : artworks.length,
        limit: 12
      };

      if (styleFilter) {
        params.style_filter = styleFilter;
      }

      let data;
      if (searchQuery) {
        data = await galleryAPI.searchArtworks(searchQuery, params);
      } else {
        data = await galleryAPI.getAllArtworks(params);
      }

      if (reset) {
        setArtworks(data);
      } else {
        setArtworks(prev => [...prev, ...data]);
      }

      setHasMore(data.length === params.limit);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to load artworks: ${errorMessage}`);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStyleFilterChange = (e) => {
    setStyleFilter(e.target.value);
  };

  const handleLoadMore = () => {
    fetchArtworks(false);
  };

  if (loading) {
    return (
      <GalleryContainer>
        <LoadingSpinner>Loading gallery...</LoadingSpinner>
      </GalleryContainer>
    );
  }

  return (
    <GalleryContainer>
      <Title>Art Gallery</Title>

      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search artworks..."
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <FilterSelect value={styleFilter} onChange={handleStyleFilterChange}>
          <option value="">All Styles</option>
          <option value="warli">Warli</option>
          <option value="madhubani">Madhubani</option>
          <option value="pithora">Pithora</option>
        </FilterSelect>

        <ViewToggle>
          <ViewButton 
            active={viewMode === 'grid'} 
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} />
            Grid
          </ViewButton>
          <ViewButton 
            active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
            List
          </ViewButton>
        </ViewToggle>
      </FilterBar>

      {artworks.length === 0 ? (
        <EmptyState>
          {searchQuery || styleFilter ? 
            'No artworks found matching your criteria.' : 
            'No artworks uploaded yet. Be the first to share your art!'
          }
        </EmptyState>
      ) : (
        <>
          <ArtworkGrid viewMode={viewMode}>
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} viewMode={viewMode}>
                <ArtworkImage
                  src={`http://localhost:8000/${artwork.file_path}`}
                  alt={artwork.title}
                  viewMode={viewMode}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xMDAgODBDNzEuMDcyIDgwIDQ4IDEwMy4wNzIgNDggMTMyQzQ4IDE2MC45MjggNzEuMDcyIDE4NCAxMDAgMTg0QzEyOC45MjggMTg0IDE1MiAxNjAuOTI4IDE1MiAxMzJDMTUyIDEwMy4wNzIgMTI4LjkyOCA4MCAxMDAgODBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                  }}
                />
                <ArtworkInfo>
                  <ArtworkTitle>{artwork.title}</ArtworkTitle>
                  <ArtworkMeta>
                    <div>
                      {artwork.predicted_style && (
                        <StyleTag>{artwork.predicted_style}</StyleTag>
                      )}
                    </div>
                    {artwork.confidence_score && (
                      <ConfidenceScore>
                        {(artwork.confidence_score * 100).toFixed(1)}% confidence
                      </ConfidenceScore>
                    )}
                  </ArtworkMeta>
                  {artwork.description && (
                    <ArtworkDescription>{artwork.description}</ArtworkDescription>
                  )}
                  <ArtworkMeta>
                    <span>Uploaded {new Date(artwork.created_at).toLocaleDateString()}</span>
                    <div style={{ display: 'flex', gap: '1rem', color: '#999' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Eye size={14} /> 
                        {Math.floor(Math.random() * 100) + 10}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Heart size={14} /> 
                        {Math.floor(Math.random() * 20) + 1}
                      </span>
                    </div>
                  </ArtworkMeta>
                </ArtworkInfo>
              </ArtworkCard>
            ))}
          </ArtworkGrid>

          {hasMore && (
            <LoadMoreButton onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading more...' : 'Load More'}
            </LoadMoreButton>
          )}
        </>
      )}
    </GalleryContainer>
  );
};

export default Gallery;
