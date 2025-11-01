import React from 'react';
import { 
  Eye, 
  Brain, 
  Users, 
  Shield, 
  Award, 
  Globe,
  Heart,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      specialization: 'Ophthalmology & AI Research',
      image: '👩‍⚕️'
    },
    {
      name: 'Alex Chen',
      role: 'Lead AI Engineer',
      specialization: 'Computer Vision & Deep Learning',
      image: '👨‍💻'
    },
    {
      name: 'Dr. Priya Sharma',
      role: 'Clinical Advisor',
      specialization: 'Retinal Diseases',
      image: '👩‍⚕️'
    }
  ];

  const achievements = [
    { number: '95%', label: 'Diagnostic Accuracy', icon: Target },
    { number: '50+', label: 'Partner Hospitals', icon: Globe },
    { number: '10K+', label: 'Lives Impacted', icon: Heart },
    { number: '24/7', label: 'Availability', icon: Shield }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Technology',
      description: 'State-of-the-art Convolutional Neural Networks trained on millions of retinal images'
    },
    {
      icon: Eye,
      title: 'Comprehensive Detection',
      description: 'Detects multiple eye diseases including diabetic retinopathy, glaucoma, and macular degeneration'
    },
    {
      icon: Users,
      title: 'Expert Network',
      description: 'Connected to qualified ophthalmologists and retina specialists worldwide'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'HIPAA compliant platform ensuring complete patient data privacy and security'
    }
  ];

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
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">SympFindX</span>
          </h1>
          <p className="text-xl text-navy-300 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to prevent vision loss through early detection and accessible eye care. 
            Our AI-powered platform makes comprehensive eye disease screening available to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="card">
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-primary-500 mr-3" />
                <h2 className="text-2xl font-bold text-white font-roboto-slab">Our Mission</h2>
              </div>
              <p className="text-navy-300 leading-relaxed">
                To democratize access to quality eye care by leveraging artificial intelligence for early 
                detection of vision-threatening diseases. We believe that everyone deserves the chance to 
                preserve their sight, regardless of geographic location or economic status.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-6">
                <Eye className="w-8 h-8 text-primary-500 mr-3" />
                <h2 className="text-2xl font-bold text-white font-roboto-slab">Our Vision</h2>
              </div>
              <p className="text-navy-300 leading-relaxed">
                A world where preventable blindness is eliminated through innovative technology and 
                accessible healthcare. We envision a future where AI-powered screening becomes a 
                standard part of routine healthcare, catching diseases before they cause irreversible damage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-roboto-slab">
              The Global Eye Health Crisis
            </h2>
            <p className="text-xl text-navy-300 max-w-3xl mx-auto">
              Over 2.2 billion people worldwide suffer from vision impairment, with at least 1 billion cases 
              being preventable or treatable with early intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Rising Prevalence</h3>
              <p className="text-navy-300">
                Diabetes affects 537 million adults globally, with 40% at risk of diabetic retinopathy
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Limited Access</h3>
              <p className="text-navy-300">
                Many communities lack access to specialized eye care and early screening programs
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Late Detection</h3>
              <p className="text-navy-300">
                Most eye diseases are asymptomatic until advanced stages, making early detection crucial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-20 bg-navy-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-roboto-slab">
              Our AI-Powered Solution
            </h2>
            <p className="text-xl text-navy-300 max-w-3xl mx-auto">
              SympFindX combines cutting-edge artificial intelligence with medical expertise to provide 
              accurate, accessible, and affordable eye disease screening.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="card hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                      <p className="text-navy-300 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-roboto-slab">
              Our Impact
            </h2>
            <p className="text-xl text-navy-300">
              Making a real difference in global eye health
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-4">
                    <IconComponent className="w-12 h-12 text-primary-500 mx-auto" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{achievement.number}</div>
                  <p className="text-navy-300">{achievement.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-roboto-slab">
              Meet Our Team
            </h2>
            <p className="text-xl text-navy-300">
              Expert clinicians and AI researchers working together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card text-center hover:transform hover:scale-105 transition-all duration-300">
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                <p className="text-primary-400 font-medium mb-2">{member.role}</p>
                <p className="text-navy-300 text-sm">{member.specialization}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-roboto-slab">
              Our Technology
            </h2>
            <p className="text-xl text-navy-300">
              Built with cutting-edge AI and medical imaging technologies
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Convolutional Neural Networks (CNN)
                  </h3>
                  <p className="text-navy-300">
                    Deep learning models trained on millions of retinal images for accurate disease detection
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Natural Language Processing
                  </h3>
                  <p className="text-navy-300">
                    TF-IDF and Naive Bayes algorithms analyze patient symptoms for comprehensive diagnosis
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Cloud Infrastructure
                  </h3>
                  <p className="text-navy-300">
                    Scalable, secure cloud platform ensuring 24/7 availability and data protection
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Medical Grade Security
                  </h3>
                  <p className="text-navy-300">
                    HIPAA compliant with end-to-end encryption and strict access controls
                  </p>
                </div>
              </div>
            </div>

            <div className="card text-center">
              <Brain className="w-24 h-24 text-primary-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">AI Model Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy-300">Sensitivity</span>
                    <span className="text-white">94.2%</span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy-300">Specificity</span>
                    <span className="text-white">95.8%</span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '95.8%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy-300">Overall Accuracy</span>
                    <span className="text-white">95.1%</span>
                  </div>
                  <div className="w-full bg-navy-700 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '95.1%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-primary-700/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-roboto-slab">
            Join Us in Our Mission
          </h2>
          <p className="text-xl text-navy-300 mb-8 max-w-3xl mx-auto">
            Together, we can prevent vision loss and preserve sight for millions worldwide. 
            Start your eye health journey with SympFindX today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="btn-primary inline-flex items-center justify-center">
              Get Started Today
              <Eye className="w-5 h-5 ml-2" />
            </button>
            <button className="btn-secondary inline-flex items-center justify-center">
              Contact Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;