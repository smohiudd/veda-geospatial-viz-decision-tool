import React, { useState } from 'react';
import FileInput from './FileInput';
import FileValidation from './FileValidation';
import VisualizationOptions from './VisualizationOptions';
import './Wizard.css';

const STEPS = {
  FILE_INPUT: 'file_input',
  VALIDATION: 'validation',
  VISUALIZATION: 'visualization'
};

function Wizard() {
  const [currentStep, setCurrentStep] = useState(STEPS.FILE_INPUT);
  const [fileData, setFileData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const handleFileSubmit = (data) => {
    setFileData(data);
    setCurrentStep(STEPS.VALIDATION);
  };

  const handleValidationComplete = (result) => {
    setValidationResult(result);
    setCurrentStep(STEPS.VISUALIZATION);
  };

  const handleReset = () => {
    setCurrentStep(STEPS.FILE_INPUT);
    setFileData(null);
    setValidationResult(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.FILE_INPUT:
        return <FileInput onSubmit={handleFileSubmit} />;
      case STEPS.VALIDATION:
        return (
          <FileValidation
            fileData={fileData}
            onValidationComplete={handleValidationComplete}
            onBack={() => setCurrentStep(STEPS.FILE_INPUT)}
          />
        );
      case STEPS.VISUALIZATION:
        return (
          <VisualizationOptions
            fileData={fileData}
            validationResult={validationResult}
            onReset={handleReset}
          />
        );
      default:
        return <FileInput onSubmit={handleFileSubmit} />;
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case STEPS.FILE_INPUT:
        return 1;
      case STEPS.VALIDATION:
        return 2;
      case STEPS.VISUALIZATION:
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="wizard-container">
      <header className="wizard-header">
        <h1>Geospatial File Decision Tool</h1>
        <p className="wizard-subtitle">
          Upload a geospatial file or provide an S3 link to get visualization recommendations
        </p>
      </header>

      <div className="progress-bar">
        <div className={`progress-step ${currentStep === STEPS.FILE_INPUT ? 'active' : ''} ${getStepNumber() > 1 ? 'completed' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">File Input</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep === STEPS.VALIDATION ? 'active' : ''} ${getStepNumber() > 2 ? 'completed' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Validation</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep === STEPS.VISUALIZATION ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Visualization</div>
        </div>
      </div>

      <div className="wizard-content">
        {renderStep()}
      </div>
    </div>
  );
}

export default Wizard;

