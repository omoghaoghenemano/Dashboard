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
let domainByDimension = {};
let domainByRadarDimension = {};
let data;
let selectedPoints = {};
let colorPalette = ["#000000","#FF4500","#228B22","#4169E1","#FFD700","#8B008B","#FF8C00","#00CED1","#FF1493","#008000"];

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

            data = d3.csvParse(reader.result, d3.autoType);
            console.log("data loaded: ");
            console.log(data);
            console.log("Dimensions:", data.columns);
            
            CreateDataTable(data);

            data.forEach((d, index) => d.id = index);
            initVis(data);
            initDashboard(data);
        };
        reader.readAsBinaryString(fileInput.files[0]);
    };
    fileInput.addEventListener('change', readFile);
}

function setDomainByDimension(_data, _dimensions){
    _dimensions.forEach(dim => {
        let extent = d3.extent(_data, d => d[dim]);
        domainByDimension[dim] = extent;

        let buffer = (extent[1] - extent[0]) * 0.5;
        domainByRadarDimension[dim] = [extent[0] - buffer, extent[1] + buffer];
    });
}

function initVis(_data){
    dimensions = _data.columns;
    dimensions = dimensions.filter(d => !isNaN(_data[0][d]));
    setDomainByDimension(_data, dimensions);

    // y scalings for scatterplot
    let y = d3.scaleLinear()
        .domain(domainByDimension[dimensions[0]])
        .range([height - margin.bottom - margin.top, margin.top]);
    
    // x scalings for scatter plot
    let x = d3.scaleLinear()
        .domain(domainByDimension[dimensions[0]])
        .range([margin.left, width - margin.left - margin.right]);

    
    // radius scalings for radar chart
    let r = d3.scaleLinear()
        .domain(domainByRadarDimension[dimensions[0]])
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
                .style("stroke-opacity", "0.9");
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
    cells.on('click', function (event, d) {
        
        var isSelected = d3.select(this).classed('selected');

        d3.selectAll('.data-table td').classed('selected', false);

        if (!isSelected) {
            d3.select(this).classed('selected', true);
        }
    });

    cells.on("mouseover", function () {
        d3.select(this).style("background-color", "#418bab");
      })
      .on("mouseout", function () {
        d3.select(this).style("background-color", null);
      });
}

function renderScatterplot(){

    //get domain names from menu and label x- and y-axis
    xAxisLabel.text(readMenu('scatterX'));
    yAxisLabel.text(readMenu('scatterY'));

    //re-render axes
    let y = d3.scaleLinear()
        .domain(domainByDimension[readMenu('scatterY')])
        .range([height - margin.bottom - margin.top, margin.top]);

    let x = d3.scaleLinear()
        .domain(domainByDimension[readMenu('scatterX')])
        .range([margin.left, width - margin.left - margin.right]);

    // Update axes with transition
    xAxis.transition().duration(1000).call(d3.axisBottom(x));
    yAxis.transition().duration(1000).call(d3.axisLeft(y));
    
    //render dots
    let sizeScale = d3.scaleSqrt()
        .domain(domainByDimension[readMenu('size')])
        .range([2, 15]); // Adjust size range accordingly

    // Bind data and create circles for each data point
    let update = scatter.selectAll(".dot")
        .data(data, d => d.id);

    update.exit()
        .transition() // for animation
        .duration(1000) // time
        .attr("r", 0)
        .remove();
    
    // Enter new elements in the data
    let enter = update.enter().append("circle")
        .attr("class", "dot")
        .attr("r", 0)  // initial dot size
        .on("click", function(event, d) {  // triggered when dot is clicked
            handleDotClick(event, d);
        });
    
    enter.merge(update)
        .transition()  // for animation
        .duration(1000) // time
        .attr("cx", d => x(d[readMenu('scatterX')]))
        .attr("cy", d => y(d[readMenu('scatterY')]))
        .attr("r", d => sizeScale(d[readMenu('size')]))
        .style("fill", d => selectedPoints[d.id] ? selectedPoints[d.id].color : "#708090")
        .style("opacity", 0.7);
}

function handleDotClick(event, d) {
    if (selectedPoints[d.id]) {
        delete selectedPoints[d.id];
    } else if (Object.keys(selectedPoints).length < 10) { // Limit to 10 selections
        let availableColor = colorPalette.find(c => !Object.values(selectedPoints).find(sp => sp.color === c));
        if (availableColor) {
            selectedPoints[d.id] = { color: availableColor, data: d, label: d.Name };
        }
    }
    updateLegend();
    renderScatterplot();
    renderRadarChart();
}

function updateLegend() {
    let legend = d3.select("#legend").selectAll(".legend-item")
        .data(Object.entries(selectedPoints), d => d[0]);

    legend.exit().remove();

    let legendEnter = legend.enter().append("div")
        .attr("class", "legend-item");

    // Append a colored dot before the label
    legendEnter.append("span")
        .style("background-color", d => d[1].color)
        .style("border-radius", "50%")
        .style("display", "inline-block")
        .style("width", "10px")
        .style("height", "10px")
        .style("margin-right", "5px");

    legendEnter.append("span")
        .style("color", d => d[1].color)
        .text(d => `${d[1].label}`);

    // Using <span> for the close button and applying class "close"
    legendEnter.append("span")
        .attr("class", "close")
        .text("x")
        .on("click", function(event, d) {
            delete selectedPoints[d[0]]; 
            updateLegend();
            renderScatterplot(); 
            renderRadarChart();  
            event.stopPropagation(); 
        });

    // Merge and update existing items in the legend
    legend.select("span.close").on("click", function(event, d) {
        delete selectedPoints[d[0]];
        updateLegend();
        renderScatterplot();
        renderRadarChart();  
        event.stopPropagation();
    });

    legend.selectAll("span").filter((d, i) => i === 1)
        .style("color", d => d[1].color)
        .text(d => d[1].label);
}

function renderRadarChart(){
    radar.selectAll(".radar-line").remove();  // Clear previous lines

    Object.entries(selectedPoints).forEach(([id, {color, data}]) => {
        let pathData = dimensions.map((dim, i) => {
            let rValue = radarScale(data[dim], dim);
            return [radarX(rValue, i), radarY(rValue, i)];
        });

        radar.append("path")
            .datum(pathData)
            .attr("d", d3.line().curve(d3.curveLinearClosed))
            .attr("stroke-width", 2)
            .attr("stroke", color)
            .attr("fill", "none")
            .attr("fill-opacity", 0.2)
            .attr("class", "radar-line");
    });
}

function radarScale(value, dimension) {
    return d3.scaleLinear()
        .domain(domainByRadarDimension[dimension])
        .range([0, radius])(value);
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
