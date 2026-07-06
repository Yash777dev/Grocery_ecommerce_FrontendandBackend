import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartLocal, cartStart, cartSuccess, cartFailure } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { cartService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Heart, Star, ShoppingCart, Leaf } from 'lucide-react';

export function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const isWishlisted = wishlistItems.some((item) => item.id === product.id);

  // Calculate prices
  const hasDiscount = product.discount > 0;
  const discountAmount = hasDiscount ? (product.price * product.discount) / 100 : 0;
  const finalPrice = product.price - discountAmount;

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id));
      showToast('Removed from wishlist', 'info');
    } else {
      dispatch(addToWishlist(product));
      showToast('Added to wishlist', 'success');
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      showToast('Product is out of stock', 'error');
      return;
    }

    if (isAuthenticated) {
      dispatch(cartStart());
      try {
        await cartService.addToCart(product.id, 1);
        // Fetch fresh cart items to keep Redux in sync
        const items = await cartService.getCart();
        dispatch(cartSuccess(items));
        showToast(`Added ${product.name} to cart`, 'success');
      } catch (err) {
        dispatch(cartFailure(err.message || 'Failed to sync cart'));
        showToast('Error syncing with cart API', 'error');
      }
    } else {
      // Local fallback for guest users
      dispatch(addToCartLocal({
        product_id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.images[0] || '',
        stock: product.stock,
        category: product.category,
        organic: product.organic,
        eco_certified: product.eco_certified
      }));
      showToast(`Added ${product.name} to local cart`, 'success');
    }
  };

  return (
    <div
      className="card"
      onClick={handleCardClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10,
          background: 'var(--color-cream)',
          border: 'none',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          color: isWishlisted ? 'var(--color-red)' : 'var(--color-text-light)',
          transition: 'all 0.2s ease'
        }}
      >
        <Heart size={18} fill={isWishlisted ? 'var(--color-red)' : 'transparent'} />
      </button>

      {/* Badges container */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {product.organic && (
          <span className="badge badge-organic">
            <Leaf size={10} fill="currentColor" />
            Organic
          </span>
        )}
        {product.eco_certified && (
          <span className="badge badge-eco">
            Certified
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="zoom-container" style={{ margin: '-1.5rem -1.5rem 1rem', height: '220px' }}>
        <img
          src={product.images[0] || 'https://via.placeholder.com/300x200?text=Organic+Product'}
          alt={product.name}
          className="zoom-img"
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.25rem' }}>
          {product.brand}
        </span>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', height: '2.8rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'var(--color-text-dark)' }}>
          {product.name}
        </h3>

        {/* Rating and Stock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
            <Star size={14} fill="#fbbf24" />
            <span style={{ fontWeight: 700, color: 'var(--color-text-dark)' }}>{product.rating}</span>
          </div>
          <span style={{ color: product.stock > 0 ? 'var(--color-forest)' : 'var(--color-red)', fontWeight: 600 }}>
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </span>
        </div>

        {/* Price and Cart Button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <div>
            {hasDiscount ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}>
                  ${finalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="btn btn-primary"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              opacity: product.stock <= 0 ? 0.6 : 1,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingCart size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
