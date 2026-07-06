import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import { removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { addToCartLocal, cartStart, cartSuccess, cartFailure } from '../../redux/slices/cartSlice';
import { cartService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

export function Wishlist() {
  const navigate = useRouterNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleMoveToCart = async (product) => {
    // 1. Add to cart
    if (isAuthenticated) {
      dispatch(cartStart());
      try {
        await cartService.addToCart(product.id, 1);
        const items = await cartService.getCart();
        dispatch(cartSuccess(items));
        showToast(`Moved ${product.name} to cart`, 'success');
      } catch (err) {
        dispatch(cartFailure(err.message));
        showToast('Failed to sync cart API', 'error');
        return;
      }
    } else {
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
      showToast(`Moved ${product.name} to local cart`, 'success');
    }

    // 2. Remove from wishlist
    dispatch(removeFromWishlist(product.id));
  };

  const handleRemove = (productId) => {
    dispatch(removeFromWishlist(productId));
    showToast('Removed from wishlist', 'info');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Navigation aid */}
      <RouterLink to="/products" style={{ color: 'var(--color-forest)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '2rem' }}>
        <ArrowLeft size={16} />
        <span>Continue Shopping</span>
      </RouterLink>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Heart size={28} fill="var(--color-forest)" />
        <span>My Wishlist ({wishlistItems.length})</span>
      </h1>

      {wishlistItems.length === 0 ? (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Heart size={48} style={{ color: 'var(--color-text-light)' }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-forest)' }}>Your Wishlist is Empty</h3>
          <p style={{ maxWidth: '400px' }}>
            Bookmark your favorite organic foods, sustainable items, and eco-certified cosmetics to purchase them later.
          </p>
          <RouterLink to="/products" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Explore Products
          </RouterLink>
        </div>
      ) : (
        <div className="grid grid-4">
          {wishlistItems.map((product) => {
            const hasDiscount = product.discount > 0;
            const finalPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

            return (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                
                {/* Delete button */}
                <button
                  onClick={() => handleRemove(product.id)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 10,
                    background: 'var(--color-cream)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-red)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>

                {/* Product Image */}
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px', marginBottom: '1rem', cursor: 'pointer' }}
                     onClick={() => navigate(`/products/${product.id}`)}>
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {product.brand}
                  </span>
                  <h3
                    onClick={() => navigate(`/products/${product.id}`)}
                    style={{ fontSize: '1rem', cursor: 'pointer', margin: '0.2rem 0 0.5rem', height: '2.5rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'var(--color-text-dark)' }}
                  >
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    {hasDiscount ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-forest)', fontSize: '1.15rem' }}>
                          ${finalPrice.toFixed(2)}
                        </span>
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 800, color: 'var(--color-forest)', fontSize: '1.15rem' }}>
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Move to Cart */}
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: 'auto', display: 'flex', gap: '0.5rem' }}
                  >
                    <ShoppingCart size={14} />
                    <span>Move to Cart</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default Wishlist;
