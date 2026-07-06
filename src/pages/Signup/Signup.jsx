import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../../redux/slices/authSlice';
import { authService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Leaf, User, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const { loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    dispatch(authStart());
    try {
      const data = await authService.signup(email, password, name);
      dispatch(authSuccess({ token: data.token, user: data.user }));
      showToast(`Account created! Welcome, ${name}!`, 'success');
      navigate('/profile');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Try a different email.';
      dispatch(authFailure(msg));
      showToast(msg, 'error');
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', border: '2px solid var(--color-border)' }}>
        
        {/* Logo and Greeting */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(22, 101, 52, 0.05)', width: '60px', height: '60px', borderRadius: '50%', color: 'var(--color-forest)', marginBottom: '1rem' }}>
            <Leaf size={32} style={{ transform: 'rotate(45deg)', fill: 'var(--color-leaf)' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>Start Your Journey</h2>
          <p>Create an account to track carbon offset, save lists, and order organic eats.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-red)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} style={{ color: 'var(--color-text-light)' }} />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} style={{ color: 'var(--color-text-light)' }} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} style={{ color: 'var(--color-text-light)' }} />
              <span>Password</span>
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} style={{ color: 'var(--color-text-light)' }} />
              <span>Confirm Password</span>
            </label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', height: '48px' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span>Create Account</span>
            )}
          </button>

        </form>

        {/* Login Redirect link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-forest)', fontWeight: 700 }}>
            Login here
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;
