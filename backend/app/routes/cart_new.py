# Shopping Cart Routes

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any
from app.models.mongodb_models import CartItem, Artwork, Order, User
from app.utils.mongodb_auth import get_current_user_mongo
from datetime import datetime

security = HTTPBearer()
router = APIRouter()

class AddToCartRequest(BaseModel):
    artwork_id: str
    quantity: int = 1

class CheckoutRequest(BaseModel):
    shipping_address: Dict[str, Any]
    payment_method: str = "card"

@router.get("/items")
async def get_cart_items(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all items in user's cart"""
    try:
        # Get current user
        current_user = await get_current_user_mongo(credentials)
        
        # Get cart items for the user
        cart_items = await CartItem.find(CartItem.user_id == str(current_user.id)).to_list()
        
        # Enrich with artwork details
        enriched_items = []
        for item in cart_items:
            artwork = await Artwork.get(item.artwork_id)
            if artwork:
                enriched_items.append({
                    "id": str(item.id),
                    "artwork_id": item.artwork_id,
                    "quantity": item.quantity,
                    "artwork": {
                        "id": str(artwork.id),
                        "title": artwork.title,
                        "price": artwork.price,
                        "image_url": artwork.image_url,
                        "artist_name": artwork.artist_name,
                        "is_for_sale": artwork.is_for_sale,
                        "sold": artwork.sold
                    }
                })
        
        return {"items": enriched_items}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cart: {str(e)}")

@router.post("/add-to-cart")
async def add_to_cart(
    request: AddToCartRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add artwork to cart"""
    try:
        # Get current user
        current_user = await get_current_user_mongo(credentials)
        
        # Check if artwork exists and is for sale
        artwork = await Artwork.get(request.artwork_id)
        if not artwork or not artwork.is_for_sale or artwork.sold:
            raise HTTPException(status_code=400, detail="Artwork not available for purchase")
        
        # Check if item already in cart
        existing_item = await CartItem.find_one(
            CartItem.user_id == str(current_user.id),
            CartItem.artwork_id == request.artwork_id
        )
        
        if existing_item:
            existing_item.quantity += request.quantity
            await existing_item.save()
            return {"message": "Cart updated", "item": existing_item}
        else:
            cart_item = CartItem(
                user_id=str(current_user.id),
                artwork_id=request.artwork_id,
                quantity=request.quantity
            )
            await cart_item.save()
            return {"message": "Item added to cart", "item": cart_item}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding to cart: {str(e)}")

@router.put("/items/{cart_item_id}")
async def update_cart_item(
    cart_item_id: str,
    updates: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update cart item"""
    try:
        current_user = await get_current_user_mongo(credentials)
        cart_item = await CartItem.get(cart_item_id)
        if not cart_item or cart_item.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        if 'quantity' in updates:
            quantity = updates['quantity']
            if quantity <= 0:
                await cart_item.delete()
                return {"message": "Item removed from cart"}
            else:
                cart_item.quantity = quantity
                await cart_item.save()
                return {"message": "Quantity updated", "item": cart_item}
        
        return {"message": "No updates provided"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating cart: {str(e)}")

@router.delete("/items/{cart_item_id}")
async def remove_cart_item(
    cart_item_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Remove cart item"""
    try:
        current_user = await get_current_user_mongo(credentials)
        cart_item = await CartItem.get(cart_item_id)
        if not cart_item or cart_item.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        await cart_item.delete()
        return {"message": "Item removed from cart"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing from cart: {str(e)}")

@router.post("/checkout")
async def checkout(
    request: CheckoutRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Checkout and create order"""
    try:
        current_user = await get_current_user_mongo(credentials)
        
        # Get cart items
        cart_items = await CartItem.find(CartItem.user_id == str(current_user.id)).to_list()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate total and prepare order items
        order_items = []
        total_amount = 0.0
        
        for cart_item in cart_items:
            artwork = await Artwork.get(cart_item.artwork_id)
            if artwork and artwork.is_for_sale and not artwork.sold:
                item_total = artwork.price * cart_item.quantity
                total_amount += item_total
                
                order_items.append({
                    "artwork_id": str(artwork.id),
                    "title": artwork.title,
                    "price": artwork.price,
                    "quantity": cart_item.quantity,
                    "item_total": item_total,
                    "artist_id": artwork.user_id
                })
                
                # Mark artwork as sold
                artwork.sold = True
                await artwork.save()
        
        if not order_items:
            raise HTTPException(status_code=400, detail="No available items in cart")
        
        # Create order
        order = Order(
            user_id=str(current_user.id),
            items=order_items,
            total_amount=total_amount,
            shipping_address=request.shipping_address,
            payment_method=request.payment_method,
            order_status="completed"  # Simplified for demo
        )
        await order.save()
        
        # Clear cart
        for cart_item in cart_items:
            await cart_item.delete()
        
        return {
            "message": "Order placed successfully",
            "order_id": str(order.id),
            "total_amount": total_amount,
            "items": order_items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during checkout: {str(e)}")

@router.get("/orders")
async def get_user_orders(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get user's order history"""
    try:
        current_user = await get_current_user_mongo(credentials)
        orders = await Order.find(Order.user_id == str(current_user.id)).sort("-created_at").to_list()
        return {"orders": orders}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

@router.delete("/clear")
async def clear_cart(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Clear all items from cart"""
    try:
        current_user = await get_current_user_mongo(credentials)
        cart_items = await CartItem.find(CartItem.user_id == str(current_user.id)).to_list()
        for item in cart_items:
            await item.delete()
        
        return {"message": f"Cleared {len(cart_items)} items from cart"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cart: {str(e)}")
