import React from 'react';
import { Leaf } from 'lucide-react';

export function LeafSpinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
      <Leaf className="animate-bounce" size={48} style={{ color: 'var(--color-forest)', transform: 'rotate(45deg)' }} />
      <p style={{ fontWeight: 600, color: 'var(--color-text-light)' }}>Loading green goodness...</p>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '350px', cursor: 'default' }}>
      <div className="shimmer" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)' }}></div>
      <div className="shimmer" style={{ width: '60%', height: '20px', borderRadius: '4px' }}></div>
      <div className="shimmer" style={{ width: '40%', height: '16px', borderRadius: '4px' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div className="shimmer" style={{ width: '30%', height: '24px', borderRadius: '4px' }}></div>
        <div className="shimmer" style={{ width: '40%', height: '32px', borderRadius: 'var(--radius-full)' }}></div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-4" style={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', margin: '2rem 0' }}>
      <div className="shimmer" style={{ width: '100%', height: '400px', borderRadius: 'var(--radius-lg)' }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="shimmer" style={{ width: '40%', height: '16px', borderRadius: '4px' }}></div>
        <div className="shimmer" style={{ width: '80%', height: '36px', borderRadius: '4px' }}></div>
        <div className="shimmer" style={{ width: '20%', height: '24px', borderRadius: '4px' }}></div>
        <div className="shimmer" style={{ width: '100%', height: '80px', borderRadius: 'var(--radius-md)' }}></div>
        <div className="shimmer" style={{ width: '50%', height: '40px', borderRadius: 'var(--radius-full)' }}></div>
      </div>
    </div>
  );
}

export default LeafSpinner;
