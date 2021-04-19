var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper
var svg = d3.select("body").select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initiate parameters
var chosenXAxis = 'smokes'
var chosenYAxis = 'income'
var xAxisLabels = ["smokes", "healthcare", "poverty"];  
var yAxisLabels = ["age", "obesity", "income"];
var labelsTitle = { "poverty": " Percent In Poverty ", 
                    "age": "(Median) Age", 
                    "income": "Household Income",
                    "obesity": "Percent of Obesity", 
                    "smokes": "Percent that Smokes", 
                    "healthcare": "Percent that Needs Healthcare" }

// Add function to update xscale var upon click
function xScale(healthData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.9,
      d3.max(healthData, d => d[chosenXAxis]) * 1.1
     ])
    .range([0, width]);
  return xLinearScale;
}

function yScale(healthData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) - 2,
      d3.max(healthData, d => d[chosenYAxis]) + 2
     ])
    .range([height, 0]);
  return yLinearScale;
}

// Update xAxis
function renderX(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(500)
    .call(bottomAxis);
      return xAxis;
}

function renderY(newYAxis, yAxis) {
  var leftAxis = d3.leftAxis(newYAxis);

  yAxis.transition()
    .duration(500)
    .call(leftAxis);
      return yAxis;
}

// Update cirlces
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
     .duration(1000)
     .attr("cx", d => newXScale(d[chosenXAxis]))
     .attr("cy", d => newXScale(d[chosenYAxis]));
   return circlesGroup;
 }
 
 function renderText(circletextGroup, newYScale, newYScale, chosenXAxis, chosenYAxis) {
  circletextGroup.transition()
    .duration(1000)
    .attr("x", d => newYScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
  return circletextGroup;
}

// tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "smokes") {
    var xlabel = "Percentage of Smokers:";
  }
  else if (chosenXAxis === "healthcare") {
    var xlabel = "Percentage without Healthcare:";
  }
  else {
    var xlabel = "Poverty:"
  }
    if (chosenYAxis === 'age'){
      var ylabel = "Median Age:"
    }
    else if (chosenYAxis === 'obesity'){
      var ylabel = "Obesity:"
    }
    else {
      var ylabel = "Income:"
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .style("color", "black")
      .style("background", 'white')
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .html(function(d) {
        if (chosenXAxis === "smokes") {
          return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}`);
        }
          else if (chosenXAxis !=="healthcare" && chosenXAxis !== "smokes") {
            return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
            }
            else {
              return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
            }   
      });
      circlesGroup.call(toolTip);

      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data,this);
      })

      .on("mouseout", function(data, index){
        toolTip.hide(data);
      });
    return circlesGroup;
}

// Retrieve csv data
d3.csv("assets/data/data.csv").then(function(healthData, err) {
  if (err) throw err;
  // console.log(healthData)});

// Parse the data
healthData.forEach (function(data) {
  // data.id = +data.id;
  data.poverty = +data.poverty;
  data.age = +data.age;
  data.income = +data.income;
  data.healthcare = +data.healthcare;
  data.obesity = +data.obesity;
  data.smokes = +data.smokes;
});

// linear scale functions
var xLinearScale = xScale(healthData, chosenXAxis);
var yLinearScale = yScale(healthData, chosenYAxis);

var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

// append 
var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

var circlesGroup = chartGroup.selectAll("circle")
  .data(healthData)
  .enter()
  .append("circle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 25)
  .attr("fill", "lightblue")
  .attr("opacity", ".25");

  var circletextGroup = chartGroup.selectAll()
  .data(healthData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]))
  .style("font-size", "15px")
  .style("text-anchor", "middle")
  .style("fill", "dark blue");

// group for labeling
var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width}, ${height +25})`);

var smokingLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 40)
  .attr("value", "smokes")
  .classed("active", true)
  .text("% who smoke");

var healthcareLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 50)
  .attr("value", "healthcare")
  .classed("inactive", true)
  .text("% who do not have Healthcare");

var povertyLabel = labelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty")
  .classed("inactive", true)
  .text("% in Poverty");

var ageLabel = labelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 400)
  .attr("y", -400)
  .attr("value", "age")
  .classed("inactive", true)
  .text("Median Age");

var incomeLabel = labelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 400)
  .attr("y", -450)
  .attr("value", "income")
  .classed("inactive", true)
  .text("Median Household Income");

  var obesityLabel = labelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 400)
  .attr("y", -460)
  .attr("value", "obesity")
  .classed("inactive", true)
  .text("% who are Obese");

// Update tooltip
var circlesGroup = updateToolTip(chosenYAxis, chosenYAxis, circlesGroup);

// labels event listener
labelsGroup.selectAll("text")
  .on("click", fucntion())
    var value = d3.select(this).attr("value");
    if (true) {
      if (value === "smokes" || value ==="poverty" || value === "healthcare") {
        chosenYAxis = value;
        xLinearScale = xScale(healthData, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokingLabel
            .classed("active", true)
            .classed("inactive", false);
         }
         else if (chosenXAxis === "healthcare") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokingLabel
            .classed("active", true)
            .classed("inactive", false);
       }
          else {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokingLabel
              .classed("active", true)
              .classed("inactive", false);
        }}
        else {
          chosenYAxis = value;
          yLinearScale = yScale(healthData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
          if (chosenYAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
        }
            else if (chosenXAxis === "obesity") {
              ageLabel
                .classed("active", true)
                .classed("inactive", false);
              obesityLabel
                .classed("active", true)
                .classed("inactive", false);
              incomeLabel
                .classed("active", true)
                .classed("inactive", false);
         }
              else {
                ageLabel
                  .classed("active", true)
                  .classed("inactive", false);
                obesityLabel
                  .classed("active", true)
                  .classed("inactive", false);
                incomeLabel
                  .classed("active", true)
                  .classed("inactive", false);
             }
            }}})