import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Calendar, 
  User, 
  FileText, 
  Activity, 
  TrendingUp, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePrediction } from '../../context/PredictionContext';
import Loading from '../Common/Loading';
import { formatDate, getUrgencyLevel, calculateAge } from '../../utils/helpers';
import { ROUTES } from '../../utils/constants';

const UserDashboard = () => {
  const { user } = useAuth();
  const { predictionHistory, setPredictionHistory } = usePrediction();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    normalResults: 0,
    abnormalResults: 0,
    lastScan: null
  });

  useEffect(() => {
    // Simulate loading user data and prediction history
    const loadDashboardData = async () => {
      try {
        // This would normally fetch from API
        // const predictions = await predictionService.getPredictionHistory();
        
        // Mock data for now
        const mockPredictions = [
          {
            id: 1,
            disease: 'Normal',
            confidence: 92,
            urgency: 'low',
            createdAt: '2025-01-15T10:30:00Z',
            imageUrl: null
          },
          {
            id: 2,
            disease: 'Diabetic Retinopathy',
            confidence: 78,
            urgency: 'high',
            createdAt: '2025-01-10T14:20:00Z',
            imageUrl: null
          }
        ];

        setPredictionHistory(mockPredictions);

        // Calculate stats
        const totalScans = mockPredictions.length;
        const normalResults = mockPredictions.filter(p => p.disease.toLowerCase() === 'normal').length;
        const abnormalResults = totalScans - normalResults;
        const lastScan = mockPredictions.length > 0 ? mockPredictions[0].createdAt : null;

        setStats({
          totalScans,
          normalResults,
          abnormalResults,
          lastScan
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [setPredictionHistory]);

  if (loading) {
    return <Loading message="Loading your dashboard..." fullScreen />;
  }

  const quickActions = [
    {
      title: 'New Eye Scan',
      description: 'Upload eye image for AI analysis',
      icon: Eye,
      link: ROUTES.DIAGNOSIS,
      color: 'from-primary-500 to-primary-700'
    },
    {
      title: 'View Reports',
      description: 'Access your medical reports',
      icon: FileText,
      link: ROUTES.REPORTS,
      color: 'from-blue-500 to-blue-700'
    },
    {
      title: 'Find Specialists',
      description: 'Connect with eye specialists',
      icon: User,
      link: '/specialists',
      color: 'from-green-500 to-green-700'
    }
  ];

  const recentActivities = [
    {
      type: 'scan',
      message: 'Eye scan completed - Normal result',
      time: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-400'
    },
    {
      type: 'report',
      message: 'Medical report generated',
      time: '1 day ago',
      icon: FileText,
      color: 'text-blue-400'
    },
    {
      type: 'alert',
      message: 'Recommendation: Schedule follow-up',
      time: '3 days ago',
      icon: AlertTriangle,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="min-h-screen bg-navy-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-roboto-slab">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-navy-300 mt-2">
            Monitor your eye health and access your screening results
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-400 text-sm">Total Scans</p>
                <p className="text-2xl font-bold text-white">{stats.totalScans}</p>
              </div>
              <Activity className="w-8 h-8 text-primary-500" />
            </div>
            <div className="mt-4 flex items-center text-green-400 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              +2 this month
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-400 text-sm">Normal Results</p>
                <p className="text-2xl font-bold text-white">{stats.normalResults}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-navy-400 text-sm">
              <span>{stats.totalScans > 0 ? Math.round((stats.normalResults / stats.totalScans) * 100) : 0}% of total</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-400 text-sm">Abnormal Results</p>
                <p className="text-2xl font-bold text-white">{stats.abnormalResults}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-4 flex items-center text-navy-400 text-sm">
              <span>Requires attention</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-navy-400 text-sm">Last Scan</p>
                <p className="text-lg font-semibold text-white">
                  {stats.lastScan ? formatDate(stats.lastScan).split(',')[0] : 'Never'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-navy-400 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {stats.lastScan ? formatDate(stats.lastScan).split(' at ')[1] : 'No scans yet'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <Link 
                      key={index}
                      to={action.link}
                      className="block p-4 bg-navy-800/30 rounded-lg border border-navy-700 hover:border-primary-500/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium group-hover:text-primary-400 transition-colors">
                            {action.title}
                          </h4>
                          <p className="text-navy-400 text-sm">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Scans & Activities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Scans */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Scans</h3>
                <Link 
                  to={ROUTES.REPORTS}
                  className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                >
                  View all
                </Link>
              </div>

              {predictionHistory.length > 0 ? (
                <div className="space-y-4">
                  {predictionHistory.slice(0, 3).map((prediction) => {
                    const urgency = getUrgencyLevel(prediction.urgency);
                    return (
                      <div key={prediction.id} className="p-4 bg-navy-800/30 rounded-lg border border-navy-700">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{prediction.disease}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.bgColor} ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-400">
                            Confidence: {prediction.confidence}%
                          </span>
                          <span className="text-navy-400">
                            {formatDate(prediction.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-16 h-16 text-navy-600 mx-auto mb-4" />
                  <p className="text-navy-400 mb-4">No scans yet</p>
                  <Link to={ROUTES.DIAGNOSIS} className="btn-primary inline-flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your First Scan
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-navy-800/30 transition-colors">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.message}</p>
                        <p className="text-navy-400 text-xs mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="mt-8 card">
          <h3 className="text-xl font-semibold text-white mb-6">Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-navy-400 text-sm">Age</p>
              <p className="text-white font-medium">
                {user?.dateOfBirth ? calculateAge(user.dateOfBirth) : 'Not provided'} years
              </p>
            </div>
            <div>
              <p className="text-navy-400 text-sm">Gender</p>
              <p className="text-white font-medium capitalize">
                {user?.gender || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-navy-400 text-sm">Member Since</p>
              <p className="text-white font-medium">
                {user?.createdAt ? formatDate(user.createdAt).split(',')[0] : 'Recently'}
              </p>
            </div>
          </div>
          
          {user?.medicalHistory && (
            <div className="mt-6 pt-6 border-t border-navy-700">
              <p className="text-navy-400 text-sm mb-2">Medical History</p>
              <p className="text-white text-sm bg-navy-800/30 p-3 rounded-lg">
                {user.medicalHistory}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
