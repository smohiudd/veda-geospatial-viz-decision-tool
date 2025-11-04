import React from 'react';
import './VisualizationOptions.css';

function VisualizationOptions({ fileData, validationResult, onReset }) {
  const getRecommendedServices = () => {
    const { format, metadata, isCMR } = validationResult;
    const services = [];

    // For CMR datasets, ONLY recommend titiler-cmr
    if (isCMR) {
      services.push({
        name: 'titiler-cmr',
        title: 'Titiler-CMR',
        description: 'For data on Earthdata Cloud with CMR metadata',
        recommended: true,
        limitations: [
          'Only role-based support for GRIB datasets', 
          'Datasets with hierarchical/grouped structure may not be supported', 
          'Unknown "quirky" datasets may not be supported'
        ],
        useCase: 'Best for data on Earthdata Cloud with CMR integration',
        note: `This dataset is from Earthdata Cloud (Concept ID: ${validationResult.conceptId}). Titiler-CMR is the only compatible service for CMR datasets.`
      });
      return services;
    }

    // Based on the decision tree from the image for non-CMR datasets
    if (metadata.spatialType === 'vector') {
      // Points, lines, polygons -> tipg
      services.push({
        name: 'tipg',
        title: 'TiPg (OGC Features API)',
        description: 'Best for serving vector data (points, lines, polygons) via OGC Features API',
        recommended: true,
        limitations: ['High resolution data may be slow at low zoom levels', 'Time series generation may be slow for large AOIs'],
        useCase: 'Ideal for GeoParquet and other vector formats'
      });
    }

    if (format === 'COG' || (metadata.spatialType === 'raster' && !metadata.hasTimeDimension)) {
      // COG datasets
      services.push({
        name: 'titiler-pgstac',
        title: 'Titiler-pgstac',
        description: 'Optimized for Cloud Optimized GeoTIFF (COG) datasets',
        recommended: format === 'COG',
        limitations: [],
        useCase: 'Best for static raster datasets. Requires VEDA COG + titiler-pgstac integration',
        note: 'Migration and metadata generation may be a pre-requisite'
      });
    }

    if (format === 'NetCDF' || format === 'GRIB' || format === 'HDF5') {
      // Gridded formats (not COG)
      if (metadata.hasTimeDimension) {
        services.push({
          name: 'titiler-multidim',
          title: 'Titiler-multidim',
          description: 'For multidimensional gridded data formats',
          recommended: true,
          limitations: [],
          useCase: 'Best for NetCDF, GRIB, HDF5 with time dimensions',
          note: 'Need to build support for item-level asset tiling with titiler-multidim in the UI. Consider creating a virtual dataset, then use titiler-multidim with a collection level "zarr" asset.'
        });
      } else {
        services.push({
          name: 'conversion',
          title: 'Format Conversion',
          description: 'Consider converting to a supported format',
          recommended: false,
          limitations: ['Format not directly supported'],
          useCase: 'Convert to COG or another cloud-optimized format',
          note: 'Example: TEMPO (L2) data could be converted'
        });
      }
    }

    return services;
  };

  const services = getRecommendedServices();

  return (
    <div className="visualization-container">
      <h2>Step 3: Recommended Visualization Services</h2>
      <p className="step-description">
        Based on your file <strong>{fileData.fileName}</strong> ({validationResult.format})
      </p>

      <div className="file-info-card">
        <h3>File Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Format:</span>
            <span className="info-value">{validationResult.format}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Type:</span>
            <span className="info-value">{validationResult.metadata.spatialType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cloud Optimized:</span>
            <span className="info-value">{validationResult.isCloudOptimized ? '✓ Yes' : '✗ No'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Time Dimension:</span>
            <span className="info-value">{validationResult.metadata.hasTimeDimension ? '✓ Yes' : '✗ No'}</span>
          </div>
          {validationResult.isCMR && (
            <>
              <div className="info-item">
                <span className="info-label">Source:</span>
                <span className="info-value">Earthdata Cloud (CMR)</span>
              </div>
              <div className="info-item concept-id-item">
                <span className="info-label">Concept ID:</span>
                <span className="info-value concept-id-value">{validationResult.conceptId}</span>
              </div>
            </>
          )}
        </div>
        
        {validationResult.validationDetails && (
          <div className="validation-details">
            <h4>Validation Details</h4>
            <pre className="validation-json">
              {JSON.stringify(validationResult.validationDetails, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <h3 className="services-heading">Recommended Services</h3>
      <div className="services-list">
        {services.map((service, index) => (
          <div key={index} className={`service-card ${service.recommended ? 'recommended' : ''}`}>
            {service.recommended && (
              <div className="recommended-badge">Recommended</div>
            )}
            <h4 className="service-title">{service.title}</h4>
            <p className="service-description">{service.description}</p>
            
            <div className="service-details">
              <div className="use-case">
                <strong>Use Case:</strong> {service.useCase}
              </div>
              
              {service.note && (
                <div className="service-note">
                  <strong>Note:</strong> {service.note}
                </div>
              )}
              
              {service.limitations.length > 0 && (
                <div className="limitations">
                  <strong>Limitations:</strong>
                  <ul>
                    {service.limitations.map((limitation, i) => (
                      <li key={i}>{limitation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button className="service-select-button">
              Select {service.name}
            </button>
          </div>
        ))}
      </div>

      <div className="decision-tree-info">
        <h4>Decision Logic</h4>
        <p>
          These recommendations are based on the VEDA dataset service decision tree. 
          The tool analyzed your file's format, spatial type, cloud optimization status, 
          and temporal characteristics to suggest the most appropriate visualization service.
        </p>
      </div>

      <div className="button-group">
        <button onClick={onReset} className="reset-button">
          Start Over
        </button>
      </div>
    </div>
  );
}

export default VisualizationOptions;

