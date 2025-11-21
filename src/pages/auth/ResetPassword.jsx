import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import api from '../../api/api';
import showToast from '../../components/ui/notifications/AddSuccess';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const params = useParams();

  useEffect(() => {
    try {
      // Prefer path param, fallback to query param for compatibility
      const tFromParam = params?.token;
      if (tFromParam) {
        setToken(tFromParam);
        return;
      }
      const query = new URLSearchParams(location.search);
      const t = query.get('token');
      if (t) setToken(t);
    } catch {
      // ignore
    }
  }, [location.search, params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!password || !confirmPassword) return setError('Please enter and confirm your password');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (!token) return setError('Invalid or missing token');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      showToast({ message: 'Password reset successful. Please login with your new password.' });
      navigate('/login');
    } catch (err) {
      console.error('Reset password error', err);
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Reset Password</h3>
          <Link to="/login" className="text-sm text-gray-500">Back to Login</Link>
        </div>

        {!token ? (
          <div className="text-sm text-gray-700">
            No reset token found in the URL. Please use the password reset link from your email or request a new one from the login page.
            <div className="mt-4">
              <Link to="/login" className="text-blue-600">Request password reset</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
              placeholder="Enter new password"
              required
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
              placeholder="Confirm new password"
              required
            />

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                {loading ? 'Saving...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
