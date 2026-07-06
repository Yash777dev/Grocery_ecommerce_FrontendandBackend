import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)', marginTop: '5rem', padding: '4rem 0 2rem' }}>
      
      {/* Decorative Wave Divider */}
      <div style={{ transform: 'rotate(180deg)', marginTop: '-4.1rem', marginBottom: '2rem' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ width: '100%', height: '40px', fill: 'var(--color-cream)' }}>
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="container grid grid-4">
        {/* Column 1: Brand & Mission */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-forest)' }}>
            <Leaf size={24} style={{ transform: 'rotate(45deg)', fill: 'var(--color-leaf)' }} />
            <span>OrganicCo</span>
          </div>
          <p style={{ fontSize: '0.9rem' }}>
            We are dedicated to providing the highest quality organic, eco-friendly, and sustainable products direct from local farms to your home.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-forest)', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Shield size={16} />
            <span>100% Certified Organic</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Quick Links</h4>
          <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Home</Link>
          <Link to="/products" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Shop Catalog</Link>
          <Link to="/orders" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>Track Order</Link>
          <Link to="/profile" style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>My Profile</Link>
        </div>

        {/* Column 3: Contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Get in Touch</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            <MapPin size={16} style={{ color: 'var(--color-forest)' }} />
            <span>Eco Center, Earth HQ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            <Phone size={16} style={{ color: 'var(--color-forest)' }} />
            <span>+1 (555) 123-4567</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
            <Mail size={16} style={{ color: 'var(--color-forest)' }} />
            <span>hello@organicco.com</span>
          </div>
        </div>

        {/* Column 4: Newsletter brief */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Plant a Seed</h4>
          <p style={{ fontSize: '0.9rem' }}>
            Subscribe to our seed-packet newsletter to receive discount drops, eco tips, and trees-planted updates.
          </p>
          <a href="#newsletter" className="btn btn-outline" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.85rem', width: 'fit-content' }}>
            Subscribe Now
          </a>
        </div>
      </div>

      {/* Copyright row */}
      <div className="container" style={{ borderTop: '1px solid var(--color-border)', marginTop: '3rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
        <span>&copy; {new Date().getFullYear()} OrganicCo. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms of Service</Link>
          <Link to="#">Eco Pledge</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
