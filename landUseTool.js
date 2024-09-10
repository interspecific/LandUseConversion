require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Sketch",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/LayerList",
  "esri/widgets/AreaMeasurement2D",
  "esri/widgets/Search",
  "esri/geometry/geometryEngine",
  "esri/widgets/Fullscreen",
  "esri/widgets/BasemapGallery",
  "esri/Basemap",
  "esri/widgets/Print"
], function(
  Map, MapView, Sketch, GraphicsLayer, FeatureLayer, ImageryLayer, LayerList, 
  AreaMeasurement2D, Search, geometryEngine, Fullscreen, BasemapGallery, Basemap, Print
) {

  // MAP AND VIEW INITIALIZATION
  const map = new Map({
    basemap: "hybrid"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-86.25, 39.77], // Center on Indiana
    zoom: 7
  });

  // =======================
  // LAYER SETUP
  // =======================

  // Graphics Layer for Drawing
  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  // Function to add layers
  function addLayersToMap() {
    // Imagery Layer
    const imageryLayer = new ImageryLayer({
      url: "https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator/Indiana_Current_Imagery/ImageServer",
      title: "Indiana Current Imagery",
      opacity: 0.9,
      visible: false,
      format: "jpgpng"
    });
    map.add(imageryLayer);

    // DEM Layer
    const demLayer = new ImageryLayer({
      url: "https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator/Indiana_2016_2020_DEM/ImageServer",
      title: "Indiana 2016-2020 DEM",
      opacity: 0.8,
      visible: false,
      format: "jpgpng"
    });
    map.add(demLayer);

    // County Boundaries Layer
    const countyBoundariesLayer = new FeatureLayer({
      url: "https://gisdata.in.gov/server/rest/services/Hosted/County_Boundaries_of_Indiana_Current/FeatureServer",
      title: "County Boundaries of Indiana",
      outFields: ["*"],
      visible: true,
      popupTemplate: {
        title: "County: {NAME}",
        content: "County FIPS Code: {FIPS_CODE}"
      }
    });
    map.add(countyBoundariesLayer);

    // Parcel Boundaries Layer
    const parcelBoundariesLayer = new FeatureLayer({
      url: "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_Current/FeatureServer",
      title: "Parcel Boundaries of Indiana",
      outFields: ["*"],
      visible: true,
      popupTemplate: {
        title: "Parcel ID: {PARCEL_ID}",
        content: "Area in acres: {SHAPE_Area}"
      }
    });
    map.add(parcelBoundariesLayer);

    // NHD Streams Layer
    const nhdStreamsLayer = new FeatureLayer({
      url: "https://gisdata.in.gov/server/rest/services/Hosted/Legacy_NHD_Rivers_Streams_etc_2008/FeatureServer/0",
      title: "NHD Streams of Indiana",
      outFields: ["*"],
      visible: false,
      popupTemplate: {
        title: "Stream: {GNIS_NAME}",
        content: "Type: {FCODE}"
      }
    });
    map.add(nhdStreamsLayer);
  }
  
  // Add layers to the map
  addLayersToMap();

// =======================
// WIDGET SETUP
// =======================

function addWidgetsToMap() {
  // =======================
  // Sketch Widget
  // =======================
  const sketch = new Sketch({
    layer: graphicsLayer,
    view: view,
    creationMode: "update"
  });
  view.ui.add(sketch, "top-right");

    // =======================
  // Move the Zoom Widget to Bottom Right
  // =======================
  view.ui.move("zoom", "bottom-right");


  // =======================
  // Search Widget
  // =======================
  const search = new Search({
    view: view
  });
  view.ui.add(search, "bottom-right");

  // =======================
  // Fullscreen Widget
  // =======================
  const fullscreen = new Fullscreen({
    view: view
  });
  view.ui.add(fullscreen, "bottom-left");

  // =======================
  // Basemap Gallery Widget (Initially hidden)
  // =======================
  const customBasemap = new Basemap({
    portalItem: {
      id: "46a87c20f09e4fc48fa3c38081e0cae6" // Custom basemap
    }
  });

  const basemapGallery = new BasemapGallery({
    view: view,
    source: [Basemap.fromId("topo-vector"), Basemap.fromId("hybrid"), customBasemap] // Standard and custom basemaps
  });

  const basemapGalleryDiv = document.createElement("div");
  basemapGalleryDiv.style.display = "none"; // Initially hidden
  basemapGallery.container = basemapGalleryDiv;
  view.ui.add(basemapGalleryDiv, "top-right");

  const basemapToggleButton = createToggleButton("🗺️ Basemaps", basemapGalleryDiv);
  view.ui.add(basemapToggleButton, "top-left");



  // =======================
  // Measurement Widget (Initially hidden)
  // =======================
  const measurement = new AreaMeasurement2D({
    view: view
  });

  const measurementDiv = document.createElement("div");
  measurementDiv.style.display = "none"; // Initially hidden
  measurement.container = measurementDiv;
  view.ui.add(measurementDiv, "top-right");

  const measurementToggleButton = createToggleButton("📏 Measure", measurementDiv);
  view.ui.add(measurementToggleButton, "top-left");

  // =======================
  // Print Widget (Initially hidden)
  // =======================
  const print = new Print({
    view: view,
    printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
  });

  const printDiv = document.createElement("div");
  printDiv.style.display = "none"; // Initially hidden
  print.container = printDiv;
  view.ui.add(printDiv, "top-right");

  const printToggleButton = createToggleButton("🖨️ Export", printDiv);
  view.ui.add(printToggleButton, "top-left");


  // =======================
  // Layer List Widget (Initially hidden)
  // =======================
  const layerList = new LayerList({
    view: view,
    container: document.createElement("div")
  });

  const layerListDiv = layerList.container;
  layerListDiv.style.display = "none"; // Initially hidden
  view.ui.add(layerListDiv, "top-left");

  const layerListToggleButton = createToggleButton("📋 Layers", layerListDiv);
  view.ui.add(layerListToggleButton, "top-left");  



}

