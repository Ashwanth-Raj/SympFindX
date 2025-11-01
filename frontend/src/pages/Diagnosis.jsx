import { usePrediction } from '../context/PredictionContext';
import { useNavigate } from 'react-router-dom';
import { saveReport } from '../utils/reportStorage';
import ImageUpload from '../components/Prediction/ImageUpload';
import SymptomForm from '../components/Prediction/SymptomForm';
import ResultDisplay from '../components/Prediction/ResultDisplay';
import jsPDF from 'jspdf';
import {
  Eye,
  Upload,
  FileText,
  Brain,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Download,
  Save
} from 'lucide-react';

const Diagnosis = () => {
  const navigate = useNavigate();
  const {
    step: currentStep,
    currentPrediction,
    loading,
    uploadedImage
  } = usePrediction();

  const steps = [
    { id: 1, title: 'Upload Image', description: 'Upload a clear photo of your eye', icon: Upload, completed: !!uploadedImage },
    { id: 2, title: 'Describe Symptoms', description: 'Tell us about your symptoms', icon: FileText, completed: currentStep > 2 },
    { id: 3, title: 'AI Analysis', description: 'Our AI analyzes your data', icon: Brain, completed: currentStep > 3 },
    { id: 4, title: 'Results & Consultation', description: 'View results and get specialist help', icon: CheckCircle, completed: !!currentPrediction }
  ];

  // Function to determine urgency level based on prediction
  const getUrgencyLevel = (prediction) => {
    if (!prediction) return 'low';
    
    const disease = (prediction.disease || prediction.prediction || '').toLowerCase();
    
    // Critical conditions
    if (disease.includes('retinopathy') || disease.includes('detachment')) {
      return 'critical';
    }
    // High urgency
    if (disease.includes('glaucoma') || disease.includes('macular degeneration')) {
      return 'high';
    }
    // Moderate urgency
    if (disease.includes('cataract') || disease.includes('infection')) {
      return 'moderate';
    }
    // Low urgency (normal or minor conditions)
    return 'low';
  };

  // Function to get specialist recommendations
  const getSpecialistInfo = (prediction) => {
    if (!prediction) return null;
    
    const disease = (prediction.disease || prediction.prediction || '').toLowerCase();
    
    if (disease.includes('retinopathy')) {
      return {
        name: 'Dr. Sarah Johnson',
        specialization: 'Retina Specialist',
        phone: '+91 987 654 3210'
      };
    }
    if (disease.includes('glaucoma')) {
      return {
        name: 'Dr. Michael Chen',
        specialization: 'Glaucoma Specialist',
        phone: '+91 876 543 2109'
      };
    }
    if (disease.includes('cataract')) {
      return {
        name: 'Dr. Emily Williams',
        specialization: 'Cataract Surgeon',
        phone: '+91 765 432 1098'
      };
    }
    
    return null;
  };

  // Save report to localStorage
  const handleSaveReport = () => {
    if (!currentPrediction) return;

    const reportData = {
      disease: currentPrediction.disease || currentPrediction.prediction || 'Unknown',
      confidence: currentPrediction.confidence || 0,
      urgency: getUrgencyLevel(currentPrediction),
      status: 'completed',
      imageUrl: uploadedImage || null,
      recommendations: currentPrediction.recommendations || [
        'Please consult with an eye care professional',
        'Regular monitoring recommended',
        'Maintain overall eye health'
      ],
      specialist: getSpecialistInfo(currentPrediction)
    };

    const savedReport = saveReport(reportData);
    
    if (savedReport) {
      // Show success message and navigate to reports
      navigate('/reports', {
        state: {
          message: 'Analysis complete! Your report has been saved successfully.',
          reportId: savedReport.id
        }
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!currentPrediction) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text('SympFindX Eye Disease Screening Report', pageWidth / 2, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    const reportDate = new Date().toLocaleDateString();
    doc.text(`Report Date: ${reportDate}`, 20, 35);
    
    // Add line separator
    doc.setDrawColor(203, 213, 225);
    doc.line(20, 42, pageWidth - 20, 42);
    
    // Diagnosis Section
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Diagnosis Summary', 20, 52);
    
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text(`Detected Condition: ${currentPrediction.disease || currentPrediction.prediction || 'N/A'}`, 20, 62);
    
    if (currentPrediction.confidence) {
      doc.text(`Confidence Level: ${currentPrediction.confidence}%`, 20, 69);
    }
    
    // Add urgency level
    const urgency = getUrgencyLevel(currentPrediction);
    doc.text(`Priority Level: ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}`, 20, 76);
    
    // Add line separator
    doc.line(20, 82, pageWidth - 20, 82);
    
    // Recommendations Section
    if (currentPrediction.recommendations && currentPrediction.recommendations.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Medical Recommendations', 20, 92);
      
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      let yPos = 102;
      currentPrediction.recommendations.forEach((rec, index) => {
        const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 7;
      });
    }
    
    // Specialist Information
    const specialist = getSpecialistInfo(currentPrediction);
    if (specialist) {
      let yPos = 140;
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;
      
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Recommended Specialist', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(12);
      doc.setTextColor(51, 65, 85);
      doc.text(`Name: ${specialist.name}`, 20, yPos);
      doc.text(`Specialization: ${specialist.specialization}`, 20, yPos + 7);
      doc.text(`Phone: ${specialist.phone}`, 20, yPos + 14);
    }
    
    // Footer disclaimer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const disclaimer = doc.splitTextToSize(
      'Medical Disclaimer: This AI screening tool is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for any health concerns. The results provided are based on AI analysis and should be verified by a licensed medical practitioner.',
      pageWidth - 40
    );
    doc.text(disclaimer, 20, doc.internal.pageSize.getHeight() - 30);
    
    // Save the PDF
    const filename = `SympFindX_Report_${reportDate.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="relative min-h-screen py-12 overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bg-blue-500 rounded-full top-20 left-10 w-72 h-72 mix-blend-overlay filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute rounded-full top-40 right-20 w-96 h-96 bg-cyan-500 mix-blend-overlay filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bg-blue-400 rounded-full -bottom-32 left-1/2 w-96 h-96 mix-blend-overlay filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header Section with Enhanced Design */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full opacity-50 bg-gradient-to-r from-blue-400 to-cyan-400 blur-xl animate-pulse"></div>
              <div className="relative p-4 transition-transform duration-300 transform shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl hover:scale-105">
                <Eye className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 border rounded-full shadow-md bg-blue-900/50 backdrop-blur-sm border-blue-400/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-300">AI-Powered Technology</span>
          </div>
          <h1 className="mb-3 text-5xl font-extrabold text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text">
            Eye Disease Screening
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-200">Get AI-powered analysis of your eye health in minutes with advanced diagnostic technology</p>
        </div>

        {/* Enhanced Progress Steps */}
        <div className="p-6 mb-12 border shadow-xl bg-blue-900/40 backdrop-blur-md rounded-3xl border-blue-400/30">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = step.completed || currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center w-full">
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500 transform ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50 scale-110'
                        : isActive 
                        ? 'bg-gradient-to-br from-blue-800 to-cyan-900 shadow-lg scale-110 ring-4 ring-cyan-500/50'
                        : 'bg-blue-950/50 shadow-md scale-100 border border-blue-700/50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <IconComponent className={`h-7 w-7 ${isActive ? 'text-cyan-300' : 'text-blue-400'}`} />
                      )}
                      {isActive && (
                        <>
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 animate-ping opacity-30"></div>
                          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 blur opacity-40 animate-pulse"></div>
                        </>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className={`text-sm font-bold transition-colors ${isActive ? 'text-cyan-300' : isCompleted ? 'text-blue-200' : 'text-blue-400'}`}>
                        {step.title}
                      </p>
                      <p className="hidden mt-1 text-xs text-blue-300/70 sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 mt-8 sm:mt-0 sm:mx-6">
                      <div className={`h-1 rounded-full transition-all duration-700 ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-md shadow-blue-500/30' 
                          : 'bg-blue-800/30'
                      }`}>
                        {isActive && !isCompleted && (
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 animate-pulse" style={{ width: '50%' }}></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Card with Glass Effect */}
        <div className="overflow-hidden transition-all duration-500 transform border shadow-2xl bg-blue-900/30 backdrop-blur-xl rounded-3xl border-blue-400/30 hover:shadow-blue-500/20">
          {currentStep === 1 && (
            <div className="p-10">
              <ImageUpload />
            </div>
          )}
          {currentStep === 2 && (
            <div className="p-10">
              <SymptomForm />
            </div>
          )}
          {currentStep === 3 && (
            <div className="p-12 py-16 text-center">
              <div className="mb-8">
                <h2 className="mb-3 text-3xl font-bold text-transparent bg-gradient-to-r from-white to-cyan-300 bg-clip-text">
                  AI Analysis in Progress
                </h2>
                <p className="text-lg text-blue-200">Our advanced algorithms are analyzing your data with precision</p>
              </div>
              <div className="space-y-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 blur-2xl opacity-30 animate-pulse"></div>
                  <div className="relative w-24 h-24 border-8 rounded-full border-blue-800/50">
                    <div className="absolute inset-0 border-8 border-transparent rounded-full border-t-blue-500 border-r-cyan-500 animate-spin"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-white">Analyzing your data...</p>
                  <p className="text-sm text-blue-300">This may take a moment</p>
                </div>
                {/* Processing Steps Animation */}
                <div className="max-w-md mx-auto space-y-3">
                  {['Processing image data', 'Analyzing symptoms', 'Generating insights'].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border bg-blue-800/30 backdrop-blur-sm rounded-xl border-blue-600/30" style={{ animationDelay: `${i * 0.5}s` }}>
                      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span className="text-sm text-blue-100">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-8">
              {loading && (
                <div className="p-12 text-center">
                  <div className="inline-block w-12 h-12 border-4 border-blue-700 rounded-full border-t-cyan-500 animate-spin"></div>
                  <p className="mt-4 text-blue-200">Loading results...</p>
                </div>
              )}
              {currentPrediction && (
                <>
                  <ResultDisplay />
                  <div className="px-10 pb-10">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button
                        onClick={handleSaveReport}
                        className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold text-white transition-all duration-300 transform shadow-xl bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 hover:scale-105 hover:shadow-2xl"
                      >
                        <Save className="w-6 h-6" />
                        Save to Reports
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold text-white transition-all duration-300 transform shadow-xl bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-2xl"
                      >
                        <Download className="w-6 h-6" />
                        Download PDF
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Disclaimer */}
        <div className="p-6 mt-10 border-2 shadow-lg bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-yellow-500/40 rounded-2xl backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="text-sm text-yellow-100">
              <p className="mb-2 text-base font-bold">Important Medical Disclaimer</p>
              <p className="leading-relaxed">This AI screening tool is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional for any health concerns.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;