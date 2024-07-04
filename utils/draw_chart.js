/** handle data preprocessing 
 * @param data the dataset
*/
class DrawChart extends PreprocessData {
  //initialization of the data

  constructor(data, countries, selectedYear, chart1, chart2, chart3, chart4) {
    super(data, selectedYear)
    this.data = data;
    this.countries = countries
    this.selectedYear = selectedYear
    this.chart1 = chart1
    this.chart2 = chart2
    this.chart3 = chart3
    this.chart4 = chart4


  }


  //set selected year
  setSelectedYear(year) {

    this.selectedYear = year;

    console.log("is year updated", this.selectedYear)
  }
  /** render world map of country */
  renderMap(world) {

    var width = 600;
    var height = 500;

    var projection = d3
      .geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2]);

    var path = d3.geoPath().projection(projection);

    // Create a mapping between country names and GDP values
    var gdpMap = {};
    this.data.forEach((country) => {
      gdpMap[country.Country] = country[this.selectedYear]; // Change this to the desired year
    });



    // Create color scale based on GDP values
    var colorScale = d3
      .scaleSequential()
      .domain([d3.max(data, d => d[this.selectedYear]), 0]) // Reverse domain
      .interpolator(d3.interpolateYlGnBu);

    // Append SVG element

    this.chart1 = d3
      .select("#chart1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Load world map data
    var countryNames = this.get_country()
    // Draw countries
    this.chart1
      .selectAll("path")
      .data(topojson.feature(world, world.objects.countries).features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", function (d) {
        var names = countryNames[d.id];
        return gdpMap[names] ? colorScale(d.id) : "#ccc"; // Fallback color for missing data
      })
      .attr("stroke", "#fff") // Add stroke for better visualization
      .on("mouseover", function (event, d) {

        var names = countryNames[d.id];

        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html("Country: " + names + "<br>GDP: " + gdpMap[names])
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (event, d) {

        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Tooltip for hover effect
    var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  }



  updateFilterByYear() { }


  createCorrelationHeatMap() {
    // Assuming gdpData is your dataset

    // Calculate correlation matrix
    var years = Object.keys(this.data[0]).filter(
      (key) => key !== "Country" && key !== "id"
    ); // Get years
    var correlationMatrix = years.map((year1) => {
      return years.map((year2) => {
        var values1 = this.data.map((country) => country[year1]);
        var values2 = this.data.map((country) => country[year2]);
        return (
          d3.mean(d3.zip(values1, values2).map(([x, y]) => x * y)) -
          d3.mean(values1) * d3.mean(values2)
        );
      });
    });

    // Set up heatmap dimensions
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    // Create SVG container
    this.chart4 = d3
      .select("#chart4")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create color scale
    var colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]); // Adjust domain based on correlation values

    // Create heatmap rectangles
    this.chart4
      .selectAll(".heatmap")
      .data(correlationMatrix)
      .enter()
      .append("g")
      .attr("class", "row")
      .selectAll(".cell")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d, i) => i * (width / years.length))
      .attr("y", (d, i) => i * (height / years.length))
      .attr("width", width / years.length)
      .attr("height", height / years.length)
      .style("fill", (d) => colorScale(d));

    // Add color scale legend
    var legendWidth = 100;
    var legendHeight = 20;
    var legend = this.chart4
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        "translate(" +
        (width - legendWidth) +
        "," +
        (height - legendHeight) +
        ")"
      );

    var legendScale = d3.scaleLinear().domain([-1, 1]).range([0, legendWidth]);

    var legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format(".1f"));

    legend
      .append("g")
      .attr("class", "legend-axis")
      .attr("transform", "translate(0," + legendHeight + ")")
      .call(legendAxis);

    // Add labels to heatmap cells
    this.chart4
      .selectAll(".cell-label")
      .data(correlationMatrix)
      .enter()
      .append("g")
      .attr("class", "cell-label")
      .selectAll(".label")
      .data((d, i) => d.map((value, j) => ({ value, i, j })))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => (d.j + 0.5) * (width / years.length))
      .attr("y", (d) => (d.i + 0.5) * (height / years.length))
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .text((d) => d3.format(".2f")(d.value));
  }

  //create a bar chat
  createBarChart() {
    let top10 = this.top10CountryHighestGdp();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create an SVG container
    this.chart2 = d3
      .select("#chart2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    let year = "2021";

    const x = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(top10, (d) => parseFloat(d[year].toString().replace(/,/g, ""))),
      ])
      .range([0, width]);

    const y = d3
      .scaleBand()
      .domain(top10.map((d) => d.Country))
      .range([0, height])
      .padding(0.1);

    this.chart2
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")))
      .append("text")
      .attr("class", "axis-label")
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .attr("text-anchor", "end")
      .text("GDP (in billion USD)");

    // Add y-axis
    this.chart2
      .append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("class", "axis-label")
      .attr("x", -margin.left)
      .attr("y", -margin.top) // Adjusted position
      .attr("dy", "6em") // Added for better alignment
      .style("text-anchor", "start")
      .attr("transform", "rotate(-90)") // Rotated for vertical orientation
      .style("font-size", "14px") // Adjust font size
      .style("font-family", "Arial, sans-serif") // Adjust font family
      .text("Country");

    // Add bars
    this.chart2
      .selectAll(".bar")
      .data(top10)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", (d) => y(d.Country))
      .attr("width", (d) =>
        x(parseFloat(d[year].toString().replace(/,/g, "")))
      )
      .attr("height", y.bandwidth());
  }

  clearChart() {
    this.chart1.selectAll("*").remove();
    this.chart2.selectAll("*").remove();
    this.chart3.selectAll("*").remove();
    this.chart4.selectAll("*").remove();

  }

  createLineChart() {
    const lineChartWidth = 500;
    const lineChartHeight = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    this.chart3 = d3
      .select("#chart3")
      .append("svg")
      .attr("width", lineChartWidth + margin.left + margin.right)
      .attr("height", lineChartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Prepare the data
    const parseYear = d3.timeParse("%Y");
    // Add other countries as needed
    const selectedData = this.data.filter((d) =>
      this.countries.includes(d.Country)
    );

    // Prepare scales and axes
    const xScale = d3
      .scaleTime()
      .domain([parseYear(1999), parseYear(2022)])
      .range([0, lineChartWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(selectedData, (d) =>
          d3.max(
            Object.keys(d)
              .filter((k) => k.match(/^\d{4}$/))
              .map((k) => +d[k])
          )
        ),
      ])
      .range([lineChartHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(yScale);

    // Draw axes
    this.chart3
      .append("g")
      .attr("transform", "translate(0," + lineChartHeight + ")")
      .call(xAxis);

    this.chart3.append("g").call(yAxis);

    // Draw lines
    const line = d3
      .line()
      .x((d) => xScale(parseYear(d.year)))
      .y((d) => yScale(d.value));

    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    selectedData.forEach((countryData, index) => {
      const country = countryData.Country;
      const data = Object.keys(countryData)
        .filter((k) => k.match(/^\d{4}$/))
        .map((k) => ({ year: k, value: +countryData[k] }));

      this.chart3
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colors(index))
        .attr("stroke-width", 1.5)
        .attr("d", line)
        .attr("class", "line")
        .append("title")
        .text(country);
    });

    // Add legend
    const legend = this.chart3
      .selectAll(".legend")
      .data(countries)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend
      .append("rect")
      .attr("x", lineChartWidth - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d, i) => colors(i));

    legend
      .append("text")
      .attr("x", lineChartWidth - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text((d) => d);
  }

  // Call the createHistogram function
}

