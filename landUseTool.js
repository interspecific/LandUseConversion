require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/Sketch",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageryLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Measurement",
  "esri/widgets/Search"
], function(Map, MapView, Sketch, GraphicsLayer, FeatureLayer, ImageryLayer, LayerList, Measurement, Search) {

  // Create a map and view
  const map = new Map({
    basemap: "hybrid"
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-86.25, 39.77], // Center on Indiana
    zoom: 7
  });

  // Create and add the Measurement widget
  const measurement = new Measurement({
    view: view
  });
  view.ui.add(measurement, "bottom-right");

    // Create a Sketch widget for drawing polygons
  const sketch = new Sketch({
    layer: graphicsLayer,
    view: view,
    creationMode: "update"
  });

  // Add the Sketch widget to the top-right corner
  view.ui.add(sketch, {
    position: "top-right",
    index: 0 // Lower index so it appears above the Search widget
  });

  // Create the Search widget
  const search = new Search({
    view: view
  });

  // Add the Search widget below the Sketch widget
  view.ui.add(search, {
    position: "top-right",
    index: 1 // Higher index so it appears below the Sketch widget
  });

});


  // Add a GraphicsLayer for drawing
  const graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

// Add a Layer List widget to control the visibility of layers
const layerList = new LayerList({
  view: view,
  container: document.createElement("div") // Create a container for the widget
});

// Add the container to the view's UI, applying a custom CSS class
layerList.container.classList.add("custom-layerlist"); // Add a custom CSS class
view.ui.add(layerList.container, {
  position: "top-left"
});

  // Add various layers with visibility set to false
  const imageryLayer = new ImageryLayer({
    url: "https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator/Indiana_Current_Imagery/ImageServer",
    title: "Indiana Current Imagery",
    opacity: 0.9,
    visible: true,
    format: "jpgpng"
  });
  map.add(imageryLayer);

  const demLayer = new ImageryLayer({
    url: "https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator/Indiana_2016_2020_DEM/ImageServer",
    title: "Indiana 2016-2020 DEM",
    opacity: 0.5,
    visible: false,
    format: "jpgpng"
  });
  map.add(demLayer);

  const countyBoundariesLayer = new FeatureLayer({
    url: "https://gisdata.in.gov/server/rest/services/Hosted/County_Boundaries_of_Indiana_Current/FeatureServer",
    title: "County Boundaries of Indiana",
    outFields: ["*"],
    visible: false,
    popupTemplate: {
      title: "County: {NAME}",
      content: "County FIPS Code: {FIPS_CODE}"
    }
  });
  map.add(countyBoundariesLayer);

  const parcelBoundariesLayer = new FeatureLayer({
    url: "https://gisdata.in.gov/server/rest/services/Hosted/Parcel_Boundaries_of_Indiana_Current/FeatureServer",
    title: "Parcel Boundaries of Indiana",
    outFields: ["*"],
    visible: false,
    popupTemplate: {
      title: "Parcel ID: {PARCEL_ID}",
      content: "Owner: {OWNER_NAME}"
    }
  });
  map.add(parcelBoundariesLayer);

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


  // Sequestration rates (tons per hectare per year)
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

  // Stormwater retention rates (cubic meters per hectare per year)
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

  // Habitat scores (arbitrary units per hectare)
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

  // Function to calculate benefits based on land use change
  function calculateBenefits(currentUse, futureUse) {
    const carbonSequestrationChange = sequestrationRates[futureUse] - sequestrationRates[currentUse];
    const stormwaterRetentionChange = retentionRates[futureUse] - retentionRates[currentUse];
    const habitatScoreChange = habitatScores[futureUse] - habitatScores[currentUse];

    return {
      carbonSequestrationChange,
      stormwaterRetentionChange,
      habitatScoreChange
    };
  }

  // Event listener for the "Calculate Benefits" button
  document.getElementById("calculateBtn").addEventListener("click", function() {
    const currentLandUse = document.getElementById("currentLandUse").value;
    const futureLandUse = document.getElementById("futureLandUse").value;
    const benefits = calculateBenefits(currentLandUse, futureLandUse);

    // Determine whether the changes are increases or decreases
    const carbonChangeType = benefits.carbonSequestrationChange >= 0 ? "sequestered" : "released";
    const stormwaterChangeType = benefits.stormwaterRetentionChange >= 0 ? "retained" : "released as";
    const habitatChangeType = benefits.habitatScoreChange >= 0 ? "improve" : "degrade";

    // Display the results
    document.getElementById("results").innerHTML = `
      <h4>Environmental Benefits:</h4>
      <p>By converting the existing "${currentLandUse}" land use to "${futureLandUse}" land use, approximately:</p>
      <ul>
        <li>${Math.abs(benefits.carbonSequestrationChange.toFixed(2))} tons of carbon will be ${carbonChangeType}.</li>
        <li>${Math.abs(benefits.stormwaterRetentionChange.toFixed(2))} cubic meters of water will be ${stormwaterChangeType}.</li>
        <li>The habitat quality will ${habitatChangeType} by ${Math.abs(benefits.habitatScoreChange.toFixed(2))} units.</li>
      </ul>
    `;

    console.log("Results displayed.");
  });
});
