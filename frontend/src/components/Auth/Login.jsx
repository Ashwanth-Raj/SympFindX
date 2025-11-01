import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoading } from '../Common/Loading';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate form
    const validation = authService.validateLoginData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    // Attempt login
    const result = await authService.login(formData);
    
    if (result.success) {
      login(result.data.user, result.data.token);
      navigate(ROUTES.DASHBOARD);
    } else {
      setErrors({ general: result.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-navy-950 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="mt-10 text-center">
          <Link to={ROUTES.HOME} className="inline-flex items-center mb-6 space-x-2">
            <Eye className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold text-white font-roboto-slab">SympFindX</span>
          </Link>
          <h2 className="text-3xl font-bold text-white font-roboto-slab">Welcome Back</h2>
          <p className="mt-2 text-navy-300">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center p-4 space-x-2 border rounded-lg bg-red-400/10 border-red-400/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">{errors.general}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                  <Mail className="flex-shrink-0 w-5 h-5 text-navy-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder=" "
                  className={`input-field pl-16 ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                  <Lock className="flex-shrink-0 w-5 h-5 text-navy-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder=" "
                  className={`input-field pl-16 pr-16 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
                  
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem', paddingRight: '3.5rem' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 z-10 flex items-center flex-shrink-0 pr-4 text-navy-400 hover:text-primary-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 rounded text-primary-600 border-navy-600 focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="block ml-2 text-sm text-navy-300">
                  Remember me
                </label>
              </div>
              <Link 
                to="#" 
                className="text-sm transition-colors duration-300 text-primary-400 hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <ButtonLoading
              type="submit"
              loading={loading}
              className="flex items-center justify-center w-full btn-primary"
            >
              Sign in
              <ArrowRight className="w-5 h-5 ml-2" />
            </ButtonLoading>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-navy-300">
              Don't have an account?{' '}
              <Link 
                to={ROUTES.REGISTER} 
                className="font-medium transition-colors duration-300 text-primary-400 hover:text-primary-300"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;