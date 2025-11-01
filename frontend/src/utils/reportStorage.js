// Add this utility function to save reports
// Use this in your image upload/screening component after getting AI results

export const saveReport = (reportData) => {
  try {
    // Get existing reports from localStorage
    const existingReports = localStorage.getItem('sympfindx_reports');
    const reports = existingReports ? JSON.parse(existingReports) : [];
    
    // Generate unique report ID
    const reportId = `RPT-${new Date().getFullYear()}-${String(reports.length + 1).padStart(3, '0')}`;
    
    // Create new report object
    const newReport = {
      id: reportId,
      date: new Date().toISOString(),
      disease: reportData.disease,
      confidence: reportData.confidence,
      urgency: reportData.urgency || 'low',
      status: 'completed',
      imageUrl: reportData.imageUrl || null,
      recommendations: reportData.recommendations || [],
      specialist: reportData.specialist || null
    };
    
    // Add new report to the beginning (most recent first)
    reports.unshift(newReport);
    
    // Save back to localStorage
    localStorage.setItem('sympfindx_reports', JSON.stringify(reports));
    
    // Dispatch event to notify ReportList component
    window.dispatchEvent(new Event('reportAdded'));
    
    return newReport;
  } catch (error) {
    console.error('Error saving report:', error);
    return null;
  }
};

// Example usage in your screening component:
/*
const handleScreeningComplete = (aiResults) => {
  const reportData = {
    disease: aiResults.detectedDisease,
    confidence: aiResults.confidenceScore,
    urgency: aiResults.urgencyLevel, // 'low', 'moderate', 'high', 'critical'
    recommendations: aiResults.recommendations,
    specialist: aiResults.recommendedSpecialist, // optional
    imageUrl: uploadedImageUrl // optional
  };
  
  const savedReport = saveReport(reportData);
  
  if (savedReport) {
    // Navigate to reports page or show success message
    console.log('Report saved:', savedReport.id);
  }
};
*/