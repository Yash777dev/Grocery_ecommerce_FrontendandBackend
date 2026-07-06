import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, Loader2, ArrowRight } from 'lucide-react';

export function SearchBar({ initialValue = '', onSearchSubmit }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const data = await productService.getProducts({ search: debouncedQuery, limit: 5 });
        setSuggestions(data.products || []);
      } catch (err) {
        console.error('Error fetching search suggestions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    navigate(`/products/${productId}`);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', width: '100%' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search organic goods (e.g. spinach, honey, apples)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          style={{
            paddingRight: '3rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: '4px',
            top: '4px',
            bottom: '4px',
            background: 'var(--color-forest)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </form>

      {/* Suggestion Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <ul style={{ listStyle: 'none' }}>
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => handleSuggestionClick(product.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>{product.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-forest)', fontWeight: 600 }}>{product.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>
                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                  </span>
                  <ArrowRight size={14} style={{ color: 'var(--color-text-light)' }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
