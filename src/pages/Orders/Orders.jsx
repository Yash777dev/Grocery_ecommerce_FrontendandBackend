import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

const STATUS_PROGRESS = {
  'Placed': 25,
  'Preparing': 50,
  'Out for Delivery': 75,
  'Delivered': 100
};

export function Orders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch orders. Make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle2 size={18} style={{ color: 'var(--color-leaf)' }} />;
      case 'Out for Delivery':
        return <Truck size={18} style={{ color: 'var(--color-forest)' }} />;
      case 'Preparing':
        return <Clock size={18} style={{ color: 'var(--color-earth)' }} />;
      default:
        return <Package size={18} style={{ color: 'var(--color-text-light)' }} />;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: 'var(--color-forest)', margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Fetching past orders...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2rem' }}>
        My Orders
      </h1>

      {error ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', border: '1px solid var(--color-border)' }}>
          <ShieldAlert size={48} style={{ color: 'var(--color-red)', margin: '0 auto 1rem' }} />
          <h3>Error Fetching Orders</h3>
          <p style={{ margin: '0.5rem 0 1.5rem' }}>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">Retry</button>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Package size={48} style={{ color: 'var(--color-text-light)' }} />
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-forest)' }}>No Orders Placed Yet</h3>
          <p style={{ maxWidth: '400px' }}>
            You haven't ordered any organic harvest products from us yet. Start adding items to your cart!
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Shop Our Harvest
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => {
            const progress = STATUS_PROGRESS[order.status] || 25;
            
            return (
              <div key={order.id} className="card" style={{ padding: '1.75rem', border: '1px solid var(--color-border)' }}>
                
                {/* Header: Order ID and Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--color-forest)' }}>Order #{order.id}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
                      <Calendar size={14} />
                      <span>Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}>
                      Total: ${order.total_price.toFixed(2)}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.1rem' }}>
                      via {order.payment_method}
                    </div>
                  </div>
                </div>

                {/* Body: Items, Delivery info and Tracking progress */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }} className="order-inner-grid">
                  
                  {/* Left: Items purchased & address */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Items List */}
                    <div>
                      <h4 style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem', fontWeight: 700 }}>Items Ordered:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                            <span>{item.name} <span style={{ fontWeight: 'bold' }}>x{item.quantity}</span></span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)', marginBottom: '0.25rem', fontWeight: 700 }}>Delivery Details:</h4>
                      <p style={{ fontSize: '0.85rem' }}><b>Slot:</b> {order.delivery_slot}</p>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}><b>Address:</b> {order.shipping_address}</p>
                    </div>

                  </div>

                  {/* Right: Tracking Timeline Progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-dark)' }}>Tracking Status:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold', color: 'var(--color-forest)', fontSize: '0.95rem' }}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: 'var(--color-forest)',
                          width: `${progress}%`,
                          transition: 'width 0.5s ease-out'
                        }}
                      />
                    </div>

                    {/* Timeline Milestones */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
                      <span style={{ color: progress >= 25 ? 'var(--color-forest)' : 'inherit' }}>Placed</span>
                      <span style={{ color: progress >= 50 ? 'var(--color-forest)' : 'inherit' }}>Preparing</span>
                      <span style={{ color: progress >= 75 ? 'var(--color-forest)' : 'inherit' }}>On The Way</span>
                      <span style={{ color: progress >= 100 ? 'var(--color-forest)' : 'inherit' }}>Delivered</span>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .order-inner-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

    </div>
  );
}

export default Orders;
