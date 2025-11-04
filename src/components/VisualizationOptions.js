import React from 'react';
import './VisualizationOptions.css';

function VisualizationOptions({ fileData, validationResult, onReset }) {
  const [selectedService, setSelectedService] = React.useState(null);

  const handleServiceSelect = (serviceName) => {
    setSelectedService(selectedService === serviceName ? null : serviceName);
  };

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
        note: `This dataset is from Earthdata Cloud (Concept ID: ${validationResult.conceptId}). Titiler-CMR is the only compatible service for CMR datasets.`,
        apiEndpoint: {
          base: 'https://staging.openveda.cloud/api/titiler-cmr/',
          pattern: 'tiles/WebMercatorQuad/{z}/{x}/{y}.png?concept_id={concept_id}',
          conceptId: validationResult.conceptId,
          docsUrl: 'https://staging.openveda.cloud/api/titiler-cmr/api.html',
          isCMR: true
        }
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
        note: 'Migration and metadata generation may be a pre-requisite',
        apiEndpoint: format === 'COG' && !isCMR ? {
          base: 'https://openveda.cloud/api/raster/',
          pattern: 'cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url={url}',
          exampleUrl: fileData.s3Url
        } : null
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
            </div>

            <button 
              className="service-select-button"
              onClick={() => handleServiceSelect(service.name)}
            >
              Select {service.name}
            </button>

            {selectedService === service.name && service.apiEndpoint && (
              <div className="api-endpoint expanded">
                <div className="api-header">
                  <strong>🌐 Visualization API:</strong>
                  <a 
                    href={service.apiEndpoint.docsUrl || 'https://openveda.cloud/api/raster/docs'}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="api-docs-link"
                  >
                    📖 View API Docs
                  </a>
                </div>
                <p className="api-description">
                  {service.apiEndpoint.isCMR 
                    ? 'You can visualize this CMR dataset using the Titiler-CMR API:'
                    : 'You can visualize this COG using the OpenVEDA raster API:'
                  }
                </p>
                <div className="api-url-box">
                  <code className="api-pattern">
                    {service.apiEndpoint.base}
                    <br />
                    {service.apiEndpoint.pattern}
                  </code>
                </div>
                <p className="api-example-label">Example tile URL for your dataset:</p>
                <div className="api-example-box">
                  <code className="api-example">
                    {service.apiEndpoint.isCMR
                      ? `${service.apiEndpoint.base}tiles/WebMercatorQuad/{z}/{x}/{y}.png?concept_id=${service.apiEndpoint.conceptId}`
                      : `${service.apiEndpoint.base}cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodeURIComponent(service.apiEndpoint.exampleUrl)}`
                    }
                  </code>
                </div>
                <p className="api-hint">
                  Replace &#123;z&#125;, &#123;x&#125;, &#123;y&#125; with tile coordinates for web mapping libraries (Leaflet, Mapbox, OpenLayers, etc.)
                </p>
              </div>
            )}
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

