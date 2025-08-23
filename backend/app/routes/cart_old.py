# Shopping Cart Routes

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Any
from app.models.mongodb_models import CartItem, Artwork, Order, User
from app.utils.mongodb_auth import get_current_user_mongo
from datetime import datetime
import random

security = HTTPBearer()
router = APIRouter()

class AddToCartRequest(BaseModel):
    artwork_id: str
    quantity: int = 1

@router.get("/items")
async def get_cart_items(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all items in user's cart"""
    try:
        # Get current user
        current_user = await get_current_user_mongo(credentials)
        
        cart_items = await CartItem.find(CartItem.user_id == str(current_user.id)).to_list()
        
        # Populate with artwork details
        cart_with_details = []
        total_amount = 0.0
        
        for item in cart_items:
            artwork = await Artwork.get(item.artwork_id)
            if artwork and artwork.is_for_sale and not artwork.sold:
                item_total = artwork.price * item.quantity
                total_amount += item_total
                
                cart_with_details.append({
                    "cart_item_id": str(item.id),
                    "artwork": {
                        "id": str(artwork.id),
                        "title": artwork.title,
                        "description": artwork.description,
                        "price": artwork.price,
                        "filename": artwork.filename,
                        "file_path": artwork.file_path,
                        "predicted_style": artwork.predicted_style,
                        "artist_name": artwork.artist_name
                    },
                    "quantity": item.quantity,
                    "item_total": item_total,
                    "added_at": item.added_at
                })
        
        return {
            "items": cart_with_details,
            "total_amount": total_amount,
            "total_items": len(cart_with_details)
        }
        
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
        if not artwork:
            raise HTTPException(status_code=404, detail="Artwork not found")
        
        if not artwork.is_for_sale or getattr(artwork, 'sold', False):
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

@router.put("/update-quantity/{cart_item_id}")
async def update_cart_quantity(
    cart_item_id: str,
    quantity: int,
    current_user: User = Depends(get_current_user_mongo)
):
    """Update quantity of item in cart"""
    try:
        cart_item = await CartItem.get(cart_item_id)
        if not cart_item or cart_item.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        if quantity <= 0:
            await cart_item.delete()
            return {"message": "Item removed from cart"}
        else:
            cart_item.quantity = quantity
            await cart_item.save()
            return {"message": "Quantity updated", "item": cart_item}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating cart: {str(e)}")

@router.delete("/remove/{cart_item_id}")
async def remove_from_cart(
    cart_item_id: str,
    current_user: User = Depends(get_current_user_mongo)
):
    """Remove item from cart"""
    try:
        cart_item = await CartItem.get(cart_item_id)
        if not cart_item or cart_item.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        await cart_item.delete()
        return {"message": "Item removed from cart"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing from cart: {str(e)}")

class CheckoutRequest(BaseModel):
    shipping_address: Dict[str, Any]
    payment_method: str = "card"

@router.post("/checkout")
async def checkout(
    request: CheckoutRequest,
    current_user: User = Depends(get_current_user_mongo)
):
    """Checkout and create order"""
    try:
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
async def get_user_orders(current_user: User = Depends(get_current_user_mongo)):
    """Get user's order history"""
    try:
        orders = await Order.find(Order.user_id == str(current_user.id)).sort("-created_at").to_list()
        return {"orders": orders}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching orders: {str(e)}")

# Additional routes to match frontend expectations
@router.put("/items/{cart_item_id}")
async def update_cart_item(
    cart_item_id: str,
    updates: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update cart item (alternative route for frontend compatibility)"""
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
    """Remove cart item (alternative route for frontend compatibility)"""
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

@router.delete("/items/{cart_item_id}")
async def remove_cart_item(
    cart_item_id: str,
    current_user: User = Depends(get_current_user_mongo)
):
    """Remove cart item (alternative route for frontend compatibility)"""
    try:
        cart_item = await CartItem.get(cart_item_id)
        if not cart_item or cart_item.user_id != str(current_user.id):
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        await cart_item.delete()
        return {"message": "Item removed from cart"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing from cart: {str(e)}")

@router.delete("/clear")
async def clear_cart(current_user: User = Depends(get_current_user_mongo)):
    """Clear all items from cart"""
    try:
        cart_items = await CartItem.find(CartItem.user_id == str(current_user.id)).to_list()
        for item in cart_items:
            await item.delete()
        
        return {"message": f"Cleared {len(cart_items)} items from cart"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cart: {str(e)}")
