import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null); 
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("condition", "Torn"); 

    try {
      const response = await fetch("http://127.0.0.1:8000/api/inventory/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis Failed");
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error("Error during analysis:", error);
      alert("Backend connection failed! Check if FastAPI is running and CORS is enabled.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReport = () => {
    if (!analysisResult) return;

    const doc = new jsPDF();
    const currentDateTime = new Date().toLocaleString(); 

    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34); 
    doc.text("AI Textile Waste Analysis Report", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Scan Date & Time: ${currentDateTime}`, 20, 30);
    doc.line(20, 35, 190, 35); 

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`1. Detected Material: ${analysisResult.detected_material || 'Unknown'}`, 20, 50);
    doc.text(`2. Confidence Score: ${analysisResult.material_confidence || '0%'}`, 20, 60);
    doc.text(`3. Physical Condition: ${analysisResult.detected_condition || 'Unknown'}`, 20, 70);
    doc.text(`4. Circularity / Reusable Score: ${analysisResult.circularity_score || 0}/100`, 20, 80);
    doc.text(`5. Recommended Strategy: ${analysisResult.recommended_strategy || 'Unknown'}`, 20, 90);

    if (previewUrl) {
      try {
        doc.text("6. Scanned Cloth Image Details:", 20, 110);
        doc.text("(Image referenced securely from local session)", 20, 120);
      } catch (err) {
        console.log("Image render skipped for PDF formatting");
      }
    }

    doc.save(`AI_Textile_Report_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">AI Textile Analysis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="h-48 object-cover rounded-md mb-4" />
            ) : (
              <UploadCloud className="h-16 w-16 text-gray-400 mb-4" />
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
              id="fileInput" 
            />
            <label 
              htmlFor="fileInput" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded cursor-pointer transition-colors"
            >
              Select Textile Image
            </label>
            <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG formats</p>
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={!selectedFile || loading}
            className={`w-full mt-4 py-3 rounded-lg font-bold text-white flex justify-center items-center ${
              !selectedFile || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
            {loading ? 'AI is Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Analysis Report</h3>
          
          {analysisResult ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 font-semibold">Detected Material</p>
                <p className="text-lg font-bold text-blue-700">
                  {analysisResult.detected_material || "Unknown"}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  Confidence: {analysisResult.material_confidence || "0%"}
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 font-semibold">Physical Condition</p>
                <p className="text-lg font-bold text-yellow-700">
                  {analysisResult.detected_condition || "Unknown"}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 font-semibold">Recommended Strategy</p>
                <p className="text-lg font-bold text-green-700">
                  {analysisResult.recommended_strategy || "Unknown"}
                </p>
                <p className="text-sm text-green-600 mt-1 font-medium">
                  Circularity Score: {analysisResult.circularity_score || 0}/100
                </p>
              </div>

              <button
                onClick={downloadPDFReport}
                className="w-full mt-6 bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded-lg shadow transition-colors flex justify-center items-center"
              >
                Download PDF Report
              </button>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
              <p>Upload a textile image and run analysis to see the AI report here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;