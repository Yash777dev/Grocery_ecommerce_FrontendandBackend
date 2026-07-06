import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'Fruits & Vegetables',
  'Pantry & Groceries',
  'Beverages',
  'Snacks',
  'Home & Personal Care'
];

const BRANDS = [
  'Earth Harvest',
  'Green Field',
  'Eco Grain',
  'Nature\'s Gold',
  'Leaf Zen',
  'Eco Living'
];

export function Filters({ filters, onChange, onReset }) {
  const handleCategoryChange = (cat) => {
    const isSelected = filters.category === cat;
    onChange({ ...filters, category: isSelected ? '' : cat });
  };

  const handleBrandChange = (brand) => {
    const isSelected = filters.brand === brand;
    onChange({ ...filters, brand: isSelected ? '' : brand });
  };

  const handleOrganicToggle = () => {
    const nextVal = filters.organic === 1 ? null : 1;
    onChange({ ...filters, organic: nextVal });
  };

  const handleEcoToggle = () => {
    const nextVal = filters.eco_certified === 1 ? null : 1;
    onChange({ ...filters, eco_certified: nextVal });
  };

  const handlePriceChange = (e) => {
    onChange({ ...filters, max_price: parseFloat(e.target.value) });
  };

  const handleRatingChange = (rating) => {
    onChange({ ...filters, min_rating: filters.min_rating === rating ? 0.0 : rating });
  };

  return (
    <aside style={{ backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--color-forest)' }}>
          <Filter size={18} />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--color-earth)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Organic & Eco Badges */}
      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-dark)' }}>Eco Options</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={filters.organic === 1}
              onChange={handleOrganicToggle}
              style={{ accentColor: 'var(--color-forest)' }}
            />
            <span>100% Organic Certified</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={filters.eco_certified === 1}
              onChange={handleEcoToggle}
              style={{ accentColor: 'var(--color-forest)' }}
            />
            <span>Eco-Friendly Badge</span>
          </label>
        </div>
      </div>

      {/* Category Section */}
      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-dark)' }}>Categories</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {CATEGORIES.map((cat) => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={() => handleCategoryChange(cat)}
                style={{ accentColor: 'var(--color-forest)' }}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--color-text-dark)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Max Price</span>
          <span style={{ fontWeight: 'bold', color: 'var(--color-forest)' }}>${filters.max_price}</span>
        </h4>
        <input
          type="range"
          min="1"
          max="50"
          step="0.5"
          value={filters.max_price}
          onChange={handlePriceChange}
          style={{ width: '100%', accentColor: 'var(--color-forest)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
          <span>$1.00</span>
          <span>$50.00</span>
        </div>
      </div>

      {/* Rating Filters */}
      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-dark)' }}>Customer Rating</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                border: filters.min_rating === rating ? '2px solid var(--color-forest)' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filters.min_rating === rating ? 'rgba(22, 101, 52, 0.05)' : 'transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-dark)',
                textAlign: 'left',
                transition: 'var(--transition-fast)'
              }}
            >
              <span>★ {rating} & Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filters */}
      <div>
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-dark)' }}>Brands</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {BRANDS.map((brand) => (
            <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={filters.brand === brand}
                onChange={() => handleBrandChange(brand)}
                style={{ accentColor: 'var(--color-forest)' }}
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Filters;
