// Gallery page for browsing artworks

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Grid, List, Heart, ShoppingCart, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

import { galleryAPI, cartAPI, handleApiError } from '../services/api';
import FloatingActionButton from '../components/FloatingActionButton';

const GalleryContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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

const PriceCartSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ArtworkPrice = styled.div`
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AddToCartButton = styled.button`
  background: ${props => props.adding ? 
    'linear-gradient(135deg, #ff6b6b, #ee5a24)' :
    'linear-gradient(135deg, #28a745, #20c997)'
  };
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  min-width: 120px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: ${props => props.adding ? '0' : '-100%'};
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 20px rgba(40, 167, 69, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    transform: none;
  }

  ${props => props.adding && `
    animation: pulse 0.8s ease-in-out infinite;
  `}

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
    
    &:before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px) scale(1.01);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &:before {
      display: none;
    }
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
  const [availableStyles, setAvailableStyles] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [likingArtwork, setLikingArtwork] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    fetchArtworks(true);
    fetchCartCount(); // Fetch cart count on component mount
  }, [searchQuery, styleFilter]);

  const addToCart = async (artworkId) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }
    
    try {
      setAddingToCart(artworkId);
      await cartAPI.addToCart(artworkId, 1);
      
      // Success animation
      toast.success('🛒 Added to cart successfully!', {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Update cart count
      fetchCartCount();
      
      // Add a small delay for better UX
      setTimeout(() => {
        setAddingToCart(null);
      }, 600);
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to add to cart: ${errorMessage}`, {
        position: "bottom-right",
        autoClose: 3000,
      });
      setAddingToCart(null);
    }
  };

  // Fetch cart items count
  const fetchCartCount = async () => {
    try {
      const cartData = await cartAPI.getCart();
      const count = cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartItemsCount(count);
    } catch (error) {
      // Silently handle cart fetch errors
      setCartItemsCount(0);
    }
  };

  const navigateToCart = () => {
    window.location.href = '/cart';
  };

  const likeArtwork = async (artworkId) => {
    if (!user) {
      toast.error('Please log in to like artworks');
      return;
    }
    
    try {
      setLikingArtwork(artworkId);
      const response = await galleryAPI.likeArtwork(artworkId);
      
      // Update local state
      setArtworks(prevArtworks => 
        prevArtworks.map(artwork => 
          artwork.id === artworkId 
            ? { 
                ...artwork, 
                like_count: response.like_count,
                isLiked: response.liked 
              }
            : artwork
        )
      );
      
      toast.success(response.message);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to like artwork: ${errorMessage}`);
    } finally {
      setLikingArtwork(null);
    }
  };

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
        // Add isLiked property based on current user
        const artworksWithLikeStatus = data.map(artwork => ({
          ...artwork,
          isLiked: user && artwork.likes && artwork.likes.includes(user.id)
        }));
        setArtworks(artworksWithLikeStatus);
        // Extract unique styles for the filter dropdown
        const styles = [...new Set(data.map(artwork => artwork.predicted_style).filter(Boolean))];
        setAvailableStyles(styles);
      } else {
        setArtworks(prev => {
          // Add isLiked property to new artworks
          const newArtworksWithLikeStatus = data.map(artwork => ({
            ...artwork,
            isLiked: user && artwork.likes && artwork.likes.includes(user.id)
          }));
          const newArtworks = [...prev, ...newArtworksWithLikeStatus];
          // Update available styles when loading more
          const styles = [...new Set(newArtworks.map(artwork => artwork.predicted_style).filter(Boolean))];
          setAvailableStyles(styles);
          return newArtworks;
        });
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
          {availableStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
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
                    <span 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        cursor: 'pointer',
                        color: artwork.isLiked ? '#e74c3c' : '#999'
                      }}
                      onClick={() => likeArtwork(artwork.id)}
                    >
                      <Heart 
                        size={14} 
                        fill={artwork.isLiked ? '#e74c3c' : 'none'}
                        style={{
                          opacity: likingArtwork === artwork.id ? 0.5 : 1
                        }}
                      /> 
                      {artwork.like_count || 0}
                    </span>
                  </ArtworkMeta>
                  
                  {/* Price and Cart Section */}
                  <PriceCartSection>
                    <ArtworkPrice>
                      ₹
                      {(artwork.price || Math.floor(Math.random() * 200) + 50).toFixed(2)}
                    </ArtworkPrice>
                    {artwork.is_for_sale !== false && (
                      <AddToCartButton 
                        onClick={() => addToCart(artwork.id)}
                        disabled={addingToCart === artwork.id}
                        adding={addingToCart === artwork.id}
                      >
                        <ShoppingCart size={16} />
                        {addingToCart === artwork.id ? 'Adding...' : 'Add to Cart'}
                      </AddToCartButton>
                    )}
                  </PriceCartSection>
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
      
      {/* Floating Cart Button */}
      <FloatingActionButton
        icon="cart"
        badge={cartItemsCount > 0 ? cartItemsCount : null}
        onClick={navigateToCart}
        title={`Cart (${cartItemsCount} items)`}
      />
    </GalleryContainer>
  );
};

export default Gallery;
