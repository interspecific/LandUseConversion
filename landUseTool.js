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
  "tropical_forest": 11.0,  // Tropical Forest (IPCC: 3.1-18 tons CO₂/ha/year)
  "temperate_forest": 4.0,  // Temperate Forest (IPCC: 0.5-8 tons CO₂/ha/year)
  "boreal_forest": 1.5,  // Boreal Forest (IPCC: 0.1-2.1 tons CO₂/ha/year)
  "conventional_cropland": 1.0,
  "improved_cropland": 2.0,
  "managed_grassland": 1.5,
  "degraded_grassland": 0.5,
  "peatland": 10.0,
  "mangrove": 8.0,
  "urban_green_space": 0.5,
  "improved_green_infrastructure": 0.3,
  "settlements": 0.2,
  "other_land": 0.1
};

const infiltrationRates = {
  "tropical_forest": 80,  // Tropical forest infiltration rate
  "temperate_forest": 75,  // Temperate forest infiltration rate
  "boreal_forest": 70,  // Boreal forest infiltration rate
  "conventional_cropland": 40,
  "improved_cropland": 50,
  "managed_grassland": 50,
  "degraded_grassland": 30,
  "peatland": 85,
  "mangrove": 85,
  "urban_green_space": 10,
  "improved_green_infrastructure": 15,
  "settlements": 7,
  "other_land": 30
};

const runoffValues = {
  "tropical_forest": 0.3,  // Tropical forest runoff rate
  "temperate_forest": 0.4,  // Temperate forest runoff rate
  "boreal_forest": 0.5,  // Boreal forest runoff rate
  "conventional_cropland": 1.5,
  "improved_cropland": 1.2,
  "managed_grassland": 0.6,
  "degraded_grassland": 1.0,
  "peatland": 0.2,
  "mangrove": 0.2,
  "urban_green_space": 0.5,
  "improved_green_infrastructure": 0.3,
  "settlements": 3.8,
  "other_land": 1.0
};

  
  
  
  function calculateBenefits(currentUse, futureUse, areaInHectares) {
    // Carbon Sequestration Calculations
    const currentTotalSequestration = (sequestrationRates[currentUse] || 0) * areaInHectares;
    const futureTotalSequestration = (sequestrationRates[futureUse] || 0) * areaInHectares;
    const carbonSequestrationChange = futureTotalSequestration - currentTotalSequestration;

    // Infiltration Percentage Calculations
    const currentInfiltration = infiltrationRates[currentUse] || 0;
    const futureInfiltration = infiltrationRates[futureUse] || 0;
    const infiltrationChange = futureInfiltration - currentInfiltration;

    // Surface Runoff Calculations
    const currentRunoff = runoffValues[currentUse] || 0;
    const futureRunoff = runoffValues[futureUse] || 0;
    const runoffChange = futureRunoff - currentRunoff;

    // Return the changes
    return {
        currentTotalSequestration,
        futureTotalSequestration,
        carbonSequestrationChange,
        currentInfiltration,
        futureInfiltration,
        infiltrationChange,
        currentRunoff,
        futureRunoff,
        runoffChange,
        areaInHectares
    };
}

  






