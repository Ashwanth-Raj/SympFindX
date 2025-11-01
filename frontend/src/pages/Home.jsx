import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  Activity, 
  Shield, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle,
  Brain,
  Stethoscope,
  Globe,
  Clock,
  TrendingUp
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced CNN models analyze retinal images with 95%+ accuracy for early disease detection.'
    },
    {
      icon: Clock,
      title: 'Instant Results',
      description: 'Get preliminary screening results within seconds, enabling faster medical intervention.'
    },
    {
      icon: Stethoscope,
      title: 'Expert Network',
      description: 'Connect directly with certified ophthalmologists for professional consultation and treatment.'
    },
    {
      icon: Globe,
      title: 'Remote Accessibility',
      description: 'Access eye screening from anywhere, bringing healthcare to underserved communities.'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Your medical data is encrypted and protected according to healthcare privacy standards.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'Our AI models continuously improve with new data, ensuring better accuracy over time.'
    }
  ];

  const diseases = [
    {
      name: 'Diabetic Retinopathy',
      description: 'Leading cause of blindness in diabetic patients',
      severity: 'High Risk',
      color: 'red'
    },
    {
      name: 'Glaucoma',
      description: 'Silent thief of sight affecting millions worldwide',
      severity: 'Critical',
      color: 'orange'
    },
    {
      name: 'Macular Degeneration',
      description: 'Age-related vision loss in central vision',
      severity: 'Moderate',
      color: 'yellow'
    }
  ];

  const stats = [
    { label: 'Lives Impacted', value: '2.2B+', description: 'People with vision impairment worldwide' },
    { label: 'Preventable Cases', value: '1B+', description: 'Cases that could be prevented with early detection' },
    { label: 'Accuracy Rate', value: '95%+', description: 'AI model accuracy in disease detection' },
    { label: 'Response Time', value: '<30s', description: 'Average time for initial screening results' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-medical-50 via-primary-50 to-white lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute w-64 h-64 rounded-full top-10 right-10 bg-medical-200 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute rounded-full bottom-10 left-10 w-96 h-96 bg-primary-200 mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>

        <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium rounded-full bg-medical-100 text-medical-700">
                <Award className="w-4 h-4 mr-2" />
                AI-Powered Eye Disease Detection
              </div>
              
              <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Early Detection
                <span className="block text-white text-medical-600">Saves Vision</span>
              </h1>
              
              <p className="mb-8 text-xl leading-relaxed text-white">
                Revolutionary AI technology that screens for diabetic retinopathy, glaucoma, and macular degeneration. 
                Get instant analysis and connect with specialists worldwide.
              </p>

              <div className="flex flex-col gap-4 mb-8 sm:flex-row">
                {isAuthenticated ? (
                  <Link
                    to="/diagnosis"
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 transform shadow-lg bg-medical-600 rounded-xl hover:bg-medical-700 hover:shadow-xl hover:-translate-y-1"
                  >
                    <Activity className="w-5 h-5 mr-2" />
                    Start Screening Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 border-2 bg-navy-900 rounded-xl border-medical-200 hover:bg-medical-50"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                    <Link
                      to="/about"
                      className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 border-2 bg-navy-900 rounded-xl border-medical-200 hover:bg-medical-50"
                    >
                      Learn More
                    </Link>
                  </>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  HIPAA Compliant
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  FDA Guidelines
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Expert Verified
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="relative p-8 transition-transform duration-500 transform bg-white shadow-2xl rounded-2xl rotate-3 hover:rotate-0">
                <div className="absolute inset-0 bg-gradient-to-br from-medical-500 to-primary-600 rounded-2xl opacity-10"></div>
                <div className="relative">
                  <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-medical-100 rounded-2xl">
                    <Eye className="w-12 h-12 text-medical-600 bg-navy-800" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-center text-gray-900">
                    AI-Powered Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <span className="text-sm font-medium text-gray-700">Normal Retina</span>
                      <span className="font-bold text-green-600">98.5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                      <span className="text-sm font-medium text-gray-700">Diabetic Retinopathy</span>
                      <span className="font-bold text-red-600">1.2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                      <span className="text-sm font-medium text-gray-700">Glaucoma Risk</span>
                      <span className="font-bold text-yellow-600">0.3%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute w-20 h-20 rounded-full -top-4 -right-4 bg-primary-500 opacity-20 animate-bounce"></div>
              <div className="absolute w-16 h-16 rounded-full -bottom-4 -left-4 bg-medical-500 opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mb-2 text-3xl font-bold text-white lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mb-1 font-semibold text-medical-400">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-navy-900">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Advanced Eye Care Technology
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-white">
              Our platform combines cutting-edge AI with expert medical knowledge to provide 
              accurate, accessible eye disease screening for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:border-medical-200 hover:shadow-lg group"
                >
                  <div className="flex items-center justify-center mb-4 transition-colors duration-300 rounded-lg w-14 h-14 bg-medical-100 group-hover:bg-medical-200">
                    <IconComponent className="h-7 w-7 text-medical-600" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Disease Detection Section */}
      <section className="py-20 bg-navy-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">
              Diseases We Detect
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-white">
              Our AI system is trained to identify the most common and serious eye conditions 
              that lead to vision loss worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {diseases.map((disease, index) => {
              const severityColors = {
                red: 'bg-red-100 text-red-800 border-red-200',
                orange: 'bg-orange-100 text-orange-800 border-orange-200',
                yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200'
              };

              return (
                <div
                  key={index}
                  className="p-6 transition-shadow duration-300 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {disease.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[disease.color]}`}>
                      {disease.severity}
                    </span>
                  </div>
                  <p className="mb-4 text-gray-600">
                    {disease.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-medical-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    AI Detection Available
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              How SympFindX Works
            </h2>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Simple, fast, and accurate eye disease screening in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-2xl font-bold text-white rounded-full bg-medical-600">
                  1
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Upload Image</h3>
              <p className="text-gray-600">
                Upload a clear photo of your eye or retinal scan. Our system accepts various image formats.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-2xl font-bold text-white rounded-full bg-medical-600">
                  2
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">AI Analysis</h3>
              <p className="text-gray-600">
                Advanced CNN algorithms analyze your image and symptoms to detect potential eye diseases.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 text-2xl font-bold text-white rounded-full bg-medical-600">
                  3
                </div>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">Get Results</h3>
              <p className="text-gray-600">
                Receive instant screening results and connect with specialists for further consultation if needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-medical-600 to-primary-700">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
            Ready to Protect Your Vision?
          </h2>
          <p className="mb-8 text-xl text-medical-100">
            Join thousands of people who trust SympFindX for early eye disease detection. 
            Start your free screening today.
          </p>
          
          {isAuthenticated ? (
            <Link
              to="/diagnosis"
              className="inline-flex items-center px-8 py-4 font-semibold transition-all duration-300 transform bg-white shadow-lg text-medical-600 rounded-xl hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1"
            >
              <Activity className="w-5 h-5 mr-2" />
              Start Your Screening
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 font-semibold transition-all duration-300 transform bg-white shadow-lg text-medical-600 rounded-xl hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-transparent border-2 border-white rounded-xl hover:bg-white hover:text-medical-600"
              >
                Learn More
              </Link>
            </div>
          )}

          <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-medical-100">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              10,000+ Users
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              100% Secure
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Clinically Validated
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;