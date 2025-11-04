# Geospatial File Decision Tool

## Overview
A React SPA that helps users determine the best VEDA visualization service for their geospatial files.

## Current Features

### Step 1: File Input
- **URL Input**: Provide an S3/HTTPS URL or CMR concept URL
- Supported formats: COG, NetCDF, GeoParquet, GRIB, HDF5
- **CMR Support**: Detects and handles Earthdata CMR concept URLs
- Input validation for URLs (must start with `s3://`, `http://`, or `https://`)
- Examples and hints for both direct files and CMR concepts

### Step 2: File Validation
- **Real COG validation** using the OpenVEDA API for .tif/.tiff files
- **CMR compatibility checking** using AWS Lambda endpoint
  - Parses concept ID from CMR URLs
  - Checks compatibility via `https://v4jec6i5c0.execute-api.us-west-2.amazonaws.com/compatibility`
  - Determines file format from `example_assets` in response
- S3 accessibility check (simulated for direct files)
- File format detection based on extension
- Loading states and progress indicators
- Error handling for failed validations

### Step 3: Visualization Options
- Displays file metadata (format, type, cloud optimization status)
- Shows Concept ID and source for CMR datasets
- Recommends appropriate visualization services based on:
  - **titiler-cmr**: ONLY option for CMR/Earthdata Cloud datasets
  - **tipg**: For vector data (points, lines, polygons)
  - **titiler-pgstac**: For COG datasets (includes API visualization endpoint)
  - **titiler-multidim**: For multidimensional gridded data (NetCDF, GRIB, HDF5)
- **COG API Visualization**: For direct COG files, shows how to use the [OpenVEDA raster API](https://openveda.cloud/api/raster/)
  - Tile endpoint pattern: `cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url={s3url}`
  - Example tile URLs generated automatically
  - Usage instructions for web mapping libraries
- Shows limitations and use cases for each service
- Decision logic based on the VEDA decision tree
- JSON viewer for validation details

## Architecture

```
src/
├── components/
│   ├── Wizard.js              # Main wizard orchestrator
│   ├── Wizard.css
│   ├── FileInput.js           # Step 1: File upload/S3 input
│   ├── FileInput.css
│   ├── FileValidation.js      # Step 2: Validation process
│   ├── FileValidation.css
│   ├── VisualizationOptions.js # Step 3: Service recommendations
│   └── VisualizationOptions.css
├── App.js                     # Root component
└── App.css                    # Global styles
```

## Next Steps for Enhancement

### Validation Enhancements
1. **S3 Accessibility Check**
   - Implement actual S3 bucket access validation (currently simulated)
   - Check permissions and file existence
   - Handle authentication/credentials

2. **Additional Format Validation**
   - ✅ COG validation (implemented with OpenVEDA API)
   - NetCDF validation using dedicated API or library
   - GeoParquet validation 
   - GRIB validation

3. **Metadata Extraction**
   - Extract actual metadata from files (CRS, bounds, bands, time dimensions)
   - Read CF conventions for NetCDF
   - Parse GeoTIFF tags

### API Integration
- Connect to VEDA services (titiler-pgstac, titiler-multidim, etc.)
- Generate preview URLs
- Create interactive map previews

### Enhanced Decision Logic
- Implement the full decision tree from the images
- Check for Earthdata Cloud location
- Detect CMR compatibility
- Identify hierarchical/grouped structures
- Handle edge cases and "quirky" datasets

### UI Enhancements
- File upload progress bars
- Better error handling and messages
- Preview thumbnails
- Interactive map for visualization
- Export recommendations as JSON/config

### Testing
- Add unit tests for validation logic
- Integration tests for file parsing
- E2E tests for wizard flow

## Running the App

```bash
npm start       # Development server (http://localhost:3000)
npm test        # Run tests
npm run build   # Production build
```

## Deployment to GitHub Pages

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"

2. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment"
   git push origin main
   ```

3. **Wait for the deployment:**
   - The GitHub Action will automatically run
   - Check the "Actions" tab to see the deployment progress
   - Once complete, your app will be available at the GitHub Pages URL

### How it Works

The deployment workflow (`.github/workflows/deploy.yml`) is based on the [spatial-access-measures deployment workflow](https://github.com/developmentseed/spatial-access-measures/blob/main/.github/workflows/deploy.yml) and:

- Triggers on push to the `main` branch
- Installs dependencies with `npm ci`
- Builds the React app with `npm run build`
- Uploads the `build` folder as a GitHub Pages artifact
- Deploys to GitHub Pages

The `homepage` field in `package.json` is set to `"."` for relative path support, making it work both locally and on GitHub Pages.

## Technologies
- React 18
- Create React App
- CSS3 (no external UI library for now)
- GitHub Actions for CI/CD

