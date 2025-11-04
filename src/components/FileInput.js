import React, { useState } from 'react';
import './FileInput.css';

function FileInput({ onSubmit }) {
  const [inputType, setInputType] = useState('upload'); // 'upload' or 's3'
  const [s3Url, setS3Url] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleS3UrlChange = (e) => {
    setS3Url(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (inputType === 'upload' && !file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (inputType === 's3' && !s3Url.trim()) {
      setError('Please enter a file URL');
      return;
    }

    if (inputType === 's3' && !(s3Url.startsWith('s3://') || s3Url.startsWith('http://') || s3Url.startsWith('https://'))) {
      setError('URL must start with s3://, http://, or https://');
      return;
    }

    onSubmit({
      type: inputType,
      file: inputType === 'upload' ? file : null,
      s3Url: inputType === 's3' ? s3Url : null,
      fileName: inputType === 'upload' ? file.name : s3Url.split('/').pop()
    });
  };

  return (
    <div className="file-input-container">
      <h2>Step 1: Provide Your Geospatial File</h2>
      <p className="step-description">
        Upload a file or provide an S3 link to a geospatial dataset
      </p>

      <div className="input-type-selector">
        <button
          className={`type-button ${inputType === 'upload' ? 'active' : ''}`}
          onClick={() => setInputType('upload')}
        >
          Upload File
        </button>
        <button
          className={`type-button ${inputType === 's3' ? 'active' : ''}`}
          onClick={() => setInputType('s3')}
        >
          S3 Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="file-input-form">
        {inputType === 'upload' ? (
          <div className="upload-section">
            <label htmlFor="file-upload" className="file-upload-label">
              <div className="upload-box">
                <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="upload-text">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="upload-hint">
                  COG, NetCDF, GeoParquet, GRIB, HDF5 files
                </p>
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="file-input-hidden"
              accept=".tif,.tiff,.nc,.parquet,.grib,.hdf5,.h5"
            />
          </div>
        ) : (
          <div className="s3-section">
            <label htmlFor="s3-url" className="s3-label">
              File URL (S3 or HTTPS)
            </label>
            <input
              id="s3-url"
              type="text"
              value={s3Url}
              onChange={handleS3UrlChange}
              placeholder="https://example.com/path/to/file.tif"
              className="s3-input"
            />
            <p className="s3-hint">
              Example: https://openveda.cloud/data/my-file.tif or s3://my-bucket/data/file.nc
            </p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button">
          Continue to Validation
        </button>
      </form>

      <div className="supported-formats">
        <h3>Supported Formats</h3>
        <ul>
          <li><strong>COG</strong> - Cloud Optimized GeoTIFF</li>
          <li><strong>NetCDF</strong> - Network Common Data Form</li>
          <li><strong>GeoParquet</strong> - Columnar geospatial format</li>
          <li><strong>GRIB</strong> - Gridded Binary</li>
          <li><strong>HDF5</strong> - Hierarchical Data Format</li>
        </ul>
      </div>
    </div>
  );
}

export default FileInput;

