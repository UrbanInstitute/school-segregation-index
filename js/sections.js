/**
* scrollVis - encapsulates
* all the code for the visualization
* using reusable charts pattern:
* http://bost.ocks.org/mike/chart/
*/
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width,
      height,
      barsHeight,
      recaptureContainerX,
      recaptureContainerY;

  var SMALL_RADIUS = (IS_PHONE()) ? 3 : 5;
  var LARGE_RADIUS = (IS_PHONE()) ? 3 : 10;

  if ( IS_PHONE() ){ width = PHONE_VIS_WIDTH }
  else if ( IS_SHORT() ){ width = SHORT_VIS_WIDTH }
  else{ width = VIS_WIDTH} 

  if ( IS_PHONE() ){ height = PHONE_VIS_HEIGHT }
  else if ( IS_SHORT() ){ height = SHORT_VIS_HEIGHT }
  else{ height = VIS_HEIGHT} 

  if ( IS_PHONE() ){ barsHeight = height*.5 }
  else if ( IS_SHORT() ){ barsHeight = height*.65 }
  else{ barsHeight = height*.65}

  if(IS_PHONE()){ recaptureContainerX = 3; recaptureContainerY = 15000;}
  else{ recaptureContainerX = 11; recaptureContainerY = 16300;}

  // var barsHeight = ( IS_PHONE() ) ? height*.5 : height*.65;

  margin = ( IS_PHONE() ) ? PHONE_MARGIN : MARGIN;
  var dotMargin = (IS_PHONE() ) ? PHONE_DOT_MARGIN : DOT_MARGIN;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  var RECAPTURE_AMOUNT = 0;

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  var barPadding = (IS_PHONE()) ? .4 : .1
  var x = d3.scaleBand().rangeRound([0, width]).padding(barPadding),
  y = d3.scaleLinear().rangeRound([barsHeight, 0]);

  y.domain([0, 18000]);

  var dotY = d3.scaleLinear().rangeRound([height - dotMargin.bottom, barsHeight + dotMargin.top]);
  dotY.domain([dotMin, dotMax]);   

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];


  /**
  * chart
  *
  * @param selection - the current d3 selection(s)
  *  to draw the visualization in. For this
  *  example, we will be drawing it in #narrativeVizContainer
  */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data(rawData);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // perform some preprocessing on raw data
      var milwaukeeData = preprocessMilwaukeeData(rawData[0]);

      setupVis(milwaukeeData, null, null);

      setupSections(milwaukeeData, null, null);
    });
  };




  /**
  * setupVis - creates initial elements for all
  * sections of the visualization.
  *
  * @param wordData - data object for each word.
  * @param fillerCounts - nested data that includes
  *  element for each filler word type.
  * @param histData - binned histogram data
  */
  var setupVis = function (rawData) {    
    g.append("text")
      .attr("id", "placeholderText")
    console.log(rawData)
    // x domain
    // y domain
    // size domain
    //g append g, y axis
    //g append g, x axis
    // g bind WI data, draw dot

  };


  function getModel(index){
    if(index < 5){
      return "modelOne"
    }
    else if(index < 8){
      return "modelTwo"
    }
    else if(index < 11){
      return "recapture"
    }else{
      return "modelThree"
    }
  }

  /**
  * setupSections - each section is activated
  * by a separate function. Here we associate
  * these functions to the sections based on
  * the section's index.
  *
  */
  var setupSections = function (milwaukeeData, chartData, mapData) {

    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = function(){ topText(milwaukeeData, chartData, mapData) };
    activateFunctions[1] = function(){ showSingleDot(milwaukeeData, chartData, mapData) };
    activateFunctions[2] = function(){ showMedian(milwaukeeData, chartData, mapData) };
    activateFunctions[3] = function(){ showAllDots(milwaukeeData, chartData, mapData) };
    activateFunctions[4] = function(){ showVChart(milwaukeeData, chartData, mapData) };
    activateFunctions[5] = function(){ scaleDotsByPopulation(milwaukeeData, chartData, mapData) };
    activateFunctions[6] = function(){ breakInNarrative(milwaukeeData, chartData, mapData) };
    activateFunctions[7] = function(){ stackSCI(milwaukeeData, chartData, mapData) };
    activateFunctions[8] = function(){ groupedStackedSCI(milwaukeeData, chartData, mapData) };
    activateFunctions[9] = function(){ narrativeBeeSwarm(milwaukeeData, chartData, mapData) };
  };

  /**
  * ACTIVATE FUNCTIONS
  *
  * These will be called their
  * section is scrolled to.
  *
  * General pattern is to ensure
  * all content for the current section
  * is transitioned in, while hiding
  * the content for the previous section
  * as well as the next section (as the
  * user may be scrolling up or down).
  *
  */
 

  function getChooseSchoolStatus(){
    return (d3.select("#narrativeChooseSchoolContainer").classed("open")) ? "open" : "closed";
  }
  function showChooseSchool(){
    var containerHeight = (getChooseSchoolStatus() == "open") ? (window.innerHeight * .5 - 25) + "px" : "50px"
    d3.select("#narrativeChooseSchoolContainer")
      .classed("hidden",false)
      .transition()
      .style("height", containerHeight)

  }
  function hideChooseSchool(){
    d3.select("#narrativeChooseSchoolContainer")
      .classed("hidden",true)
      .transition()
      .style("height", "0px")
  }
  function toggleChooseSchool(){
    var drawer = d3.select("#narrativeChooseSchoolContainer"),
        arrow = d3.select("#narrativeChooseSchoolArrow")
    if(drawer.classed("hidden")){
      return false;
    }
    if(drawer.classed("open")){
      drawer
        .classed("open", false)
        .transition()
        .style("height", "50px")
      arrow
        .transition()
        .style("transform","rotate(0deg)")

    }else{
      var containerHeight = (window.innerHeight * .5 - 25) + "px";
      drawer
        .classed("open", true)
        .transition()
        .style("height", containerHeight)
      arrow
        .transition()
        .style("transform","rotate(180deg)")
    }
  }

  d3.select("#narrativeChooseSchoolArrow").on("click", toggleChooseSchool)
  d3.select("#narrativeChooseSchoolInput").on("input", function(){
    toggleChooseSchool();
    //do some stuff
  })




  var highestIndex = 0;
  /**
  * showTitle - initial title
  *
  * hides: count title
  * (no previous step to hide)
  * shows: intro title
  *
  */
  function topText(barData){
    hideChooseSchool();
  }
  function showSingleDot(barData) {
    showChooseSchool();
    d3.select("#placeholderText").text("just a dot")
    d3.select("#narrativeChooseSchoolText").text("a dot for school X")
  }

  function showMedian(barData){
    d3.select("#placeholderText").text("Dot plus median")
    d3.select("#narrativeChooseSchoolText").text("dot plus median for school X")
  }

  function showAllDots(barData){
    d3.select("#placeholderText").text("all dots on number line")
    d3.select("#narrativeChooseSchoolText").text("dots on number line for school X")
  }

  function showVChart(barData){
    d3.select("#placeholderText").text("same size v chart")
    d3.select("#narrativeChooseSchoolText").text("same size v chart school X")
  }

  function scaleDotsByPopulation(barData){
    showChooseSchool()
    d3.select("#placeholderText").text("v chart")
    d3.select("#narrativeChooseSchoolText").text("v chart school X")
  }
  function breakInNarrative(barData){
   hideChooseSchool();
   d3.select("#placeholderText").text("break in action")
  }
  function stackSCI(barData){
    d3.select("#placeholderText").text("stacked SCI up to 1")
  }

  function groupedStackedSCI(barData){
    d3.select("#placeholderText").text("stacked SCI break out 50/50")
  }

  function narrativeBeeSwarm(barData){
    d3.select("#placeholderText").text("BEES")
  }




  /**
  * DATA FUNCTIONS
  *
  * Used to coerce the data into the
  * formats we need to visualize
  *
  */


  function preprocessMilwaukeeData(milwaukeeData) {
    return milwaukeeData.map(function (d, i) {
      d.pop = d.pop;
      d.minority_pop = +d.minority_pop;
      d.minority_percent = +d.minority_percent;
      d.sci = +d.sci;
      return d;
    });
  }

  /**
  * activate -
  *
  * @param index - index of the activated section
  */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      console.log(i)
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };
  return chart;
};



