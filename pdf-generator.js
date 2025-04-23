function generatePDFReport(patientData, diagnosisData) {
  // Check if jsPDF is available
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error("jsPDF is not available");
    throw new Error("PDF library not loaded correctly");
  }
  
  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Set up page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Define theme colors (matches Diagno+ green theme)
  const primaryColor = [30, 126, 97]; // RGB for #1e7e61
  const secondaryColor = [42, 199, 140]; // RGB for #2ac78c
  const lightGreen = [235, 248, 244]; // RGB for #ebf8f4
  const darkText = [51, 51, 51]; // RGB for #333333
  const lightText = [119, 119, 119]; // RGB for #777777

  // --- HEADER SECTION ---
  
  // Add green header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo text
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Diagno+", margin, 25);
  
  // Add report title
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Diagnostic Report", pageWidth - margin, 25, { align: "right" });
  
  // Add current date
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.setFontSize(10);
  doc.text(`Generated on: ${today}`, pageWidth - margin, 32, { align: "right" });
  
  // --- PATIENT INFORMATION SECTION ---
  let yPosition = 50;
  
  // Add section title
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.text("PATIENT INFORMATION", margin, yPosition);
  yPosition += 8;
  
  // Add green underline
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, margin + 60, yPosition);
  yPosition += 10;
  
  // Add patient info box with light green background
  doc.setFillColor(...lightGreen);
  doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
  yPosition += 8;
  
  // Add patient details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  
  // Left column
  doc.setFont("helvetica", "bold");
  doc.text("Name:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(patientData.name, margin + 25, yPosition);
  
  // Right column
  doc.setFont("helvetica", "bold");
  doc.text("Patient ID:", pageWidth/2, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(patientData.patientId, pageWidth/2 + 30, yPosition);
  
  yPosition += 10;
  
  // Second row
  doc.setFont("helvetica", "bold");
  doc.text("Age:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(patientData.age.toString(), margin + 25, yPosition);
  
  doc.setFont("helvetica", "bold");
  doc.text("Report Date:", pageWidth/2, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(today, pageWidth/2 + 30, yPosition);
  
  yPosition += 20;
  
  // --- DIAGNOSIS RESULT SECTION ---
  
  // Section title
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.text("DIAGNOSIS RESULT", margin, yPosition);
  yPosition += 8;
  
  // Add green underline
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, margin + 60, yPosition);
  yPosition += 10;
  
  // Result box with highlighted background
  doc.setFillColor(...lightGreen);
  doc.roundedRect(margin, yPosition, contentWidth, 40, 3, 3, 'F');
  yPosition += 10;
  
  // Test type
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Test Type:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(diagnosisData.testType, margin + 40, yPosition);
  yPosition += 10;
  
  // Diagnosis result
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Diagnosis:", margin + 5, yPosition);
  
  // Make the diagnosis stand out
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(diagnosisData.prediction, margin + 40, yPosition);
  doc.setTextColor(...darkText);
  yPosition += 10;
  
  // Confidence score
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Confidence:", margin + 5, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(`${diagnosisData.confidence}%`, margin + 40, yPosition);
  yPosition += 20;
  
  // --- CONDITION INFORMATION SECTION ---
  
  // Section title
  doc.setFontSize(14);
  doc.setTextColor(...darkText);
  doc.setFont("helvetica", "bold");
  doc.text("CONDITION INFORMATION", margin, yPosition);
  yPosition += 8;
  
  // Add green underline
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, margin + 70, yPosition);
  yPosition += 10;
  
  // Condition info content with text wrapping
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  
  const metadata = diagnosisData.metadata || "No additional information available.";
  const splitMetadata = doc.splitTextToSize(metadata, contentWidth - 10);
  
  // Light background for metadata text
  const metadataHeight = splitMetadata.length * 5 + 10;
  doc.setFillColor(...lightGreen);
  doc.roundedRect(margin, yPosition, contentWidth, metadataHeight, 3, 3, 'F');
  
  // Add metadata text
  doc.text(splitMetadata, margin + 5, yPosition + 7);
  yPosition += metadataHeight + 15;
  
  // --- VISUALIZATION IMAGE SECTION ---
  if (diagnosisData.visualizationImage) {
    try {
      // Check if we need a new page
      if (yPosition + 100 > pageHeight - 20) {
        doc.addPage();
        yPosition = 40;
        
        // Add mini header on new page
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 15, 'F');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text("Diagno+ Medical Report", margin, 10);
      }
      
      // Section title
      doc.setFontSize(14);
      doc.setTextColor(...darkText);
      doc.setFont("helvetica", "bold");
      doc.text("DIAGNOSTIC VISUALIZATION", margin, yPosition);
      yPosition += 8;
      
      // Add green underline
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, margin + 70, yPosition);
      yPosition += 10;
      
      // Image frame with shadow effect
      const imgWidth = 160;
      const imgHeight = 80;
      
      // Add a shadow effect (light gray rectangle offset slightly)
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(margin + 3, yPosition + 3, imgWidth, imgHeight, 2, 2, 'F');
      
      // Add border around image
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, yPosition, imgWidth, imgHeight, 2, 2, 'F');
      
      // Add the image
      doc.addImage(diagnosisData.visualizationImage, 'PNG', margin, yPosition, imgWidth, imgHeight);
      
      yPosition += imgHeight + 10;
      
      // Add caption
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...lightText);
      doc.text("Visualization of diagnostic analysis results", margin + imgWidth/2, yPosition, { align: "center" });
      
      yPosition += 15;
    } catch (imgError) {
      console.error("Error adding image to PDF:", imgError);
      doc.text("Image visualization unavailable", margin, yPosition);
      yPosition += 10;
    }
  }
  
  // --- FOOTER SECTION ---
  
  // Add green footer bar
  const footerHeight = 15;
  doc.setFillColor(...primaryColor);
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
  
  // Add disclaimer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("This report is generated by AI and should be reviewed by a healthcare professional.", 
    pageWidth/2, pageHeight - footerHeight/2, { align: "center" });
  
  // Add page numbers to each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 10, pageHeight - footerHeight/2);
  }
  
  return doc;
}

// Expose the function globally
window.generatePDFReport = generatePDFReport;
