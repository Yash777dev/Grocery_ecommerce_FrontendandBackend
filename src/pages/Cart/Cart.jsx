import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  cartStart,
  cartSuccess,
  cartFailure,
  updateQuantityLocal,
  toggleSaveForLaterLocal,
  removeFromCartLocal,
  applyCoupon,
  removeCoupon
} from '../../redux/slices/cartSlice';
import { cartService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, Trash2, Bookmark, BookmarkCheck, ArrowRight, Sparkles, Tag, X } from 'lucide-react';

export function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems, appliedCoupon, loading } = useSelector((state) => state.cart);

  const [couponInput, setCouponInput] = useState('');

  // Auto-fetch cart if logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        dispatch(cartStart());
        try {
          const items = await cartService.getCart();
          dispatch(cartSuccess(items));
        } catch (err) {
          dispatch(cartFailure(err.message || 'Failed to fetch cart'));
        }
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  // Math variables
  const activeItems = cartItems.filter(item => !item.saved_for_later);
  const savedItems = cartItems.filter(item => item.saved_for_later);

  const subtotal = activeItems.reduce((acc, item) => {
    const price = item.price * (1 - item.discount / 100);
    return acc + price * item.quantity;
  }, 0);

  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const couponDiscount = (subtotal * discountPercent) / 100;
  
  const gstRate = 0.18; // 18% GST
  const gst = (subtotal - couponDiscount) * gstRate;
  
  const shippingFee = subtotal > 35 ? 0.0 : 4.99;
  const total = subtotal - couponDiscount + gst + shippingFee;

  const handleQtyChange = async (productId, currentQty, amount) => {
    const nextQty = Math.max(1, currentQty + amount);
    if (isAuthenticated) {
      dispatch(cartStart());
      try {
        await cartService.addToCart(productId, nextQty);
        const items = await apiFetchCart();
        dispatch(cartSuccess(items));
      } catch (err) {
        dispatch(cartFailure(err.message));
        showToast('Failed to update quantity', 'error');
      }
    } else {
      dispatch(updateQuantityLocal({ product_id: productId, quantity: nextQty }));
    }
  };

  const handleRemove = async (productId) => {
    if (isAuthenticated) {
      dispatch(cartStart());
      try {
        await cartService.removeFromCart(productId);
        const items = await apiFetchCart();
        dispatch(cartSuccess(items));
        showToast('Item removed from cart', 'success');
      } catch (err) {
        dispatch(cartFailure(err.message));
        showToast('Failed to remove item', 'error');
      }
    } else {
      dispatch(removeFromCartLocal(productId));
      showToast('Item removed from local cart', 'success');
    }
  };

  const handleToggleSaveLater = async (productId, currentSaved) => {
    const nextSavedState = !currentSaved;
    if (isAuthenticated) {
      dispatch(cartStart());
      try {
        // Find existing qty
        const match = cartItems.find(item => item.product_id === productId);
        await cartService.addToCart(productId, match.quantity, nextSavedState);
        const items = await apiFetchCart();
        dispatch(cartSuccess(items));
        showToast(nextSavedState ? 'Item saved for later' : 'Item moved back to cart', 'success');
      } catch (err) {
        dispatch(cartFailure(err.message));
      }
    } else {
      dispatch(toggleSaveForLaterLocal({ product_id: productId }));
      showToast(nextSavedState ? 'Item saved for later' : 'Item moved back to cart', 'success');
    }
  };

  const apiFetchCart = async () => {
    return await cartService.getCart();
  };

  const handleCouponApply = (e) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    
    let discount = 0;
    if (code === 'ECO10') discount = 10;
    else if (code === 'SEED15') discount = 15;
    else if (code === 'PLANT20') discount = 20;

    if (discount > 0) {
      dispatch(applyCoupon({ code, discountPercent: discount }));
      showToast(`Promo ${code} applied successfully (${discount}% Off)!`, 'success');
      setCouponInput('');
    } else {
      showToast('Invalid promo code. Check the offers banner!', 'error');
    }
  };

  const handleAutoApply = (code, discount) => {
    dispatch(applyCoupon({ code, discountPercent: discount }));
    showToast(`Promo ${code} auto-applied!`, 'success');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2rem' }}>
        Your Organic Cart
      </h1>

      {activeItems.length === 0 ? (
        /* Empty Cart State */
        <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <ShoppingBag size={48} style={{ color: 'var(--color-text-light)' }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-forest)' }}>Your Cart is Empty</h3>
          <p style={{ maxWidth: '400px' }}>
            Looks like you haven't added any organic goodies yet. Head to our store to explore fresh sustainable food!
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }} className="cart-layout">
          
          {/* Active Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeItems.map((item) => (
              <div
                key={item.product_id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase', fontWeight: 700 }}>
                    {item.category}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.1rem 0 0.4rem', color: 'var(--color-text-dark)' }}>
                    {item.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {item.organic && <span className="badge badge-organic">Organic</span>}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)' }}>
                  <button
                    onClick={() => handleQtyChange(item.product_id, item.quantity, -1)}
                    style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
                  >
                    &minus;
                  </button>
                  <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                  <button
                    onClick={() => handleQtyChange(item.product_id, item.quantity, 1)}
                    disabled={item.quantity >= item.stock}
                    style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', opacity: item.quantity >= item.stock ? 0.4 : 1 }}
                  >
                    +
                  </button>
                </div>

                {/* Price display */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-forest)' }}>
                    ${(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    ${(item.price * (1 - item.discount / 100)).toFixed(2)} each
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleToggleSaveLater(item.product_id, false)}
                    title="Save for Later"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)' }}
                  >
                    <Bookmark size={18} />
                  </button>
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    title="Remove item"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-red)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing breakdown Panel */}
          <div>
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', color: 'var(--color-forest)' }}>
                Order Summary
              </h3>

              {/* Promo code field */}
              <form onSubmit={handleCouponApply} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
                />
                <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Apply
                </button>
              </form>

              {/* Applied coupon status */}
              {appliedCoupon && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(22, 101, 52, 0.05)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(22, 101, 52, 0.1)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-forest)', fontWeight: 'bold' }}>
                    <Tag size={14} />
                    <span>{appliedCoupon.code} ({appliedCoupon.discountPercent}% Off)</span>
                  </div>
                  <button onClick={() => dispatch(removeCoupon())} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer', display: 'flex' }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Price list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem', color: 'var(--color-text-light)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-red)' }}>
                    <span>Promo Discount:</span>
                    <span>&minus;${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (18%):</span>
                  <span style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}>${gst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Eco-Delivery:</span>
                  <span style={{ color: 'var(--color-text-dark)', fontWeight: 600 }}>
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-earth)', marginTop: '-0.4rem', fontWeight: 600 }}>
                    Add ${(35 - subtotal).toFixed(2)} more for free delivery!
                  </span>
                )}
              </div>

              {/* Total price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--color-forest)' }}>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', gap: '0.5rem', padding: '0.85rem 1.5rem', marginTop: '0.5rem' }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Coupons suggestions banner */}
            <div className="card" style={{ padding: '1.25rem', marginTop: '1rem', border: '1px dashed var(--color-earth)', backgroundColor: 'transparent' }}>
              <h4 style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-earth)', marginBottom: '0.5rem' }}>
                <Sparkles size={14} />
                <span>Available Offers</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><b>ECO10</b>: 10% Off on all orders</span>
                  <button onClick={() => handleAutoApply('ECO10', 10)} style={{ background: 'none', border: 'none', color: 'var(--color-forest)', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><b>SEED15</b>: 15% Off (Save the soil)</span>
                  <button onClick={() => handleAutoApply('SEED15', 15)} style={{ background: 'none', border: 'none', color: 'var(--color-forest)', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><b>PLANT20</b>: 20% Off for orders</span>
                  <button onClick={() => handleAutoApply('PLANT20', 20)} style={{ background: 'none', border: 'none', color: 'var(--color-forest)', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SAVE FOR LATER SECTION */}
      {savedItems.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '3rem', marginTop: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookmarkCheck size={20} />
            <span>Saved for Later ({savedItems.length})</span>
          </h2>
          <div className="grid grid-4">
            {savedItems.map((item) => (
              <div key={item.product_id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1rem', position: 'relative' }}>
                <button
                  onClick={() => handleRemove(item.product_id)}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--color-cream)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-red)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                >
                  <Trash2 size={14} />
                </button>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}
                />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '0.25rem' }}>{item.name}</h4>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '1rem' }}>
                  ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                </span>
                <button
                  onClick={() => handleToggleSaveLater(item.product_id, true)}
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: 'auto' }}
                >
                  Move to Active Cart
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

    </div>
  );
}

export default Cart;
