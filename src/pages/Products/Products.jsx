import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import Filters from '../../components/Filters/Filters';
import SearchBar from '../../components/SearchBar/SearchBar';
import { ProductGridSkeleton } from '../../components/Loader/Loader';
import { Leaf, Search, RotateCcw, AlertTriangle } from 'lucide-react';

export function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  // Internal catalog states
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting state
  const [sortBy, setSortBy] = useState('popularity');

  // Filter states
  const [filters, setFilters] = useState({
    category: initialCategory,
    brand: '',
    min_price: 0.0,
    max_price: 30.0,
    min_rating: 0.0,
    organic: null,
    eco_certified: null,
    search: initialSearch
  });

  // Sync initial query params with filters state
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || ''
    }));
    setCurrentPage(1);
  }, [searchParams]);

  // Load products from API
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams = {
        search: filters.search,
        category: filters.category,
        brand: filters.brand,
        min_price: filters.min_price,
        max_price: filters.max_price,
        min_rating: filters.min_rating,
        sort_by: sortBy,
        page: currentPage,
        limit: 8
      };

      if (filters.organic !== null) apiParams.organic = filters.organic;
      if (filters.eco_certified !== null) apiParams.eco_certified = filters.eco_certified;

      const data = await productService.getProducts(apiParams);
      setProducts(data.products || []);
      setTotalCount(data.total_count || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      setError('A network error occurred. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters, sortBy, currentPage]);

  const handleSearchSubmit = (query) => {
    setSearchParams({ search: query });
    setFilters((prev) => ({ ...prev, search: query }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      min_price: 0.0,
      max_price: 30.0,
      min_rating: 0.0,
      organic: null,
      eco_certified: null,
      search: ''
    });
    setSearchParams({});
    setCurrentPage(1);
    setSortBy('popularity');
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Header and Live Search Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', alignItems: 'center', textAlign: 'center' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Eco Catalogue
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-forest)', marginTop: '0.25rem' }}>
            Explore Our Organic Harvest
          </h1>
        </div>

        <SearchBar initialValue={filters.search} onSearchSubmit={handleSearchSubmit} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem' }} className="products-layout">
        
        {/* Sidebar Filters */}
        <div className="sidebar-container">
          <Filters filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} onReset={handleResetFilters} />
        </div>

        {/* Catalog Main Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Sorting and Count bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1.25rem', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
              Showing <span style={{ color: 'var(--color-forest)', fontWeight: 800 }}>{products.length}</span> of {totalCount} organic results
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: 600 }}>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '0.4rem 0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-cream)',
                  color: 'var(--color-text-dark)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="popularity">Popularity</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Catalog Listing */}
          {loading ? (
            <ProductGridSkeleton />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <AlertTriangle size={48} style={{ color: 'var(--color-earth)' }} />
              <h3 style={{ fontSize: '1.25rem' }}>Connection Loss</h3>
              <p style={{ maxWidth: '400px' }}>{error}</p>
              <button onClick={loadProducts} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Try Reconnecting</button>
            </div>
          ) : products.length === 0 ? (
            /* Empty State search results */
            <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Search size={48} style={{ color: 'var(--color-text-light)' }} />
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-forest)' }}>No Organic Goods Found</h3>
              <p style={{ maxWidth: '400px' }}>
                We couldn't find any products matching "{filters.search || 'your active filter combo'}". Try removing filters or searching for terms like spinach, honey, or tomatoes.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <RotateCcw size={16} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: currentPage === pageNum ? 'var(--color-forest)' : 'transparent',
                      color: currentPage === pageNum ? '#ffffff' : 'var(--color-text-dark)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .products-layout {
            grid-template-columns: 1fr !important;
          }
          .sidebar-container {
            display: block !important;
          }
        }
      `}</style>

    </div>
  );
}

export default Products;
