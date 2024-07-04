/*
 * Data Visualization - Framework
 * Copyright (C) University of Passau
 *   Faculty of Computer Science and Mathematics
 *   Chair of Cognitive sensor systems
 * Maintenance:
 *   2024, Alexander Gall <alexander.gall@uni-passau.de>
 *
 * All rights reserved.
 */

// TODO: File for Part 2
// TODO: You can edit this file as you wish - add new methods, variables etc. or change/delete existing ones.

// TODO: use descriptive names for variables
let chart1, chart2, chart3, chart4;
let countries = ["Nigeria", "Ghana"];
let selectedYear;
let drawchart, worldsoninfo, dashboard_data;

document.addEventListener("DOMContentLoaded", function () {
  // Select chart elements from the DOM using D3
  chart1 = d3.select("#chart1"); // Adjust with your actual selector
  chart2 = d3.select("#chart2"); // Adjust with your actual selector
  chart3 = d3.select("#chart3"); // Adjust with your actual selector
  chart4 = d3.select("#chart4"); // Adjust with your actual selector

  // Call initDashboard function after selecting elements
  initDashboard(data);
});

function initDashboard(_data) {
  dashboard_data = data;
  // TODO: Initialize the environment (SVG, etc.) and call the needed methods
  //   countries = ["Nigeria", "Ghana"];
  selectedYear = 2000;

  drawchart = new DrawChart(
    _data,
    countries,
    selectedYear,
    chart1,
    chart2,
    chart3,
    chart4
  );

  d3.json(
    "https://raw.githubusercontent.com/d3/d3.github.com/master/world-110m.v1.json"
  )
    .then(function (info) {
      console.log("World map data", info);
      worldjsoninfo = info;
      drawchart.renderMap(info);
    })
    .catch(function (error) {
      console.error("Error loading world map data:", error);
    });

  // Populate year filter dropdown
  drawchart.populateFilterWithYear();

  // Initial rendering of charts
  drawchart.createBarChart();
  drawchart.createLineChart();
  drawchart.createCorrelationHeatMap();

  // Attach the update function to the year filter dropdown
  document.getElementById("yearFilter").addEventListener("change", update);
}

function update() {
  // Get the new selected year

  selectedYear = document.getElementById("yearFilter").value;
  console.log("Year selected:", selectedYear);

  // Update the DrawChart instance with the new year
  drawchart.setSelectedYear(selectedYear);

  // Clear the existing charts if needed
  drawchart.clearChart();

  // Redraw the charts with the new data
  drawchart.createBarChart();
  drawchart.createLineChart();
  drawchart.createCorrelationHeatMap();
  drawchart.renderMap(worldjsoninfo);
}

// clear files if changes (dataset) occur
function clearDashboard() {
  // Check if charts are defined before clearing them
  if (chart1) chart1.selectAll("*").remove();
  if (chart2) chart2.selectAll("*").remove();
  if (chart3) chart3.selectAll("*").remove();
  if (chart4) chart4.selectAll("*").remove();
}
