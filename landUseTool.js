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
        <li><strong>Difference:</strong> ${Math.abs(benefits.carbonSequestrationChange.toFixed(2))} tons of carbon will ${benefits.carbonSequestrationChange >= 0 ? "be sequestered. Carbon Dioxide that has been accumulating in the atmosphere in high concentrations due to human interference with the carbon cycle will now be utilized by plants and will be turned into energy for the surrounding ecosystems." : "not be sequestered in vegetation or soil ecosystems and will remain in the atmosphere."}.</li>
      </ul>

      <h5><strong>Stormwater Retention:</strong></h5>
      <ul>
        <li><strong>Total for Current Land Use:</strong> ${benefits.currentTotalRetention.toFixed(2)} cubic meters of water.</li>
        <li><strong>Total for Future Land Use:</strong> ${benefits.futureTotalRetention.toFixed(2)} cubic meters of water.</li>
        <li><strong>Difference:</strong> ${Math.abs(benefits.stormwaterRetentionChange.toFixed(2))} cubic meters of water will  ${benefits.stormwaterRetentionChange >= 0 ? "be retained. this quantity of water will not contribute to flooding or erosion. This water will be utilized by plants and wildlife and will be captured in place to percolate into the soil." : "not be retained, and will be displaced as surface runoff"}.</li>
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

document.getElementById("exportMapBtn").addEventListener("click", function() {
  // Load jsPDF and html2canvas dynamically
  const loadLibraries = () => {
      const jsPDFScript = document.createElement("script");
      jsPDFScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      jsPDFScript.onload = () => {
          const html2canvasScript = document.createElement("script");
          html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js";
          html2canvasScript.onload = exportMapToPDF;
          document.body.appendChild(html2canvasScript);
      };
      document.body.appendChild(jsPDFScript);
  };

  // Function to export the map as a PDF
  function exportMapToPDF() {
      html2canvas(document.querySelector("#viewDiv")).then(function(canvas) {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          
          // Add the image of the map to the PDF
          const imgData = canvas.toDataURL("image/png");
          doc.text("Map Snapshot", 10, 10);
          doc.addImage(imgData, "PNG", 15, 40, 180, 160);
          
          // Save the PDF
          doc.save("Map_Snapshot.pdf");
      });
  }

  // Trigger the library loading
  loadLibraries();
});