// =======================
// Helper Function to Create Toggle Buttons
// =======================
function createToggleButton(buttonText, targetDiv) {
  const button = document.createElement("button");
  button.innerHTML = buttonText;
  button.style.padding = "10px";
  button.style.backgroundColor = "#0079c1";
  button.style.color = "white";
  button.style.border = "none";
  button.style.cursor = "pointer";

  // Toggle visibility of the target div when the button is clicked
  button.addEventListener("click", function () {
    if (targetDiv.style.display === "none") {
      targetDiv.style.display = "block"; // Show the widget
    } else {
      targetDiv.style.display = "none"; // Hide the widget
    }
  });

  return button;
}

// Add widgets to the map
addWidgetsToMap();



 








// =======================
// ENVIRONMENTAL BENEFIT CALCULATIONS
// =======================

// Sequestration, retention, and habitat scores (tons per hectare per year, cubic meters per hectare per year, etc.)

const habitatScores = {
  "tropical_forest": 100,
  "temperate_forest": 80,
  "boreal_forest": 60,
  "conventional_cropland": 10,
  "improved_cropland": 20,
  "managed_grassland": 50,
  "degraded_grassland": 5,
  "peatland": 90,
  "mangrove": 95,
  "urban_green_space": 30,
  "other_land": 0
};

const sequestrationRates = {
  "tropical_forest": 8.5,  // Average between 7-10 tons CO₂/ha/year
  "temperate_forest": 4.0,  // Average between 2-6 tons CO₂/ha/year
  "boreal_forest": 2.0,  // 1-3 tons CO₂/ha/year
  "conventional_cropland": 0.2,  // 0.1-0.3 tons CO₂/ha/year
  "improved_cropland": 1.0,  // 0.3-1.5 tons CO₂/ha/year
  "managed_grassland": 1.0,  // 0.2-1.5 tons CO₂/ha/year
  "degraded_grassland": 0.1,  // Close to zero sequestration
  "peatland": 0.035,  // 20-50 kg CO₂/ha/year (converted to tons)
  "mangrove": 5.5,  // 5-6 tons CO₂/ha/year
  "urban_green_space": 0.6,  // 0.2-1 tons CO₂/ha/year
  "other_land": 0.1  // Negligible for other land
};

const retentionRates = {
  "tropical_forest": 126800,  // liters per hectare per year
  "temperate_forest": 126800,  // Same as tropical, based on runoff data
  "boreal_forest": 126800,  // Same retention for boreal forests
  "conventional_cropland": 511000,  // High runoff, low retention
  "improved_cropland": 300000,  // Better management practices, improved retention
  "managed_grassland": 202000,  // Grasslands and meadows
  "degraded_grassland": 202000,  // Similar to managed, though potentially degraded further
  "peatland": 100000,  // Wetlands with high retention
  "mangrove": 150000,  // Very high retention
  "urban_green_space": 800000,  // Lower retention in urban areas
  "bare_soil": 50000,  // Minimal retention
  "other_land": 10000  // Very minimal retention
};


// Calculate benefits based on land use change
function calculateBenefits(currentUse, futureUse, areaInHectares) {
  const currentTotalSequestration = sequestrationRates[currentUse] * areaInHectares;
  const futureTotalSequestration = sequestrationRates[futureUse] * areaInHectares;
  const carbonSequestrationChange = futureTotalSequestration - currentTotalSequestration;

  const currentTotalRetention = retentionRates[currentUse] * areaInHectares;
  const futureTotalRetention = retentionRates[futureUse] * areaInHectares;
  const stormwaterRetentionChange = futureTotalRetention - currentTotalRetention;

  const habitatScoreChange = (habitatScores[futureUse] - habitatScores[currentUse]) * areaInHectares;

  return {
    currentTotalSequestration,
    futureTotalSequestration,
    carbonSequestrationChange,
    currentTotalRetention,
    futureTotalRetention,
    stormwaterRetentionChange,
    habitatScoreChange,
    areaInHectares
  };
}

