import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCartLocal, cartStart, cartSuccess, cartFailure } from '../../redux/slices/cartSlice';
import { orderService, cartService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Clipboard, Truck, CreditCard, ShoppingBag, Loader2 } from 'lucide-react';

export function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems, appliedCoupon } = useSelector((state) => state.cart);

  // Address and payment states
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      if (user.addresses && user.addresses.length > 0) {
        setAddress(user.addresses[0]);
      }
    }
  }, [user]);

  const activeItems = cartItems.filter(item => !item.saved_for_later);

  // If cart is empty, redirect
  useEffect(() => {
    if (activeItems.length === 0) {
      showToast('Add items to your cart before checking out.', 'error');
      navigate('/cart');
    }
  }, [activeItems, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      showToast('Please fill in your shipping address and contact phone number', 'error');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in to place an order', 'error');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    setPlacingOrder(true);
    try {
      const orderItems = activeItems.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price * (1 - item.discount / 100)
      }));

      const res = await orderService.placeOrder({
        shipping_address: address,
        delivery_slot: deliverySlot,
        payment_method: paymentMethod,
        items: orderItems,
        total_price: parseFloat(total.toFixed(2))
      });

      dispatch(clearCartLocal());
      showToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to place order';
      showToast(msg, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2rem' }}>
        Checkout Wizard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem' }} className="checkout-layout">
        
        {/* Left Column: Form Info */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Contact details & Shipping */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <Truck size={20} />
              <span>Shipping & Delivery Details</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shipping Address</label>
              <textarea
                rows="3"
                className="form-input"
                placeholder="Enter your street address, apartment number, city, and zip code"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                style={{ resize: 'none', padding: '0.75rem 1rem' }}
              />
              {user?.addresses && user.addresses.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Saved Addresses: </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {user.addresses.map((addr, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setAddress(addr)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: address === addr ? '1.5px solid var(--color-forest)' : '1px solid var(--color-border)',
                          backgroundColor: address === addr ? 'rgba(22, 101, 52, 0.05)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        Address {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Delivery Slot</label>
              <select
                className="form-input"
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
              >
                <option value="Morning (8 AM - 12 PM)">Morning (8 AM - 12 PM)</option>
                <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
              </select>
            </div>
          </div>

          {/* Section 2: Payment */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <CreditCard size={20} />
              <span>Choose Payment Method</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="payment-grid">
              {[
                { name: 'UPI', desc: 'Scan code instantly' },
                { name: 'Card', desc: 'Credit / Debit cards' },
                { name: 'COD', desc: 'Cash / Pay on Delivery' },
                { name: 'Wallet', desc: 'EcoWallet & Giftcards' }
              ].map((pm) => (
                <div
                  key={pm.name}
                  onClick={() => setPaymentMethod(pm.name)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === pm.name ? '2px solid var(--color-forest)' : '1px solid var(--color-border)',
                    backgroundColor: paymentMethod === pm.name ? 'rgba(22, 101, 52, 0.05)' : 'var(--color-card-bg)',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <h4 style={{ color: 'var(--color-text-dark)', fontSize: '0.95rem', fontWeight: 700 }}>{pm.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{pm.desc}</span>
                </div>
              ))}
            </div>
          </div>

        </form>

        {/* Right Column: Bill summary & submit */}
        <div>
          <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clipboard size={18} />
              <span>Review Order</span>
            </h3>

            {/* Simple list of items */}
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
              {activeItems.map((item) => (
                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {item.name} <span style={{ color: 'var(--color-text-light)' }}>x{item.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    ${(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-light)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1rem 0' }}>
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total Price:</span>
              <span style={{ color: 'var(--color-forest)' }}>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={placingOrder}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', gap: '0.5rem', height: '44px', marginTop: '0.5rem' }}
            >
              {placingOrder ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Place Order (${paymentMethod})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .payment-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}

export default Checkout;
