import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileSuccess } from '../../redux/slices/authSlice';
import { authService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { User, Mail, MapPin, Plus, Trash2, Key, Loader2, ArrowRight } from 'lucide-react';

export function Profile() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  const { user } = useSelector((state) => state.auth);

  // Profile fields states
  const [name, setName] = useState(user?.name || '');
  const [newAddress, setNewAddress] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setUpdatingProfile(true);
    try {
      const data = await authService.updateProfile({
        name: name,
        addresses: user.addresses // keep addresses unchanged
      });
      dispatch(updateProfileSuccess(data.user));
      showToast('Profile name updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile name', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    setUpdatingProfile(true);
    try {
      const updatedAddresses = [...user.addresses, newAddress.trim()];
      const data = await authService.updateProfile({
        name: user.name,
        addresses: updatedAddresses
      });
      dispatch(updateProfileSuccess(data.user));
      showToast('New shipping address saved!', 'success');
      setNewAddress('');
    } catch (err) {
      showToast('Failed to save address', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleRemoveAddress = async (indexToRemove) => {
    setUpdatingProfile(true);
    try {
      const updatedAddresses = user.addresses.filter((_, idx) => idx !== indexToRemove);
      const data = await authService.updateProfile({
        name: user.name,
        addresses: updatedAddresses
      });
      dispatch(updateProfileSuccess(data.user));
      showToast('Shipping address removed', 'info');
    } catch (err) {
      showToast('Failed to remove address', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    
    setUpdatingPassword(true);
    // Simulate successful password update
    setTimeout(() => {
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setUpdatingPassword(false);
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '80vh' }}>
      
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-forest)', marginBottom: '2.5rem' }}>
        My Dashboard
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }} className="profile-layout">
        
        {/* Left Column: Personal info & address editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* User profile detail form */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <User size={20} />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)', color: 'var(--color-text-light)', cursor: 'not-allowed' }}>
                  <Mail size={16} />
                  <span>{user?.email}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={updatingProfile} className="btn btn-primary" style={{ width: 'fit-content', height: '40px', padding: '0 1.5rem' }}>
                {updatingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Shipping Addresses Manager */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <MapPin size={20} />
              <span>Manage Addresses</span>
            </h3>

            {/* List of saved addresses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user?.addresses?.length === 0 ? (
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                  No saved addresses. Add one below for faster checkouts.
                </span>
              ) : (
                user?.addresses?.map((addr, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-subtle)', fontSize: '0.9rem' }}>
                    <span>{addr}</span>
                    <button
                      onClick={() => handleRemoveAddress(index)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer', display: 'flex' }}
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Address Form */}
            <form onSubmit={handleAddAddress} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Add new address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}
              />
              <button type="submit" className="btn btn-outline" style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Plus size={16} />
                <span>Add</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Password updates */}
        <div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
              <Key size={20} />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>

              <button type="submit" disabled={updatingPassword} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', width: '100%', height: '42px' }}>
                {updatingPassword ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

    </div>
  );
}

export default Profile;
