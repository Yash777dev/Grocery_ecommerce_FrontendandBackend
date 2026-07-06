import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import SearchBar from '../../components/SearchBar/SearchBar';
import { useToast } from '../../context/ToastContext';
import { Leaf, Award, Recycle, ShieldAlert, ChevronRight, HelpCircle, Sparkles, Send } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Counters state (mock live counters)
  const [treesPlanted, setTreesPlanted] = useState(12430);
  const [co2Offset, setCo2Offset] = useState(48210);
  const [recycledGoods, setRecycledGoods] = useState(8750);

  useEffect(() => {
    // Increment counters slowly to look dynamic/live
    const interval = setInterval(() => {
      setTreesPlanted((p) => p + 1);
      setCo2Offset((p) => p + 3);
      setRecycledGoods((p) => p + 2);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await productService.getProducts({ limit: 4 });
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast('The seed has been planted! Welcome to our newsletter.', 'success');
    setNewsletterEmail('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      
      {/* 1. HERO SECTION WITH NATURE BACKGROUND */}
      <section
        style={{
          position: 'relative',
          height: '90vh',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          textAlign: 'center',
          padding: '0 1.5rem',
          marginTop: '-80px' // accounts for navbar overlays
        }}
      >
        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 2 }}>
          <span style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', border: '1px solid var(--color-leaf)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', color: 'var(--color-leaf)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={14} />
            100% Certified Eco-Friendly
          </span>
          <h1 style={{ fontSize: '3.5rem', color: '#ffffff', fontWeight: 900, textShadow: '0 4px 10px rgba(0,0,0,0.3)', lineHeight: '1.15' }}>
            Nurture Your Body, <br />
            <span style={{ color: 'var(--color-leaf)' }}>Respect The Earth</span>
          </h1>
          <p style={{ color: '#f3f4f6', fontSize: '1.25rem', maxHeight: '80px', overflow: 'hidden' }}>
            Fresh harvests, sustainable kitchen essentials, and plant-based skincare delivered to your doorstep in 100% biodegradable packaging.
          </p>

          <div style={{ width: '100%', maxWidth: '500px', marginTop: '1rem' }}>
            <SearchBar />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link to="/products" className="btn btn-primary" style={{ backgroundColor: 'var(--color-leaf)', color: 'var(--color-forest)', border: '2px solid var(--color-leaf)', padding: '0.85rem 2.25rem' }}>
              Shop Organic Catalog
            </Link>
            <a href="#mission" className="btn btn-outline" style={{ color: '#ffffff', borderColor: '#ffffff', padding: '0.85rem 2.25rem' }}>
              Our Eco Pledge
            </a>
          </div>
        </div>

        {/* Decorative Wave Divider at Bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, transform: 'translateY(1px)' }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '60px', fill: 'var(--color-cream)', display: 'block' }}>
            <path d="M0,0V120H1200V0C1014.28,68,823.78,103.35,600,103.35S185.72,68,0,0Z"></path>
          </svg>
        </div>
      </section>

      {/* 2. LIVE IMPACT COUNTER */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div className="card" style={{ padding: '2rem 3rem', border: '2px solid rgba(22, 101, 52, 0.1)', background: 'var(--color-bg-subtle)' }}>
            <div className="grid grid-3" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ color: 'var(--color-forest)', backgroundColor: 'rgba(22, 101, 52, 0.06)', borderRadius: '50%', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={28} style={{ transform: 'rotate(45deg)' }} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{treesPlanted.toLocaleString()}</h3>
                <p style={{ fontWeight: 600 }}>Trees Planted Worldwide</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ color: 'var(--color-forest)', backgroundColor: 'rgba(22, 101, 52, 0.06)', borderRadius: '50%', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={28} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{(co2Offset / 1000).toFixed(1)} Tons</h3>
                <p style={{ fontWeight: 600 }}>CO2 Offsets Credited</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ color: 'var(--color-forest)', backgroundColor: 'rgba(22, 101, 52, 0.06)', borderRadius: '50%', width: '54px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Recycle size={28} />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800 }}>{recycledGoods.toLocaleString()}</h3>
                <p style={{ fontWeight: 600 }}>Containers Repurposed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TWO-COLUMN MISSION SECTION */}
      <section id="mission" style={{ padding: '5rem 0', backgroundColor: 'var(--color-card-bg)' }}>
        <div className="container grid grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
          
          {/* Mission Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '8px solid var(--color-bg-subtle)' }}>
              <img
                src="https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&auto=format&fit=crop"
                alt="Organic Farming"
                style={{ width: '100%', height: '450px', objectFit: 'cover' }}
              />
            </div>
            {/* Small decorative plant tag */}
            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', backgroundColor: 'var(--color-earth)', color: '#ffffff', padding: '1.25rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '240px' }}>
              <Leaf size={24} style={{ color: 'var(--color-leaf)', transform: 'rotate(45deg)' }} />
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem' }}>Local Growers</h4>
                <p style={{ color: '#f3f4f6', fontSize: '0.75rem', lineHeight: 1.3 }}>Supporting small community farms.</p>
              </div>
            </div>
          </div>

          {/* Mission Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Our Roots & Purpose
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2 }}>
              Sowing Seeds For A Zero-Waste Tomorrow
            </h2>
            <p>
              At OrganicCo, we believe the food we eat and the household products we use should work in alignment with Mother Nature, not against her. We partner directly with small-scale biodynamic farmers and artisans who avoid all synthetic chemicals.
            </p>
            <p>
              By tracking our supply chain's carbon output and buying structural offsets, we ensure every carton shipped leaves a net-positive imprint on the ecosystem.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Leaf size={18} style={{ color: 'var(--color-leaf)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chemical-Free Harvesting</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Leaf size={18} style={{ color: 'var(--color-leaf)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Zero-Plastic Shipping</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Leaf size={18} style={{ color: 'var(--color-leaf)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ethical Fair-Trade Wages</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Leaf size={18} style={{ color: 'var(--color-leaf)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Soil Restoration Funding</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. POPULAR CATEGORIES */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-bg-subtle)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Curated For You
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0 3rem' }}>Popular Organic Categories</h2>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            {[
              { name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&auto=format&fit=crop' },
              { name: 'Pantry & Groceries', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop' },
              { name: 'Beverages', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop' },
              { name: 'Snacks', image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d95?w=300&auto=format&fit=crop' },
              { name: 'Home & Personal Care', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300&auto=format&fit=crop' }
            ].map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  width: '180px'
                }}
              >
                <div style={{ width: '130px', height: '130px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--color-border)', boxShadow: 'var(--shadow-md)', transition: 'all 0.3s ease' }}
                     onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-forest)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                     onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'none'; }}>
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-text-dark)' }}>{cat.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS SECTION */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Hand-Picked Recommendations
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>Fresh Featured Arrivals</h2>
            </div>
            <Link to="/products" style={{ color: 'var(--color-forest)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>View All</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading featured products...</div>
          ) : (
            <div className="grid grid-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. SUSTAINABLE TIMELINE (VINE/BRANCH PATH) */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-card-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Our Cycle
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem' }}>The Sustainable Journey</h2>
            <p>From seed insertion to biodynamic carbon recycling, here's how we keep it natural.</p>
          </div>

          <div className="timeline">
            <div className="timeline-item">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>1. Sow & Sprout</h3>
              <p>Non-GMO, organic seeds are planted in mineral-rich, organic soil without synthetic nitrogen or chemical inputs.</p>
            </div>
            
            <div className="timeline-item">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>2. Harvest & Wash</h3>
              <p>Crops are picked at peak nutrition and washed with purified rainwater, retaining natural freshness.</p>
            </div>

            <div className="timeline-item">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>3. Biodegradable Pack</h3>
              <p>Cartons are lined with organic plant starches instead of single-use plastics, fully home-compostable.</p>
            </div>

            <div className="timeline-item">
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>4. Carbon-Neutral Delivery</h3>
              <p>Courier routes are optimized dynamically, and delivery vehicle offsets are calculated per pound shipped.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER SEED-PACKET */}
      <section id="newsletter" style={{ padding: '5rem 0', backgroundColor: 'var(--color-bg-subtle)' }}>
        <div className="container">
          <div className="seed-packet">
            <div className="seed-packet-stamp">POSTAGE</div>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--color-earth)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Eco-Conscious Dispatch
              </span>
              <h3 style={{ fontSize: '1.75rem', color: 'var(--color-forest)', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                Join The Seed-Packet Newsletter
              </h3>
              <p style={{ maxWidth: '450px', margin: '0 auto', fontSize: '0.9rem' }}>
                Enter your details to receive discount codes, sustainable lifestyle guides, and notification of community trees planted.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                style={{
                  textAlign: 'center',
                  border: '2px solid var(--color-earth)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem' }}>
                <Send size={16} />
                <span>Plant the Seed</span>
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