// Event listener for calculating benefits
document.getElementById("calculateBtn").addEventListener("click", function() {
    const currentLandUse = document.getElementById("currentLandUse").value;
    const futureLandUse = document.getElementById("futureLandUse").value;
  
    // Log values to verify
    console.log("Current Land Use: ", currentLandUse);
    console.log("Future Land Use: ", futureLandUse);
  
    // Get the polygon geometry from the graphics layer
    const polygon = graphicsLayer.graphics.getItemAt(0).geometry;
  
    // Calculate the area in square meters and convert to hectares
    const areaInSquareMeters = geometryEngine.geodesicArea(polygon, "square-meters");
    const areaInHectares = areaInSquareMeters / 10000; // Convert square meters to hectares
  
    // Log area to verify
    console.log("Area in Hectares: ", areaInHectares);
  
    // Calculate the benefits
    const benefits = calculateBenefits(currentLandUse, futureLandUse, areaInHectares);
  
    // Log the benefits to check the values
    console.log("Benefits: ", benefits);
  
    // Display the results including the polygon area
    document.getElementById("results").innerHTML = `
      <h4>Results:</h4>
      <p><strong>Area of the selected site:</strong> ${benefits.areaInHectares.toFixed(2)} hectares.</p>
  
      <h5><strong>Carbon Sequestration (metric tons per hectare per year):</strong></h5>
      <ul>
        <li><strong>Total for Current Land Use:</strong> ${benefits.currentTotalSequestration ? benefits.currentTotalSequestration.toFixed(2) : 'N/A'} tons of carbon.</li>
        <li><strong>Total for Future Land Use:</strong> ${benefits.futureTotalSequestration ? benefits.futureTotalSequestration.toFixed(2) : 'N/A'} tons of carbon.</li>
        <li><strong>Difference:</strong> ${benefits.carbonSequestrationChange ? Math.abs(benefits.carbonSequestrationChange.toFixed(2)) : 'N/A'} tons of carbon will ${benefits.carbonSequestrationChange >= 0 ? "be sequestered." : "not be sequestered in vegetation or soil ecosystems."}</li>
      </ul>
  
      <h5><strong>Water Infiltration Percentage:</strong></h5>
      <ul>
        <li><strong>Current Land Use Infiltration:</strong> ${benefits.currentInfiltration ? benefits.currentInfiltration : 'N/A'}%</li>
        <li><strong>Future Land Use Infiltration:</strong> ${benefits.futureInfiltration ? benefits.futureInfiltration : 'N/A'}%</li>
        <li><strong>Difference:</strong> ${benefits.infiltrationChange ? Math.abs(benefits.infiltrationChange.toFixed(2)) : 'N/A'}% infiltration will ${benefits.infiltrationChange >= 0 ? "increase." : "decrease."}</li>
      </ul>
  
      <h5><strong>Surface Runoff:</strong></h5>
      <ul>
        <li><strong>Current Land Use Runoff:</strong> ${benefits.currentRunoff ? benefits.currentRunoff : 'N/A'} inches of runoff from a 4-inch rainfall.</li>
        <li><strong>Future Land Use Runoff:</strong> ${benefits.futureRunoff ? benefits.futureRunoff : 'N/A'} inches of runoff from a 4-inch rainfall.</li>
        <li><strong>Difference:</strong> ${benefits.runoffChange ? Math.abs(benefits.runoffChange.toFixed(2)) : 'N/A'} inches.</li>
      </ul>
    `;
  });

});
  




















  

// // Function to calculate current carbon sequestration and stormwater retention values
// function quantifyCurrentValues(currentUse, areaInHectares) {
//   const currentTotalSequestration = sequestrationRates[currentUse] * areaInHectares;
//   const currentTotalRetention = retentionRates[currentUse] * areaInHectares;

//   return {
//     currentTotalSequestration,
//     currentTotalRetention,
//     areaInHectares
//   };
// }

//     // Event listener for the new "Quantify Current Values" button
//     document.getElementById("quantifyBtn").addEventListener("click", function() {
//       const currentLandUse = document.getElementById("currentLandUse").value;

//       // Get the polygon geometry from the graphics layer
//       const polygon = graphicsLayer.graphics.getItemAt(0).geometry;

//       // Calculate the area in square meters and convert to hectares
//       const areaInSquareMeters = geometryEngine.geodesicArea(polygon, "square-meters");
//       const areaInHectares = areaInSquareMeters / 10000; // Convert square meters to hectares

//       // Calculate the current values
//       const values = quantifyCurrentValues(currentLandUse, areaInHectares);

//       // Display the results
//       document.getElementById("results").innerHTML = `
//         <h4>Current Land Use Values:</h4>
//         <p><strong>Area of the selected site:</strong> ${values.areaInHectares.toFixed(2)} hectares.</p>

//         <h5><strong>Carbon Sequestration:</strong></h5>
//         <ul>
//           <li><strong>Total for Current Land Use:</strong> ${values.currentTotalSequestration.toFixed(2)} tons of carbon.</li>
//         </ul>

//         <h5><strong>Stormwater Retention:</strong></h5>
//         <ul>
//           <li><strong>Total for Current Land Use:</strong> ${values.currentTotalRetention.toFixed(2)} cubic meters.</li>
//         </ul>
//       `;
//     });


// });

// document.getElementById("exportMapBtn").addEventListener("click", function() {
//   // Load jsPDF and html2canvas dynamically
//   const loadLibraries = () => {
//       const jsPDFScript = document.createElement("script");
//       jsPDFScript.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
//       jsPDFScript.onload = () => {
//           const html2canvasScript = document.createElement("script");
//           html2canvasScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js";
//           html2canvasScript.onload = exportMapToPDF;
//           document.body.appendChild(html2canvasScript);
//       };
//       document.body.appendChild(jsPDFScript);
//   };

//   // Function to export the map as a PDF
//   function exportMapToPDF() {
//       html2canvas(document.querySelector("#viewDiv")).then(function(canvas) {
//           const { jsPDF } = window.jspdf;
//           const doc = new jsPDF();
          
//           // Add the image of the map to the PDF
//           const imgData = canvas.toDataURL("image/png");
//           doc.text("Map Snapshot", 10, 10);
//           doc.addImage(imgData, "PNG", 15, 40, 180, 160);
          
//           // Save the PDF
//           doc.save("Map_Snapshot.pdf");
//       });
//   }

//   // Trigger the library loading
//   loadLibraries();
// });
