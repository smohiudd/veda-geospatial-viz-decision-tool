import React, { useState } from 'react';
import './FileInput.css';

function FileInput({ onSubmit }) {
  const [fileUrl, setFileUrl] = useState('');
  const [error, setError] = useState('');

  const exampleUrls = [
    {
      label: 'CMR - LPCLOUD',
      url: 'https://cmr.earthdata.nasa.gov/search/concepts/C2021957295-LPCLOUD.html'
    },
    {
      label: 'CMR - POCLOUD',
      url: 'https://cmr.earthdata.nasa.gov/search/concepts/C2036881735-POCLOUD.html'
    },
    {
      label: 'COG - Bangladesh Landcover',
      url: 's3://veda-data-store/bangladesh-landcover-2001-2020/MODIS_LC_2001_BD_v2.cog.tif'
    }
  ];

  const handleUrlChange = (e) => {
    setFileUrl(e.target.value);
    setError('');
  };

  const handleExampleClick = (url) => {
    setFileUrl(url);
    setError('');
  };

  const detectUrlType = (url) => {
    if (url.includes('cmr.earthdata.nasa.gov/search/concepts/')) {
      return 'cmr';
    }
    return 's3';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!fileUrl.trim()) {
      setError('Please enter a file URL');
      return;
    }

    if (!(fileUrl.startsWith('s3://') || fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
      setError('URL must start with s3://, http://, or https://');
      return;
    }

    const urlType = detectUrlType(fileUrl);

    onSubmit({
      type: urlType,
      file: null,
      s3Url: fileUrl,
      fileName: fileUrl.split('/').pop()
    });
  };

  return (
    <div className="file-input-container">
      <h2>Step 1: Provide Your Geospatial File URL</h2>
      <p className="step-description">
        Provide an S3 or HTTPS URL to a geospatial dataset for validation
      </p>

      <form onSubmit={handleSubmit} className="file-input-form">
        <div className="url-section">
          <label htmlFor="file-url" className="url-label">
            File URL (S3 or HTTPS)
          </label>
          <input
            id="file-url"
            type="text"
            value={fileUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/path/to/file.tif"
            className="url-input"
          />
          <div className="examples-section">
            <p className="examples-label">Try these examples:</p>
            <div className="example-buttons">
              {exampleUrls.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  className="example-button"
                  onClick={() => handleExampleClick(example.url)}
                  title={example.url}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
          <div className="url-info">
            <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Supports direct file URLs (COG, NetCDF, etc.) and CMR concept URLs from Earthdata. Real-time validation will be performed.</span>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button">
          Continue to Validation
        </button>
      </form>

      <div className="supported-formats">
        <h3>Supported Input Types</h3>
        <ul>
          <li><strong>Direct Files</strong> - COG, NetCDF, GeoParquet, GRIB, HDF5</li>
          <li><strong>CMR Datasets</strong> - Earthdata Cloud collections via CMR concept URLs</li>
        </ul>
      </div>
    </div>
  );
}

export default FileInput;

