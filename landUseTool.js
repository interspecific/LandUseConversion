require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Sketch",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Measurement",
  "esri/widgets/Search",
  "esri/geometry/geometryEngine",
  "esri/widgets/Fullscreen",
  "esri/widgets/BasemapGallery",
  "esri/Basemap"
], function(Map, MapView, Sketch, GraphicsLayer, FeatureLayer, ImageryLayer, LayerList, Measurement, Search, geometryEngine, Fullscreen, BasemapGallery, Basemap) {

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
  // Sketch Widget for drawing polygons
  const sketch = new Sketch({
    layer: graphicsLayer,
    view: view,
    creationMode: "update"
  });
  view.ui.add(sketch, "top-right");

  // Move the default zoom widget to the bottom-right position
  view.ui.move("zoom", "bottom-right");


  // Search Widget
  const search = new Search({
    view: view
  });
  view.ui.add(search, "bottom-right");

  // Fullscreen Widget
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
    source: [Basemap.fromId("topo-vector"), Basemap.fromId("hybrid"), customBasemap] // Use standard and custom basemaps
  });

  // Create a container for the Basemap Gallery and set initial visibility to none
  const basemapGalleryDiv = document.createElement("div");
  basemapGalleryDiv.style.display = "none"; // Initially hidden
  basemapGallery.container = basemapGalleryDiv;
  view.ui.add(basemapGalleryDiv, {
    position: "top-right"
  });

  // Add a button to toggle the visibility of the Basemap Gallery
  const basemapToggleButton = document.createElement("button");
  basemapToggleButton.innerHTML = "🗺️ Basemaps";
  basemapToggleButton.style.padding = "10px";
  basemapToggleButton.style.backgroundColor = "#0079c1";
  basemapToggleButton.style.color = "white";
  basemapToggleButton.style.border = "none";
  basemapToggleButton.style.cursor = "pointer";

  // Toggle the visibility of the Basemap Gallery when the button is clicked
  basemapToggleButton.addEventListener("click", function() {
    if (basemapGalleryDiv.style.display === "none") {
      basemapGalleryDiv.style.display = "block"; // Show the Basemap Gallery
    } else {
      basemapGalleryDiv.style.display = "none"; // Hide the Basemap Gallery
    }
  });

  // Add the Basemap toggle button to the view
  view.ui.add(basemapToggleButton, "top-left");

  // =======================
  // Layer List Widget (Initially hidden)
  // =======================
  const layerList = new LayerList({
    view: view,
    container: document.createElement("div")
  });
  const layerListDiv = layerList.container;
  layerListDiv.style.display = "none"; // Initially hidden
  layerList.container = layerListDiv;
  view.ui.add(layerListDiv, {
    position: "top-left"
  });

  // Add a button to toggle the visibility of the Layer List
  const layerListToggleButton = document.createElement("button");
  layerListToggleButton.innerHTML = "📋 Layers";
  layerListToggleButton.style.padding = "10px";
  layerListToggleButton.style.backgroundColor = "#0079c1";
  layerListToggleButton.style.color = "white";
  layerListToggleButton.style.border = "none";
  layerListToggleButton.style.cursor = "pointer";

  // Toggle the visibility of the Layer List when the button is clicked
  layerListToggleButton.addEventListener("click", function() {
    if (layerListDiv.style.display === "none") {
      layerListDiv.style.display = "block"; // Show the Layer List
    } else {
      layerListDiv.style.display = "none"; // Hide the Layer List
    }
  });

  // Add the Layer List toggle button to the view
  view.ui.add(layerListToggleButton, "top-left");
}

// Add widgets to the map
addWidgetsToMap();

 

  // =======================
  // ENVIRONMENTAL BENEFIT CALCULATIONS
  // =======================

  // Sequestration, retention, and habitat scores (tons per hectare per year, cubic meters per hectare per year, etc.)
  const sequestrationRates = {
    "agriculture": 0.5,
    "forest": 3.0,
    "urban": 0.8,
    "wetlands": 2.0,
    "invasivePlants": 0.3,
    "grassLawn": 0.2,
    "bareSoil": 0.0,
    "garden": 0.5,
    "prairieMeadow": 2.5,
    "reforestation": 3.0
  };

  const retentionRates = {
    "agriculture": 300,
    "forest": 1000,
    "urban": 500,
    "wetlands": 1500,
    "invasivePlants": 200,
    "grassLawn": 400,
    "bareSoil": 50,
    "garden": 600,
    "prairieMeadow": 1200,
    "reforestation": 1200
  };

  const habitatScores = {
    "agriculture": 5,
    "forest": 100,
    "urban": 20,
    "wetlands": 90,
    "invasivePlants": 10,
    "grassLawn": 15,
    "bareSoil": 0,
    "garden": 30,
    "prairieMeadow": 80,
    "reforestation": 100
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

  // Event listener for calculating benefits
  document.getElementById("calculateBtn").addEventListener("click", function() {
    const currentLandUse = document.getElementById("currentLandUse").value;
    const futureLandUse = document.getElementById("futureLandUse").value;

    // Get the polygon geometry from the graphics layer
    const polygon = graphicsLayer.graphics.getItemAt(0).geometry;

    // Calculate the area in square meters and convert to hectares
    const areaInSquareMeters = geometryEngine.geodesicArea(polygon, "square-meters");
    const areaInHectares = areaInSquareMeters / 10000; // Convert square meters to hectares

    // Calculate the benefits
    const benefits = calculateBenefits(currentLandUse, futureLandUse, areaInHectares);

    // Display the results including the polygon area
    document.getElementById("results").innerHTML = `
      <h4>Environmental Benefits:</h4>
      <p><strong>Area of the selected site:</strong> ${benefits.areaInHectares.toFixed(2)} hectares.</p>

      <h5><strong>Carbon Sequestration:</strong></h5>
      <ul>
        <li><strong>Total for Current Land Use:</strong> ${benefits.currentTotalSequestration.toFixed(2)} tons of carbon.</li>
        <li><strong>Total for Future Land Use:</strong> ${benefits.futureTotalSequestration.toFixed(2)} tons of carbon.</li>
        <li><strong>Difference:</strong> ${Math.abs(benefits.carbonSequestrationChange.toFixed(2))} tons of carbon will be ${benefits.carbonSequestrationChange >= 0 ? "sequestered" : "released"}.</li>
      </ul>

      <h5><strong>Stormwater Retention:</strong></h5>
      <ul>
        <li><strong>Total for Current Land Use:</strong> ${benefits.currentTotalRetention.toFixed(2)} cubic meters.</li>
        <li><strong>Total for Future Land Use:</strong> ${benefits.futureTotalRetention.toFixed(2)} cubic meters.</li>
        <li><strong>Difference:</strong> ${Math.abs(benefits.stormwaterRetentionChange.toFixed(2))} cubic meters will be ${benefits.stormwaterRetentionChange >= 0 ? "retained" : "released"}.</li>
      </ul>
    `;
  });

});
