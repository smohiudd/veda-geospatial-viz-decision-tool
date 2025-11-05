# Geospatial File Decision Tool

A React SPA that helps users determine the best VEDA visualization service for their geospatial datasets. Provide an S3/HTTPS link to get recommendations for services like titiler-pgstac, titiler-multidim, titiler-cmr, or tipg.

## Features

- **Step 1: File Input** - Provide S3/HTTPS URLs to geospatial files or CMR concept URLs
- **Step 2: Validation** - Real-time validation using multiple APIs
  - COG validation via OpenVEDA API
  - CMR compatibility checking via AWS Lambda endpoint
- **Step 3: Visualization Options** - Smart recommendations based on file characteristics
  - For COG files, includes ready-to-use [OpenVEDA raster API](https://openveda.cloud/api/raster/) tile URLs
  - For CMR datasets, recommends titiler-cmr exclusively

> **Note:** Supports direct file URLs and CMR concept URLs from [Earthdata](https://cmr.earthdata.nasa.gov).


## Running the App

```bash
npm start       # Development server (http://localhost:3000)
npm test        # Run tests
npm run build   # Production build
```

