import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { toast } from 'react-toastify';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Heart, ArrowLeft } from 'lucide-react';
import { cartAPI, handleApiError } from '../services/api';

// Animation keyframes
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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const CartContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const CartContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const CartHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 300;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-5px);
  }
`;

const CartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left 0.8s ease;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  animation: ${slideIn} 0.6s ease-out;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 15px;
  margin-right: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.05) rotate(2deg);
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  color: white;
`;

const ItemTitle = styled.h3`
  margin: 0 0 0.8rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const ItemPrice = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const QuantityButton = styled.button`
  background: ${props => props.disabled ? 
    'rgba(255, 255, 255, 0.1)' : 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1))'
  };
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2));
    transform: scale(1.15);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const Quantity = styled.span`
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 30px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const RemoveButton = styled.button`
  background: linear-gradient(135deg, rgba(255, 99, 71, 0.4), rgba(255, 99, 71, 0.2));
  border: none;
  color: white;
  padding: 0.8rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);

  &:hover {
    background: linear-gradient(135deg, rgba(255, 99, 71, 0.6), rgba(255, 99, 71, 0.4));
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 10px 25px rgba(255, 99, 71, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CartSummary = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: fit-content;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  position: sticky;
  top: 2rem;
`;

const SummaryTitle = styled.h2`
  color: white;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 700;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  color: white;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: ${props => props.total ? 
    '3px solid rgba(255, 215, 0, 0.5)' : 
    '1px solid rgba(255, 255, 255, 0.2)'
  };
  transition: all 0.3s ease;
  
  &:hover {
    padding-left: 0.5rem;
    border-bottom-color: ${props => props.total ? 
      'rgba(255, 215, 0, 0.7)' : 
      'rgba(255, 255, 255, 0.4)'
    };
  }
`;

const SummaryLabel = styled.span`
  font-size: ${props => props.total ? '1.3rem' : '1.1rem'};
  font-weight: ${props => props.total ? '700' : '500'};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const SummaryValue = styled.span`
  font-size: ${props => props.total ? '1.3rem' : '1.1rem'};
  font-weight: ${props => props.total ? '700' : '600'};
  color: ${props => props.total ? '#ffd700' : 'white'};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const CheckoutButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  padding: 1.5rem;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  margin-top: 1.5rem;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(255, 215, 0, 0.4);
    background: linear-gradient(135deg, #ffed4e, #ffd700);
  }
  
  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
    }
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  color: white;
  padding: 5rem 2rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const EmptyCartIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 2rem;
  opacity: 0.6;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const EmptyCartTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const EmptyCartDescription = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  margin-bottom: 2rem;
`;

const BrowseButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: white;
  font-size: 1.2rem;
  flex-direction: column;
  gap: 1rem;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 0.5rem;
  
  div {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: white;
    animation: ${pulse} 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0; }
  }
`;

const SuccessAnimation = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  z-index: 1000;
  animation: ${fadeInUp} 0.5s ease-out;
`;

const Cart = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await cartAPI.getCartItems();
      if (response && response.items) {
        const mappedItems = response.items.map(item => ({
          id: item.cart_item_id,
          artwork: {
            id: item.artwork.id,
            title: item.artwork.title,
            description: item.artwork.description,
          },
          price: item.artwork.price,
          quantity: item.quantity,
          image_url: item.artwork.file_path ? 
            `http://localhost:8000/${item.artwork.file_path}` : 
            '/images/placeholder-art.jpg',
          item_total: item.item_total
        }));
        setCartItems(mappedItems);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to load cart: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      await cartAPI.updateCartItem(itemId, { quantity: newQuantity });
      setCartItems(items => 
        items.map(item => 
          item.id === itemId ? { 
            ...item, 
            quantity: newQuantity,
            item_total: item.price * newQuantity
          } : item
        )
      );
      toast.success('Cart updated successfully!', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to update cart: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    setUpdating(true);
    try {
      await cartAPI.removeCartItem(itemId);
      setCartItems(items => items.filter(item => item.id !== itemId));
      toast.success('Item removed from cart', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Failed to remove item: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setCheckingOut(true);
    try {
      const paymentData = {
        shipping_address: {
          name: user?.username || "Guest User",
          address: "123 Art Street",
          city: "Bangalore",
          state: "Karnataka",
          postal_code: "560001",
          country: "India"
        },
        payment_method: "card"
      };
      
      await cartAPI.checkout(paymentData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCartItems([]);
        toast.success('Order placed successfully! 🎉', {
          position: "top-center",
          autoClose: 3000,
        });
      }, 2000);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(`Checkout failed: ${errorMessage}`);
    } finally {
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (loading) {
    return (
      <CartContainer>
        <LoadingSpinner>
          <LoadingDots>
            <div></div>
            <div></div>
            <div></div>
          </LoadingDots>
          Loading your cart...
        </LoadingSpinner>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <BackButton onClick={() => window.history.back()}>
        <ArrowLeft size={24} />
      </BackButton>
      
      <CartContent>
        <CartHeader>
          <Title>Your Cart</Title>
          <Subtitle>Review your selected masterpieces</Subtitle>
        </CartHeader>

        {cartItems.length === 0 ? (
          <EmptyCart>
            <EmptyCartIcon>
              <ShoppingBag size={100} />
            </EmptyCartIcon>
            <EmptyCartTitle>Your cart is empty</EmptyCartTitle>
            <EmptyCartDescription>
              Discover beautiful artworks in our gallery
            </EmptyCartDescription>
            <BrowseButton onClick={() => window.location.href = '/gallery'}>
              Browse Gallery
            </BrowseButton>
          </EmptyCart>
        ) : (
          <CartGrid>
            <CartItems>
              <h2 style={{ 
                color: 'white', 
                marginBottom: '2rem', 
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                Cart Items ({cartItems.length})
              </h2>
              {cartItems.map((item, index) => (
                <CartItem key={item.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <ItemImage 
                    src={item.image_url}
                    alt={item.artwork?.title || 'Artwork'}
                    onError={(e) => { 
                      e.target.src = '/images/placeholder-art.jpg'; 
                    }}
                  />
                  <ItemDetails>
                    <ItemTitle>{item.artwork?.title || 'Unknown Artwork'}</ItemTitle>
                    <ItemPrice>₹{item.price?.toFixed(2) || '0.00'}</ItemPrice>
                  </ItemDetails>
                  <QuantityControls>
                    <QuantityButton 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={updating || item.quantity <= 1}
                    >
                      <Minus size={18} />
                    </QuantityButton>
                    <Quantity>{item.quantity}</Quantity>
                    <QuantityButton 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updating}
                    >
                      <Plus size={18} />
                    </QuantityButton>
                  </QuantityControls>
                  <RemoveButton 
                    onClick={() => removeItem(item.id)}
                    disabled={updating}
                  >
                    <Trash2 size={18} />
                  </RemoveButton>
                </CartItem>
              ))}
            </CartItems>

            <CartSummary>
              <SummaryTitle>
                <ShoppingBag size={28} />
                Order Summary
              </SummaryTitle>
              
              <SummaryRow>
                <SummaryLabel>Subtotal ({cartItems.length} items)</SummaryLabel>
                <SummaryValue>₹{subtotal.toFixed(2)}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Tax (10%)</SummaryLabel>
                <SummaryValue>₹{tax.toFixed(2)}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow total>
                <SummaryLabel total>Total Amount</SummaryLabel>
                <SummaryValue total>₹{total.toFixed(2)}</SummaryValue>
              </SummaryRow>
              
              <CheckoutButton 
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || checkingOut}
              >
                <CreditCard size={22} />
                {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
              </CheckoutButton>
            </CartSummary>
          </CartGrid>
        )}
      </CartContent>

      {showSuccess && (
        <SuccessAnimation>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your purchase</p>
        </SuccessAnimation>
      )}
    </CartContainer>
  );
};

export default Cart;
