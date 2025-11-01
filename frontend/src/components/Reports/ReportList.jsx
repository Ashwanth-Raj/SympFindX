// src/components/Reports/ReportList.jsx
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../Common/Loading';
import { formatDate, getUrgencyLevel, getConfidenceLevel } from '../../utils/helpers';
import jsPDF from 'jspdf';

// PDF generation function
const handleDownloadReport = (report) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text('Eye Disease Screening Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add report ID and date
  doc.setFontSize(12);
  doc.setTextColor(100, 116, 139);
  doc.text(`Report ID: ${report.id}`, 20, 35);
  doc.text(`Date: ${formatDate(report.date)}`, 20, 42);
  
  // Add line separator
  doc.setDrawColor(203, 213, 225);
  doc.line(20, 48, pageWidth - 20, 48);
  
  // Diagnosis Section
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Diagnosis', 20, 58);
  
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(`Condition: ${report.disease}`, 20, 68);
  doc.text(`Confidence Level: ${report.confidence}%`, 20, 75);
  doc.text(`Priority: ${getUrgencyLevel(report.urgency).label}`, 20, 82);
  doc.text(`Status: ${report.status === 'completed' ? 'Completed' : 'Pending Review'}`, 20, 89);
  
  // Add line separator
  doc.line(20, 95, pageWidth - 20, 95);
  
  // Recommendations Section
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text('Recommendations', 20, 105);
  
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  let yPos = 115;
  report.recommendations.forEach((rec, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 7;
  });
  
  // Specialist Information (if available)
  if (report.specialist) {
    yPos += 10;
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Recommended Specialist', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${report.specialist.name}`, 20, yPos);
    doc.text(`Specialization: ${report.specialist.specialization}`, 20, yPos + 7);
    doc.text(`Phone: ${report.specialist.phone}`, 20, yPos + 14);
  }
  
  // Footer disclaimer
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  const disclaimer = doc.splitTextToSize(
    'Disclaimer: This AI screening tool is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for any health concerns.',
    pageWidth - 40
  );
  doc.text(disclaimer, 20, doc.internal.pageSize.getHeight() - 30);
  
  // Save the PDF
  doc.save(`SympFindX_Report_${report.id}.pdf`);
};

