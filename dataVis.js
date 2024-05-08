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

// scatterplot axes
let xAxis, yAxis, xAxisLabel, yAxisLabel;
// radar chart axes
let radarAxes, radarAxesAngle;

let dimensions = ["dimension 1", "dimension 2", "dimension 3", "dimension 4", "dimension 5", "dimension 6"];
//*HINT: the first dimension is often a label; you can simply remove the first dimension with
// dimensions.splice(0, 1);

// the visual channels we can use for the scatterplot
let channels = ["scatterX", "scatterY", "size"];

// size of the plots
let margin, width, height, radius;
// svg containers
let scatter, radar, dataTable;

// Add additional variables


function init() {
    // define size of plots
    margin = {top: 20, right: 20, bottom: 20, left: 50};
    width = 600;
    height = 500;
    radius = width / 2;

    // Start at default tab
    document.getElementById("defaultOpen").click();

	// data table
	dataTable = d3.select('#dataTable');
 
    // scatterplot SVG container and axes
    scatter = d3.select("#sp").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // radar chart SVG container and axes
    radar = d3.select("#radar").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // read and parse input file
    let fileInput = document.getElementById("upload"), readFile = function () {

        // clear existing visualizations
        clear();

        let reader = new FileReader();
        reader.onloadend = function () {

            let data = d3.csvParse(reader.result, d3.autoType);
            console.log("data loaded: ");
            console.log(data);
            console.log("Dimensions:", data.columns);
            
            CreateDataTable(data);
            initVis(data);
            initDashboard(data);
        };
        reader.readAsBinaryString(fileInput.files[0]);
    };
    fileInput.addEventListener('change', readFile);
}


function initVis(_data){
    dimensions = _data.columns;
    dimensions = dimensions.filter(d => !isNaN(_data[0][d]));

    // y scalings for scatterplot
    // TODO: set y domain for each dimension
    let y = d3.scaleLinear()
        .range([height - margin.bottom - margin.top, margin.top]);

    // x scalings for scatter plot
    // TODO: set x domain for each dimension
    let x = d3.scaleLinear()
        .range([margin.left, width - margin.left - margin.right]);

    // radius scalings for radar chart
    // TODO: set radius domain for each dimension
    let r = d3.scaleLinear()
        .range([0, radius]);

    // scatterplot axes
    yAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft(y));

    yAxisLabel = yAxis.append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text("x");

    xAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(x));

    xAxisLabel = xAxis.append("text")
        .style("text-anchor", "middle")
        .attr("x", width - margin.right)
        .text("y");

    // radar chart axes
    radarAxesAngle = Math.PI * 2 / dimensions.length;
    let axisRadius = d3.scaleLinear()
        .range([0, radius]);
    let maxAxisRadius = 0.75,
        textRadius = 0.8;
    gridRadius = 0.1;

    // radar axes
    radarAxes = radar.selectAll(".axis")
        .data(dimensions)
        .enter()
        .append("g")
        .attr("class", "axis");

    radarAxes.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i){ return radarX(axisRadius(maxAxisRadius), i); })
        .attr("y2", function(d, i){ return radarY(axisRadius(maxAxisRadius), i); })
        .attr("class", "line")
        .style("stroke", "black");

    // Render grid lines
    for (let level = 1; level <= 7; level++) {
        let factor = level / 7;
        radarAxes.each(function(d, i) {
            let nextIndex = (i + 1) % dimensions.length;
            radar.append("line")
                .attr("x1", radarX(axisRadius(maxAxisRadius) * factor, i))
                .attr("y1", radarY(axisRadius(maxAxisRadius) * factor, i))
                .attr("x2", radarX(axisRadius(maxAxisRadius) * factor, nextIndex))
                .attr("y2", radarY(axisRadius(maxAxisRadius) * factor, nextIndex))
                .style("stroke", "grey")
                .style("stroke-width", "0.5px")
                .style("stroke-opacity", "0.5");
        });
    }

    radar.selectAll(".axisLabel")
        .data(dimensions)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function(d, i){ return radarX(axisRadius(textRadius), i); })
        .attr("y", function(d, i){ return radarY(axisRadius(textRadius), i); })
        .text(function(dimensions) { return dimensions; });

    // init menu for the visual channels
    channels.forEach(function(c){
        initMenu(c, dimensions);
    });

    // refresh all select menus
    channels.forEach(function(c){
        refreshMenu(c);
    });

    renderScatterplot();
    renderRadarChart();
}

// clear visualizations before loading a new file
function clear(){
    scatter.selectAll("*").remove();
    radar.selectAll("*").remove();
    dataTable.selectAll("*").remove();
}

//Create Table
function CreateDataTable(_data) {
    // Clear previous data table contents
    dataTable.selectAll('*').remove();

    // Create the table element
    let table = dataTable.append('table').attr('class', 'data-table');
    let thead = table.append('thead');
    let tbody = table.append('tbody');

    // Append the header row
    thead.append('tr')
      .selectAll('th')
      .data(_data.columns)
      .enter()
      .append('th')
      .text(function (column) { return column; });

    // Create a row for each object in the data
    let rows = tbody.selectAll('tr')
      .data(_data)
      .enter()
      .append('tr');

    // Create a cell in each row for each column
    let cells = rows.selectAll('td')
      .data(function (row) {
          return _data.columns.map(function (column) {
              return {column: column, value: row[column]};
          });
      })
      .enter()
      .append('td')
      .text(function (d) { return d.value; });

    // Apply click event for cell selection
    cells.on('click', function(event, d) {
        // Clear any previous selection
        d3.selectAll('.data-table td').classed('selected', false);
        // Select the current cell
        d3.select(this).classed('selected', true);
    });
}

function renderScatterplot(){

    //get domain names from menu and label x- and y-axis
    xAxisLabel.text(readMenu('scatterX'));
    yAxisLabel.text(readMenu('scatterY'));

    //TODO: re-render axes
    
    // TODO: render dots
}

function renderRadarChart(){

    // TODO: show selected items in legend

    // TODO: render polylines in a unique color
}


function radarX(radius, index){
    return radius * Math.cos(radarAngle(index));
}

function radarY(radius, index){
    return radius * Math.sin(radarAngle(index));
}

function radarAngle(index){
    return radarAxesAngle * index - Math.PI / 2;
}

// init scatterplot select menu
function initMenu(id, entries) {
    $("select#" + id).empty();

    entries.forEach(function (d) {
        $("select#" + id).append("<option>" + d + "</option>");
    });

    $("#" + id).selectmenu({
        select: function () {
            renderScatterplot();
        }
    });
}

// refresh menu after reloading data
function refreshMenu(id){
    $( "#"+id ).selectmenu("refresh");
}

// read current scatterplot parameters
function readMenu(id){
    return $( "#" + id ).val();
}

// switches and displays the tabs
function openPage(pageName,elmnt,color) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}
