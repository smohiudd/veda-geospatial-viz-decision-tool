import React, { useState, useEffect } from 'react';
import './FileValidation.css';

function FileValidation({ fileData, onValidationComplete, onBack }) {
  const [isValidating, setIsValidating] = useState(true);
  const [validationSteps, setValidationSteps] = useState([]);

  useEffect(() => {
    // Simulate validation process
    performValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const performValidation = async () => {
    const steps = [];
    let isValid = true;
    let validationDetails = null;

    // Step 1: S3 Accessibility Check (if S3)
    if (fileData.type === 's3') {
      steps.push({ name: 'S3 Accessibility Check', status: 'running' });
      setValidationSteps([...steps]);
      
      await simulateDelay(1500);
      steps[0].status = 'completed';
      steps[0].message = 'S3 bucket is accessible';
      setValidationSteps([...steps]);
    }

    // Step 2: File Format Detection
    await simulateDelay(1000);
    steps.push({ name: 'File Format Detection', status: 'running' });
    setValidationSteps([...steps]);
    
    await simulateDelay(500);
    const detectedFormat = detectFileFormat(fileData.fileName);
    steps[steps.length - 1].status = 'completed';
    steps[steps.length - 1].message = `Detected format: ${detectedFormat}`;
    setValidationSteps([...steps]);

    // Step 3: Format-Specific Validation
    await simulateDelay(500);
    steps.push({ name: `${detectedFormat} Validation`, status: 'running' });
    setValidationSteps([...steps]);
    
    // Actual COG validation using API
    if (detectedFormat === 'COG' && fileData.type === 's3') {
      try {
        const validationResult = await validateCOG(fileData.s3Url);
        isValid = validationResult.isValid;
        validationDetails = validationResult.details;
        
        steps[steps.length - 1].status = isValid ? 'completed' : 'failed';
        steps[steps.length - 1].message = validationResult.message;
      } catch (error) {
        steps[steps.length - 1].status = 'failed';
        steps[steps.length - 1].message = `Validation error: ${error.message}`;
        isValid = false;
      }
    } else {
      // For non-COG formats or uploaded files, use simulated validation
      await simulateDelay(2000);
      steps[steps.length - 1].status = 'completed';
      steps[steps.length - 1].message = getFormatValidationMessage(detectedFormat);
    }
    
    setValidationSteps([...steps]);
    setIsValidating(false);

    // Complete validation
    setTimeout(() => {
      onValidationComplete({
        format: detectedFormat,
        isValid: isValid,
        isCloudOptimized: isValid && checkCloudOptimized(detectedFormat),
        metadata: getMetadata(detectedFormat),
        validationDetails: validationDetails
      });
    }, 1000);
  };

  const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const validateCOG = async (fileUrl) => {
    try {
      const apiUrl = `https://openveda.cloud/api/raster/cog/validate?url=${encodeURIComponent(fileUrl)}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check for the COG key in the response
      const isCogValid = data.COG === true;
      
      return {
        isValid: isCogValid,
        message: isCogValid 
          ? 'Valid COG structure with proper tiling' 
          : 'File is not a valid Cloud Optimized GeoTIFF',
        details: data
      };
    } catch (error) {
      console.error('COG Validation Error:', error);
      throw new Error(error.message || 'Failed to validate COG');
    }
  };

  const detectFileFormat = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const formatMap = {
      'tif': 'COG',
      'tiff': 'COG',
      'nc': 'NetCDF',
      'parquet': 'GeoParquet',
      'grib': 'GRIB',
      'hdf5': 'HDF5',
      'h5': 'HDF5'
    };
    return formatMap[extension] || 'Unknown';
  };

  const getFormatValidationMessage = (format) => {
    const messages = {
      'COG': 'Valid COG structure with proper tiling',
      'NetCDF': 'Valid NetCDF-4 format, cloud optimized',
      'GeoParquet': 'Valid GeoParquet with spatial metadata',
      'GRIB': 'Valid GRIB2 format detected',
      'HDF5': 'Valid HDF5 structure'
    };
    return messages[format] || 'Format validated';
  };

  const checkCloudOptimized = (format) => {
    return ['COG', 'NetCDF', 'GeoParquet'].includes(format);
  };

  const getMetadata = (format) => {
    // Placeholder metadata based on format
    return {
      format,
      hasTimeDimension: ['NetCDF', 'GRIB'].includes(format),
      spatialType: format === 'GeoParquet' ? 'vector' : 'raster',
      hasMultipleBands: ['COG', 'NetCDF', 'HDF5'].includes(format)
    };
  };

  return (
    <div className="validation-container">
      <h2>Step 2: Validating File</h2>
      <p className="step-description">
        Running validation checks on your file: <strong>{fileData.fileName}</strong>
      </p>

      <div className="validation-steps">
        {validationSteps.map((step, index) => (
          <div key={index} className={`validation-step ${step.status}`}>
            <div className="step-icon">
              {step.status === 'running' && (
                <div className="spinner"></div>
              )}
              {step.status === 'completed' && (
                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {step.status === 'failed' && (
                <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="step-content">
              <div className="step-name">{step.name}</div>
              {step.message && <div className="step-message">{step.message}</div>}
            </div>
          </div>
        ))}
      </div>

      {!isValidating && (
        <div className="validation-complete">
          <div className="success-message">
            <svg className="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Validation Complete!</span>
          </div>
        </div>
      )}

      <div className="button-group">
        <button onClick={onBack} className="back-button">
          Back
        </button>
      </div>
    </div>
  );
}

export default FileValidation;