document.getElementById("calculateBtn").addEventListener("click", function() {
  const currentLandUse = document.getElementById("currentLandUse").value;
  const futureLandUse = document.getElementById("futureLandUse").value;

  // Validate that both current and future land use have been selected
  if (!currentLandUse || !futureLandUse) {
    document.getElementById("results").innerHTML = "<p>Please select both current and future land use types.</p>";
    return;
  }

  // Validate that a polygon has been drawn
  if (graphicsLayer.graphics.length === 0) {
    document.getElementById("results").innerHTML = "<p>Please draw a polygon before calculating.</p>";
    return;
  }

  // Get the polygon geometry
  const polygon = graphicsLayer.graphics.getItemAt(0).geometry;

  // Calculate the area in square meters and convert to hectares
  const areaInSquareMeters = geometryEngine.geodesicArea(polygon, "square-meters");
  if (areaInSquareMeters <= 0) {
    document.getElementById("results").innerHTML = "<p>Invalid area. Please try again.</p>";
    return;
  }

  const areaInHectares = areaInSquareMeters / 10000; // Convert square meters to hectares

  // Calculate the benefits
  const benefits = calculateBenefits(currentLandUse, futureLandUse, areaInHectares);

  // Display the results
  document.getElementById("results").innerHTML = `
    <h4>Environmental Change:</h4>
    <p><strong>Area of the selected site:</strong> ${benefits.areaInHectares.toFixed(2)} hectares.</p>
    <h5><strong>Carbon Sequestration:</strong></h5>
    <ul>
      <li><strong>Total for Current Land Use:</strong> ${benefits.currentTotalSequestration.toFixed(2)} tons of carbon.</li>
      <li><strong>Total for Future Land Use:</strong> ${benefits.futureTotalSequestration.toFixed(2)} tons of carbon.</li>
      <li><strong>Difference:</strong> ${Math.abs(benefits.carbonSequestrationChange.toFixed(2))} tons of carbon will ${benefits.carbonSequestrationChange >= 0 ? "be sequestered" : "not be sequestered"}.</li>
    </ul>
    <h5><strong>Stormwater Retention:</strong></h5>
    <ul>
      <li><strong>Total for Current Land Use:</strong> ${benefits.currentTotalRetention.toFixed(2)} cubic meters of water.</li>
      <li><strong>Total for Future Land Use:</strong> ${benefits.futureTotalRetention.toFixed(2)} cubic meters of water.</li>
      <li><strong>Difference:</strong> ${Math.abs(benefits.stormwaterRetentionChange.toFixed(2))} cubic meters of water will ${benefits.stormwaterRetentionChange >= 0 ? "be retained" : "not be retained"}.</li>
    </ul>
  `;
});

// Function to calculate current carbon sequestration and stormwater retention values
function quantifyCurrentValues(currentUse, areaInHectares) {
  const currentTotalSequestration = sequestrationRates[currentUse] * areaInHectares;
  const currentTotalRetention = retentionRates[currentUse] * areaInHectares;

  return {
    currentTotalSequestration,
    currentTotalRetention,
    areaInHectares
  };
}

// Event listener for the new "Quantify Current Values" button
document.getElementById("quantifyBtn").addEventListener("click", function() {
  const currentLandUse = document.getElementById("currentLandUse").value;

  // Get the polygon geometry from the graphics layer
  const polygon = graphicsLayer.graphics.getItemAt(0).geometry;

  // Calculate the area in square meters and convert to hectares
  const areaInSquareMeters = geometryEngine.geodesicArea(polygon, "square-meters");
  const areaInHectares = areaInSquareMeters / 10000; // Convert square meters to hectares

  // Calculate the current values
  const values = quantifyCurrentValues(currentLandUse, areaInHectares);

  // Display the results
  document.getElementById("results").innerHTML = `
    <h4>Current Land Use Values:</h4>
    <p><strong>Area of the selected site:</strong> ${values.areaInHectares.toFixed(2)} hectares.</p>

    <h5><strong>Carbon Sequestration:</strong></h5>
    <ul>
      <li><strong>Total for Current Land Use:</strong> ${values.currentTotalSequestration.toFixed(2)} tons of carbon.</li>
    </ul>

    <h5><strong>Stormwater Retention:</strong></h5>
    <ul>
      <li><strong>Total for Current Land Use:</strong> ${values.currentTotalRetention.toFixed(2)} cubic meters.</li>
    </ul>
  `;
});



});