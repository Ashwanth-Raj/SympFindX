import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ButtonLoading } from '../Common/Loading';
import authService from '../../services/authService';
import { ROUTES } from '../../utils/constants';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    medicalHistory: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  
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

  if (formData.password !== formData.confirmPassword) {
    setErrors({ confirmPassword: "Passwords do not match" });
    setLoading(false);
    return;
  }

  const validation = authService.validateRegistrationData(formData);
  if (!validation.isValid) {
    setErrors(validation.errors);
    setLoading(false);
    return;
  }

  // 🔥 FIX → reshape payload before sending
  const backendPayload = {
    firstName: formData.firstName,
  lastName: formData.lastName,
  name: `${formData.firstName} ${formData.lastName}`.trim(),
  email: formData.email,
  password: formData.password,
  role: "patient",
  profile: {
    phone: formData.phone,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
  },
  medicalHistory: formData.medicalHistory,
  };

  // send reshaped data, not raw formData
  const result = await authService.register(backendPayload);

  if (result.success) {
    setSuccess(true);
    setTimeout(() => {
      login(result.data.user, result.data.token);
      navigate(ROUTES.DASHBOARD);
    }, 2000);
  } else {
    setErrors({ general: result.message });
  }

  setLoading(false);
};



  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-navy-950">
        <div className="w-full max-w-md text-center">
          <div className="card">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h2 className="mb-4 text-2xl font-bold text-white">Registration Successful!</h2>
            <p className="mb-6 text-navy-300">
              Welcome to SympFindX! You'll be redirected to your dashboard shortly.
            </p>
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-navy-950 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
<div className="mt-10 mb-8 text-center">
  <h2 className="text-3xl font-bold text-white font-roboto-slab">Join SympFindX</h2>
  <p className="mt-2 text-navy-300">Create your account for AI-powered eye health screening</p>
</div>

        {/* Registration Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center p-4 space-x-2 border rounded-lg bg-red-400/10 border-red-400/30">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">{errors.general}</span>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-white">
                  First Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <User className="flex-shrink-0 w-5 h-5 text-navy-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    placeholder=" "
                    className={`input-field pl-16 ${errors.firstName ? 'border-red-400' : ''}`}
                    value={formData.firstName}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-white">
                  Last Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <User className="flex-shrink-0 w-5 h-5 text-navy-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    placeholder=" "
                    className={`input-field pl-16 ${errors.lastName ? 'border-red-400' : ''}`}
                    value={formData.lastName}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
                Email Address *
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
                  className={`input-field pl-16 ${errors.email ? 'border-red-400' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block mb-2 text-sm font-medium text-white">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                  <Phone className="flex-shrink-0 w-5 h-5 text-navy-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder=" "
                  className={`input-field pl-16 ${errors.phone ? 'border-red-400' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Date of Birth and Gender */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="dateOfBirth" className="block mb-2 text-sm font-medium text-white">
                  Date of Birth *
                </label>
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    className={`input-field ${errors.dateOfBirth ? 'border-red-400' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block mb-2 text-sm font-medium text-white">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className={`input-field ${errors.gender ? 'border-red-400' : ''}`}
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-400">{errors.gender}</p>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <Lock className="flex-shrink-0 w-5 h-5 text-navy-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder=" "
                    className={`input-field pl-16 pr-16 ${errors.password ? 'border-red-400' : ''}`}
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

              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-white">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-4 pointer-events-none">
                    <Lock className="flex-shrink-0 w-5 h-5 text-navy-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder=" "
                    className={`input-field pl-16 pr-16 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ paddingLeft: '2.5rem', paddingRight: '3.5rem' }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 z-10 flex items-center flex-shrink-0 pr-4 text-navy-400 hover:text-primary-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Medical History */}
            <div>
              <label htmlFor="medicalHistory" className="block mb-2 text-sm font-medium text-white">
                Medical History (Optional)
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                rows="3"
                className="resize-none input-field"
                placeholder="Any relevant eye conditions, diabetes, family history of eye diseases..."
                value={formData.medicalHistory}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-navy-400">
                This information helps our AI provide more accurate analysis
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded text-primary-600 border-navy-600 focus:ring-primary-500"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-navy-300">
                I agree to the{' '}
                <Link to="#" className="text-primary-400 hover:text-primary-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="text-primary-400 hover:text-primary-300">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <ButtonLoading
              type="submit"
              loading={loading}
              className="flex items-center justify-center w-full btn-primary"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </ButtonLoading>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-navy-300">
              Already have an account?{' '}
              <Link 
                to={ROUTES.LOGIN} 
                className="font-medium transition-colors duration-300 text-primary-400 hover:text-primary-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="pt-6 mt-8 border-t border-navy-700">
            <h3 className="mb-4 text-lg font-semibold text-center text-white">Why Choose SympFindX?</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-navy-300">Free AI-powered screening</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-navy-300">Connect with specialists</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-navy-300">Secure & confidential</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-navy-300">24/7 accessibility</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;