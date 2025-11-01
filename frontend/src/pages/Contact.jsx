import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ButtonLoading } from '../components/Common/Loading';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general'
      });
    } catch (error) {
      setErrors({ general: 'Failed to send message. Please try again.' });
    }

    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@sympfindx.com',
      description: 'Get in touch via email'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+91 123 456 7890',
      description: '24/7 support available'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Madurai, Tamil Nadu, India',
      description: 'Our main office location'
    }
  ];

  const faqItems = [
    {
      question: 'How accurate is the AI diagnosis?',
      answer: 'Our AI system has a 95%+ accuracy rate, validated against expert ophthalmologist diagnoses.'
    },
    {
      question: 'Is my medical data secure?',
      answer: 'Yes, we are HIPAA compliant and use end-to-end encryption to protect all patient data.'
    },
    {
      question: 'Can I use SympFindX for emergency situations?',
      answer: 'SympFindX is for screening purposes. For medical emergencies, please contact your local emergency services immediately.'
    },
    {
      question: 'Do you accept insurance?',
      answer: 'We are working with insurance providers. Currently, our basic screening service is free for all users.'
    }
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-navy-950 pt-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="card text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Message Sent Successfully!</h2>
            <p className="text-navy-300 mb-6">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="btn-primary"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 pt-20">
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold font-roboto-slab text-white mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Touch</span>
          </h1>
          <p className="text-xl text-navy-300 max-w-3xl mx-auto">
            Have questions about our AI-powered eye disease detection? We're here to help you on your journey to better eye health.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <div key={index} className="card text-center hover:transform hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{info.title}</h3>
                  <p className="text-primary-400 font-medium mb-2">{info.details}</p>
                  <p className="text-navy-300 text-sm">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <div className="flex items-center mb-6">
                <MessageSquare className="w-6 h-6 text-primary-500 mr-3" />
                <h2 className="text-2xl font-bold text-white font-roboto-slab">Send us a Message</h2>
              </div>

              {errors.general && (
                <div className="bg-red-400/10 border border-red-400/30 rounded-lg p-4 flex items-center space-x-2 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="input-field"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="medical">Medical Question</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    className={`input-field ${errors.subject ? 'border-red-400' : ''}`}
                    placeholder="Brief subject of your message"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-400">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    required
                    className={`input-field resize-none ${errors.message ? 'border-red-400' : ''}`}
                    placeholder="Please describe your question or concern in detail..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                  )}
                  <p className="mt-1 text-xs text-navy-400">
                    {formData.message.length}/1000 characters
                  </p>
                </div>

                <ButtonLoading
                  type="submit"
                  loading={loading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </ButtonLoading>
              </form>
            </div>

            {/* FAQ Section */}
            <div>
              <div className="card">
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-6 h-6 text-primary-500 mr-3" />
                  <h2 className="text-2xl font-bold text-white font-roboto-slab">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-6">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border-b border-navy-700 pb-4 last:border-b-0">
                      <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                      <p className="text-navy-300 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Time */}
              <div className="card mt-8">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-primary-500 mr-3" />
                  <h3 className="text-lg font-semibold text-white">Response Times</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-navy-300">General Inquiries</span>
                    <span className="text-white">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Technical Support</span>
                    <span className="text-white">12-24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Medical Questions</span>
                    <span className="text-white">48-72 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-300">Emergency Issues</span>
                    <span className="text-white">Within 4 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;