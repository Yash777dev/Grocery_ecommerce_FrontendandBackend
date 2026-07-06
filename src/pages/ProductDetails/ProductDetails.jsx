import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  productDetailStart,
  productDetailSuccess,
  productDetailFailure
} from '../../redux/slices/productsSlice';
import { addToCartLocal, cartStart, cartSuccess, cartFailure } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { productService, cartService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { DetailsSkeleton } from '../../components/Loader/Loader';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Heart, Star, ShoppingCart, ShieldAlert, Award, FileText, Users, Send } from 'lucide-react';

export function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedProduct, loading, error } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [activeImage, setActiveImage] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Review posting form states
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isWishlisted = selectedProduct && wishlistItems.some((item) => item.id === selectedProduct.id);

  // Fetch product detail and similar products
  const fetchProductDetail = async () => {
    dispatch(productDetailStart());
    try {
      const data = await productService.getProductDetails(id);
      dispatch(productDetailSuccess(data));
      
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0]);
      }
      if (data.weight_options && data.weight_options.length > 0) {
        setSelectedWeight(data.weight_options[0]);
      }
      
      // Fetch similar products in same category
      const similarData = await productService.getProducts({ category: data.category, limit: 5 });
      const filtered = (similarData.products || []).filter((item) => item.id !== data.id).slice(0, 4);
      setSimilarProducts(filtered);
    } catch (err) {
      dispatch(productDetailFailure(err.message || 'Product details not found'));
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      dispatch(removeFromWishlist(selectedProduct.id));
      showToast('Removed from wishlist', 'info');
    } else {
      dispatch(addToWishlist(selectedProduct));
      showToast('Added to wishlist', 'success');
    }
  };

  const handleAddToCart = async () => {
    if (selectedProduct.stock <= 0) {
      showToast('Product is out of stock', 'error');
      return;
    }

    if (isAuthenticated) {
      dispatch(cartStart());
      try {
        await cartService.addToCart(selectedProduct.id, quantity);
        const items = await cartService.getCart();
        dispatch(cartSuccess(items));
        showToast(`Added ${quantity} ${selectedProduct.name} to cart`, 'success');
      } catch (err) {
        dispatch(cartFailure(err.message));
        showToast('Failed to add to cart', 'error');
      }
    } else {
      dispatch(addToCartLocal({
        product_id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        discount: selectedProduct.discount,
        image: selectedProduct.images[0] || '',
        stock: selectedProduct.stock,
        category: selectedProduct.category,
        organic: selectedProduct.organic,
        eco_certified: selectedProduct.eco_certified,
        quantity: quantity
      }));
      showToast(`Added ${quantity} ${selectedProduct.name} to local cart`, 'success');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write reviews', 'error');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please enter a review description', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await productService.addReview(selectedProduct.id, newRating, newComment);
      showToast('Review submitted successfully!', 'success');
      setNewComment('');
      setNewRating(5);
      // Reload details to get fresh reviews list
      fetchProductDetail();
    } catch (err) {
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpvoteReview = async (reviewId) => {
    try {
      await productService.upvoteReview(reviewId);
      showToast('Review upvoted!', 'success');
      // Simple reload details
      fetchProductDetail();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-red)', marginBottom: '1rem' }}>Product Not Found</h2>
        <p style={{ marginBottom: '2rem' }}>The product you are trying to view does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  // Price math
  const hasDiscount = selectedProduct.discount > 0;
  const discountAmount = hasDiscount ? (selectedProduct.price * selectedProduct.discount) / 100 : 0;
  const finalPrice = selectedProduct.price - discountAmount;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '8vh' }}>
      
      {/* Back link */}
      <Link to="/products" style={{ color: 'var(--color-forest)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '2rem' }}>
        &larr; Back to Shop
      </Link>

      {/* Main product presentation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', marginBottom: '4rem' }} className="details-grid">
        
        {/* Left Column: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Main Visual Display */}
          <div className="zoom-container" style={{ border: '2px solid var(--color-border)', borderRadius: 'var(--radius-lg)', height: '450px', position: 'relative' }}>
            <img
              src={activeImage || 'https://via.placeholder.com/600x450?text=Product'}
              alt={selectedProduct.name}
              className="zoom-img"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Thumbnails list */}
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {selectedProduct.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: activeImage === img ? '3px solid var(--color-forest)' : '1px solid var(--color-border)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Descriptions & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Brand & Organic Flags */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-earth)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {selectedProduct.brand}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedProduct.organic && <span className="badge badge-organic">★ Organic</span>}
              {selectedProduct.eco_certified && <span className="badge badge-eco">Eco Certified</span>}
            </div>
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)' }}>
            {selectedProduct.name}
          </h1>

          {/* Rating counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} size={16} fill={idx < Math.round(selectedProduct.rating) ? '#fbbf24' : 'transparent'} style={{ color: '#fbbf24' }} />
              ))}
              <span style={{ fontWeight: 'bold', color: 'var(--color-text-dark)', marginLeft: '0.25rem' }}>{selectedProduct.rating}</span>
            </div>
            <span style={{ color: 'var(--color-text-light)' }}>({selectedProduct.reviews?.length || 0} reviews)</span>
          </div>

          {/* Price display */}
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
            {hasDiscount ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-forest)' }}>
                  ${finalPrice.toFixed(2)}
                </span>
                <span style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                  ${selectedProduct.price.toFixed(2)}
                </span>
                <span style={{ color: 'var(--color-red)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  ({selectedProduct.discount}% Off)
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-forest)' }}>
                ${selectedProduct.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Weight Options */}
          {selectedProduct.weight_options?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-light)' }}>Select Weight/Size:</h4>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {selectedProduct.weight_options.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      border: selectedWeight === w ? '2px solid var(--color-forest)' : '1px solid var(--color-border)',
                      backgroundColor: selectedWeight === w ? 'rgba(22, 101, 52, 0.05)' : 'var(--color-card-bg)',
                      color: selectedWeight === w ? 'var(--color-forest)' : 'var(--color-text-dark)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
            
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-bg-subtle)' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}
              >
                &minus;
              </button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}
              >
                +
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={selectedProduct.stock <= 0}
              className="btn btn-primary"
              style={{ flexGrow: 1, padding: '0.85rem 1.5rem', display: 'flex', gap: '0.5rem', height: '44px', opacity: selectedProduct.stock <= 0 ? 0.6 : 1 }}
            >
              <ShoppingCart size={18} />
              <span>{selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className="btn btn-outline"
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isWishlisted ? 'var(--color-red)' : 'var(--color-forest)',
                borderColor: isWishlisted ? 'var(--color-red)' : 'var(--color-forest)'
              }}
            >
              <Heart size={18} fill={isWishlisted ? 'var(--color-red)' : 'transparent'} />
            </button>
          </div>

          {/* Description & Specs Panels */}
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} />
                <span>Description</span>
              </h3>
              <p style={{ fontSize: '0.925rem' }}>{selectedProduct.description}</p>
            </div>

            {selectedProduct.ingredients && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Ingredients</h3>
                <p style={{ fontSize: '0.925rem', fontStyle: 'italic' }}>{selectedProduct.ingredients}</p>
              </div>
            )}

            {selectedProduct.nutrition && Object.keys(selectedProduct.nutrition).length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Nutrition Facts (per serving)</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--color-bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                  {Object.entries(selectedProduct.nutrition).map(([k, v]) => (
                    <div key={k}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--color-text-light)', fontWeight: 600 }}>{k.replace('_', ' ')}:</span>{' '}
                      <span style={{ fontWeight: 'bold' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Reviews list & submit Form */}
      <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '3rem', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2rem' }}>
          Customer Reviews
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3.5rem' }} className="reviews-layout">
          
          {/* Reviews list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {selectedProduct.reviews?.length === 0 ? (
              <div style={{ padding: '2rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-light)' }}>
                No reviews yet. Be the first to share your experience with this organic product!
              </div>
            ) : (
              selectedProduct.reviews?.map((review) => (
                <div key={review.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontWeight: 'bold', color: 'var(--color-text-dark)' }}>{review.user_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', marginBottom: '0.75rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? '#fbbf24' : 'transparent'} style={{ color: '#fbbf24' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.925rem', color: 'var(--color-text-dark)', marginBottom: '0.5rem' }}>
                    {review.comment}
                  </p>
                  <button
                    onClick={() => handleUpvoteReview(review.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-forest)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <span>Helpful? Upvote ({review.helpful_votes})</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Review Posting Form */}
          <div>
            <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', marginBottom: '1rem' }}>Write a Review</h3>
              
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Overall Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        className={`star-btn ${newRating >= rating ? 'active' : ''}`}
                        onClick={() => setNewRating(rating)}
                      >
                        <Star size={24} fill={newRating >= rating ? '#fbbf24' : 'transparent'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Review Comment</label>
                  <textarea
                    rows="4"
                    className="form-input"
                    placeholder="Share your honest feedback about quality, packaging, and delivery..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    style={{ resize: 'none', padding: '0.75rem 1rem' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '42px' }}
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2rem' }}>
            Similar Organic Products
          </h2>
          <div className="grid grid-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .details-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .reviews-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

    </div>
  );
}

export default ProductDetails;
