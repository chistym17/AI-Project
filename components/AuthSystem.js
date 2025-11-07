// components/AuthSystem.js
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Chrome, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/authContext';

const AuthSystem = () => {
  const { saveTokens } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://esapdev.xyz:7000/agentbuilder/api";

  useEffect(() => {
    setErrors({});
    setMessage({ type: '', text: '' });
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  }, [mode]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (mode === 'register') {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || `${mode} failed`);

      // Save tokens to context (which persists to localStorage)
      saveTokens(data.access_token, data.refresh_token);
      if (data.session_id != null) localStorage.setItem('session_id', String(data.session_id));

      setMessage({ type: 'success', text: mode === 'login' ? 'Login successful!' : 'Account created successfully!' });

      // Optional: redirect instead of reload if you have routing set up
      setTimeout(() => { window.location.href = "/"; }, 800);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${API_BASE}/auth/google/start`,
      'google-login',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    const handleMessage = (event) => {
      // The callback page posts from the API origin
      const apiOrigin = new URL(API_BASE).origin;
      if (event.origin !== apiOrigin) return;

      if (event.data?.type === 'oauth_result' && event.data?.provider === 'google') {
        try { popup?.close(); } catch {}
        const { data: tokenData } = event.data;

        saveTokens(tokenData.access_token, tokenData.refresh_token);
        if (tokenData.session_id != null) localStorage.setItem('session_id', String(tokenData.session_id));

        setMessage({ type: 'success', text: 'Google login successful!' });
        setTimeout(() => { window.location.href = "/"; }, 800);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    const checkClosed = setInterval(() => {
      if (popup && popup.closed) {
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosed);
      }
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm">
              {mode === 'login' ? 'Sign in to your account to continue' : 'Join us and start your journey today'}
            </p>
          </div>

          {message.text && (
            <div className={`mx-8 mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div className="px-8 pb-8">
            <div className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                </div>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-purple-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span><ArrowRight className="w-4 h-4" /></>)}
              </button>
            </div>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500 bg-white">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="ml-2 text-emerald-600 hover:text-emerald-800 font-semibold hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