/**
* display - called once data
* has been loaded.
* sets up the scroller and
* displays the visualization.
*
* @param data - loaded tsv data
*/
function display(rawData) {
  console.log(rawData)
  if(getInternetExplorerVersion() != -1){
    IS_IE = true;
  }
  // create a new plot and
  // display it
  var plot = scrollVis();

  d3.select('#narrativeVizContainer')
    .style("left", function(){
      if(IS_PHONE()){
        return ( (window.innerWidth - PHONE_VIS_WIDTH - margin.left - margin.right)*.5 ) + "px"
      }
      if(IS_MOBILE()){
        return ( (window.innerWidth - VIS_WIDTH - margin.left - margin.right)*.5 ) + "px"
      }else{
        return "inherit"
      }
    })
    .datum(rawData)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  scroll.on('resized', function(){
    d3.select("#narrativeVizContainer svg").remove()
    display(rawData)
  })

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    var offOpacity = (IS_MOBILE()) ? 1 : .1
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : offOpacity; });
    // activate current section
    plot.activate(index);  

  });

}



const dataFiles = ["data/charts/csv/wi_schools.csv"];
const promises = [];

dataFiles.forEach(function(url, index) {
    promises.push(url.search(".csv") != -1 ? d3.csv(url) : d3.json(url))
});

Promise.all(promises).then(function(data) {
    console.log(data); //check if all data was loaded
    display(data)
    //any code that depends on 'data' goes here
});
