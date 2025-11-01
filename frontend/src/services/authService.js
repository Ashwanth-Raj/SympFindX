import { authAPI } from './api';

class AuthService {
  async register(userData) {
    try {
      // 🔥 Transform frontend form fields into backend format
      const backendPayload = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        password: userData.password,
        role: "patient", // default role
        profile: {
          phone: userData.phone,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
        },
        medicalHistory: userData.medicalHistory,
      };

      const response = await authAPI.register(backendPayload);
      return {
        success: true,
        data: response.data,
        message: 'Registration successful!',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Registration failed. Please try again.',
      };
    }
  }

  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      return {
        success: true,
        data: response.data,
        message: 'Login successful!',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Login failed. Please check your credentials.',
      };
    }
  }

  async getProfile() {
    try {
      const response = await authAPI.getProfile();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Failed to fetch profile.',
      };
    }
  }

  async updateProfile(userData) {
    try {
      const response = await authAPI.updateProfile(userData);
      return {
        success: true,
        data: response.data,
        message: 'Profile updated successfully!',
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to update profile.',
      };
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  }

  validateRegistrationData(userData) {
    const errors = {};

    if (!userData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!userData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!userData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!userData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!this.isValidPhone(userData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!userData.password) {
      errors.password = 'Password is required';
    } else if (!this.isValidPassword(userData.password)) {
      errors.password =
        'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!userData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (!userData.gender) {
      errors.gender = 'Gender is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateLoginData(credentials) {
    const errors = {};

    if (!credentials.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

const authService = new AuthService();
export default authService;