const ReportList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message from navigation
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    // Load reports from localStorage ONLY
    const loadReports = () => {
      try {
        const storedReports = localStorage.getItem('sympfindx_reports');
        
        if (storedReports) {
          const parsedReports = JSON.parse(storedReports);
          // Sort by date (most recent first)
          const sortedReports = parsedReports.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          setReports(sortedReports);
        } else {
          // No reports exist - empty array
          setReports([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading reports:', error);
        setReports([]);
        setLoading(false);
      }
    };

    loadReports();
    
    // Listen for new reports being added
    const handleReportAdded = () => {
      loadReports();
    };
    
    window.addEventListener('reportAdded', handleReportAdded);
    
    return () => {
      window.removeEventListener('reportAdded', handleReportAdded);
    };
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'abnormal' && report.disease !== 'Normal') ||
                         (filterType === 'normal' && report.disease === 'Normal') ||
                         (filterType === 'pending' && report.status === 'pending_review');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <Loading message="Loading your reports..." fullScreen />;
  }

  if (selectedReport) {
    return <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-navy-950">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center p-4 mb-6 space-x-3 border rounded-lg bg-green-500/20 border-green-500/50">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white font-roboto-slab">
            Medical Reports
          </h1>
          <p className="text-navy-300">
            View and download your eye screening reports and recommendations
          </p>
        </div>

        {/* Filters and Search - Only show if reports exist */}
        {reports.length > 0 && (
          <div className="mb-8 card">
            <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                    <Search className="flex-shrink-0 w-5 h-5 text-navy-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-64 pl-12 input-field"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none">
                    <Filter className="flex-shrink-0 w-5 h-5 text-navy-400" />
                  </div>
                  <select
                    className="w-48 pl-12 input-field"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ paddingLeft: '3rem' }}
                  >
                    <option value="all">All Reports</option>
                    <option value="normal">Normal Results</option>
                    <option value="abnormal">Abnormal Results</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-navy-400">
                {filteredReports.length} of {reports.length} reports
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        {filteredReports.length > 0 ? (
          <div className="space-y-6">
            {filteredReports.map((report) => {
              const urgency = getUrgencyLevel(report.urgency);
              const confidence = getConfidenceLevel(report.confidence);
              
              return (
                <div key={report.id} className="transition-all duration-300 card hover:border-primary-500/50">
                  <div className="flex flex-col justify-between lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <div className="flex items-center mb-4 space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-600/20">
                          <FileText className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{report.id}</h3>
                          <p className="text-sm text-navy-400">{formatDate(report.date)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-navy-400">Diagnosis</p>
                          <p className="font-medium text-white">{report.disease}</p>
                        </div>
                        <div>
                          <p className="text-sm text-navy-400">Confidence</p>
                          <p className={`font-medium ${confidence.color}`}>
                            {report.confidence}% ({confidence.level})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-navy-400">Priority</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.bgColor} ${urgency.color}`}>
                            {urgency.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          {report.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          )}
                          <span className={report.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                            {report.status === 'completed' ? 'Completed' : 'Pending Review'}
                          </span>
                        </div>
                        
                        {report.specialist && (
                          <div className="text-navy-400">
                            Specialist: {report.specialist.name}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center mt-4 space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 lg:mt-0">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center btn-secondary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="flex items-center btn-primary"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center card">
            <FileText className="w-16 h-16 mx-auto mb-4 text-navy-600" />
            <h3 className="mb-2 text-xl font-semibold text-white">No Reports Found</h3>
            <p className="mb-6 text-navy-400">
              {searchTerm || filterType !== 'all' 
                ? 'No reports match your current filters.' 
                : 'You haven\'t completed any eye screenings yet. Start your first screening to generate a report.'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <button 
                onClick={() => navigate('/diagnosis')}
                className="btn-primary"
              >
                Start Your First Screening
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Report Detail Component
const ReportDetail = ({ report, onBack }) => {
  const urgency = getUrgencyLevel(report.urgency);
  const confidence = getConfidenceLevel(report.confidence);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-navy-950">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="mr-4 text-primary-400 hover:text-primary-300"
          >
            ← Back to Reports
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white font-roboto-slab">
              Report {report.id}
            </h1>
            <p className="text-navy-300">{formatDate(report.date)}</p>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-8">
          {/* Summary */}
          <div className="card">
            <h2 className="mb-6 text-2xl font-bold text-white">Diagnosis Summary</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-primary-600/20">
                  <FileText className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">{report.disease}</h3>
                <p className="text-sm text-navy-400">Detected Condition</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-blue-600/20">
                  <span className={`text-2xl font-bold ${confidence.color}`}>
                    {report.confidence}%
                  </span>
                </div>
                <h3 className={`text-lg font-semibold ${confidence.color} mb-1`}>
                  {confidence.level}
                </h3>
                <p className="text-sm text-navy-400">AI Confidence</p>
              </div>
              
              <div className="text-center">
                <div className={`w-16 h-16 ${urgency.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {urgency.label === 'Critical' && <AlertTriangle className={`w-8 h-8 ${urgency.color}`} />}
                  {urgency.label === 'Urgent' && <AlertTriangle className={`w-8 h-8 ${urgency.color}`} />}
                  {urgency.label === 'Monitor' && <Clock className={`w-8 h-8 ${urgency.color}`} />}
                  {urgency.label === 'Routine' && <CheckCircle className={`w-8 h-8 ${urgency.color}`} />}
                </div>
                <h3 className={`text-lg font-semibold ${urgency.color} mb-1`}>
                  {urgency.label}
                </h3>
                <p className="text-sm text-navy-400">Priority Level</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <h2 className="mb-6 text-2xl font-bold text-white">Recommendations</h2>
            <div className="space-y-3">
              {report.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start p-3 space-x-3 rounded-lg bg-navy-800/30">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-navy-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist Information */}
          {report.specialist && (
            <div className="card">
              <h2 className="mb-6 text-2xl font-bold text-white">Recommended Specialist</h2>
              <div className="flex items-center p-4 space-x-4 rounded-lg bg-navy-800/30">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{report.specialist.name}</h3>
                  <p className="text-primary-400">{report.specialist.specialization}</p>
                  <p className="text-sm text-navy-400">Phone: {report.specialist.phone}</p>
                </div>
                <button className="btn-primary">
                  Contact Specialist
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleDownloadReport(report)}
                className="flex items-center justify-center btn-primary"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Full Report
              </button>
              <button className="flex items-center justify-center btn-secondary">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Follow-up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportList;