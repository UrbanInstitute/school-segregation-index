function setActiveDistrict(districtId){
  d3.select("#activeDistrict").datum(districtId)
}
function getActiveDistrict(){
  return  d3.select("#activeDistrict").datum()
}


/**
* scrollVis - encapsulates
* all the code for the visualization
* using reusable charts pattern:
* http://bost.ocks.org/mike/chart/
*/
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var svgWidth,
      svgHeight,
      barsHeight,
      recaptureContainerX,
      recaptureContainerY,
      TAMARACK_MEDIAN,
      MILWAUKEE_SUM;

  // var SMALL_RADIUS = (IS_PHONE()) ? 3 : 5;
  // var LARGE_RADIUS = (IS_PHONE()) ? 3 : 10;



  const NARRATIVE_FIXED_R = 7,
        NARRATIVE_DOT_SCALAR = .2,
        TAMARACK_ID = "A9703704",
        MILWAUKEE_ID = "5509600",
        DEFAULT_LEVEL = "1",
        NUMBER_LINE_DOT_OPACITY = 1,
        DEFAULT_TRANSITION_TIME = 250


  if ( IS_PHONE() ){ svgWidth = PHONE_VIS_WIDTH }
  else if ( IS_SHORT() ){ svgWidth = SHORT_VIS_WIDTH }
  else{ svgWidth = VIS_WIDTH} 

  if ( IS_PHONE() ){ svgHeight = PHONE_VIS_HEIGHT }
  else if ( IS_SHORT() ){ svgHeight = SHORT_VIS_HEIGHT }
  else{ svgHeight = VIS_HEIGHT} 

  // if ( IS_PHONE() ){ barsHeight = height*.5 }
  // else if ( IS_SHORT() ){ barsHeight = height*.65 }
  // else{ barsHeight = height*.65}

  // if(IS_PHONE()){ recaptureContainerX = 3; recaptureContainerY = 15000;}
  // else{ recaptureContainerX = 11; recaptureContainerY = 16300;}

  // // var barsHeight = ( IS_PHONE() ) ? height*.5 : height*.65;

  svgMargin = ( IS_PHONE() ) ? PHONE_MARGIN : MARGIN;
  // var dotMargin = (IS_PHONE() ) ? PHONE_DOT_MARGIN : DOT_MARGIN;

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
  var svgChoose = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;
  var gChoose = null;

  // var barPadding = (IS_PHONE()) ? .4 : .1
  // var x = d3.scaleBand().rangeRound([0, width]).padding(barPadding),
  // y = d3.scaleLinear().rangeRound([barsHeight, 0]);

  // y.domain([0, 18000]);

  // var dotY = d3.scaleLinear().rangeRound([height - dotMargin.bottom, barsHeight + dotMargin.top]);
  // dotY.domain([dotMin, dotMax]);   

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
      svg = d3.select(this).append('svg')
      // @v4 use merge to combine enter and existing selection
      // svg = svg.merge(svgE);

      svg.attr('width', svgWidth + svgMargin.left + svgMargin.right);
      svg.attr('height', svgHeight + svgMargin.top + svgMargin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = d3.select('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');


      svgChoose = d3.select("#narrativeChooseSchoolChartContainer").append('svg')
      // @v4 use merge to combine enter and existing selection
      // svg = svg.merge(svgE);

      svgChoose.attr('width', svgWidth + svgMargin.left + svgMargin.right);
      svgChoose.attr('height', svgHeight + svgMargin.top + svgMargin.bottom);

      svgChoose.append('g');


      // this group element will be used to contain all
      // other elements.
      g = d3.select('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');

      gChoose = svgChoose.select('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');

      // perform some preprocessing on raw data
      var milwaukeeData = preprocessMilwaukeeData(rawData[0], rawData[2]);
      var schoolData = preprocessSchoolData(rawData[1], rawData[2])
      var allDistrictData = rawData[2]


      setupVis(milwaukeeData, schoolData, null, allDistrictData);

      setupSections(milwaukeeData, schoolData, null, allDistrictData);
    });
  };


function setupChooseVis(districtData, schoolid, districtDatum){
districtData.sort(function(a, b){ return (a.minority_percent < b.minority_percent) ? -1 : 1 })
gChoose.selectAll(".choose").remove()


    var x = getVX("choose");
    var y = getVY("choose", 1, districtData);
    var vH = getVHeight("choose", -1)
    var vW = getVWidth("choose")
    var vMargins = getVMargins("choose")
    var chartPos = getRelativeChartPositions("choose")

    var districtMedian = districtDatum.M //replace with info from mapped distrits JSON
// console.log(gChoose)

  
    gChoose
      .append("line")
      .attr("class", "choose medianLine")
            .attr("x1", x(districtMedian))
      .attr("x2", x(districtMedian))
      .attr("y1", chartPos.y1)
      .attr("y2", chartPos.y1)

    gChoose.append("g")
  .attr("class", "narrative v choose y axis")
  .attr("transform", "translate(" + vMargins.left + ",0)")
  .style("opacity",0)
  .call(d3.axisLeft(y).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".1%")).tickPadding(10))

      gChoose.append("g")
        .attr("class", "narrative v choose x axis")
        .attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")
        .call(d3.axisBottom(x)
                .tickFormat(d3.format(".0%"))
                .tickSizeOuter(0)
             );

 var avgGChoose = gChoose.append("g")
    .attr("class", "choose medianTextG")
    .attr("transform", "translate(" + (x(districtMedian) - 50) + "," + (svgHeight + 200) + ")")

    avgGChoose.append("text")
      .attr("class", "choose districtAverage label")
      .text("District Average")
      .attr("x",0)
      .attr("y",0)

    avgGChoose.append("text")

      .attr("class", "choose districtAverage value")
      .text(d3.format(".0%")(districtMedian) + " black and hispanic")
      .attr("x",0)
      .attr("y",20)


        gChoose.selectAll(".lollipop.narrative.choose")
        .data(districtData)
      .enter().append("line")
        .attr("x1", function(d) { return x(d.minority_percent); })
        .attr("x2", function(d) { return x(d.minority_percent); })
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(0) })
        .attr("class",function(d){
          return "sid_" + d.schoolid;
        })
        .classed("lollipop narrative choose",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .classed("highlight", function(d){
          return d.schoolid == schoolid
        })


        gChoose.selectAll(".dot.narrative.choose")
        .data(districtData)
      .enter().append("circle")
        .attr("r", NARRATIVE_FIXED_R)
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d){
          return (d.schoolid == schoolid) ? chartPos.dot  : chartPos.hide;
        })
        .attr("class",function(d){
          return "sid_" + d.schoolid;
        })
        .classed("dot narrative choose",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .classed("highlight", function(d){
          return d.schoolid == schoolid
        })
        .style("opacity", function(d){
          return (d.schoolid == schoolid) ? 1 : NUMBER_LINE_DOT_OPACITY;
        })



    activeDot = d3.select(".dot.choose.highlight")
    activeLine = d3.select(".lollipop.choose.highlight")

    adClone = activeDot.node().cloneNode(true)
    alClone = activeLine.node().cloneNode(true)

    d3.select(adClone).classed("beeHide", true).datum(activeDot.datum())
    d3.select(alClone).classed("beeHide", true).datum(activeLine.datum())
    
    
    activeDot.node().parentNode.appendChild(adClone)
    activeDot.node().parentNode.appendChild(alClone)




}


  function buildAutocompletes(schoolData, allDistrictData){
    var schoolNames = schoolData
        .filter(function(o){ return o.level == DEFAULT_LEVEL }).map(function(o){
          return {"label" : o.schoolName + " " + " (" + o.level + ")", "value": o.schoolid
        }
    })

      $( "#narrativeChooseSchoolInput" ).autocomplete({
        source: schoolNames,
        minLength: 5,
        delay: 0,
        appendTo: "#narrativeChooseSchoolList",
        select: function(event, ui){
          // console.log("asdf")
          var schoolDatum = schoolData.filter(function(o){ return o.schoolid == ui.item.value })[0]
          var districtData = schoolData.filter(function(o){ return o.districtId == schoolDatum.districtId && o.level == schoolDatum.level })


          setActiveDistrict(schoolDatum.districtId)

          dispatch.call("changeDistrict", this, schoolDatum.districtId)

          setupChooseVis(districtData, schoolDatum.schoolid, allDistrictData[schoolDatum.districtId + "_" + schoolDatum.level])

          activateFunctions[activeIndex]("choose")

          // var districtName = ui.item.value
          // var level = getLevel();
          // var schools = data.filter(function(o){
          //   return o.district == districtName && o.level == level
          // })
          // .sort(function(a, b){
          //   return b.sci - a.sci
          // })
          // updateDistrict(schools)
        }
      });



  }


  /**
  * setupVis - creates initial elements for all
  * sections of the visualization.
  *
  * @param wordData - data object for each word.
  * @param fillerCounts - nested data that includes
  *  element for each filler word type.
  * @param histData - binned histogram data
  */
  var setupVis = function (milwaukeeData, schoolData, mapData, allDistrictData) {

    setActiveDistrict(MILWAUKEE_ID)

    buildAutocompletes(schoolData, allDistrictData)    
    g.append("text")
      .attr("id", "placeholderText")
    // x domain


    var x = getVX("narrative");
    var y = getVY("narrative", 1, milwaukeeData);
    var vH = getVHeight("narrative", -1)
    var vW = getVWidth("narrative")
    var vMargins = getVMargins("narrative")
    var chartPos = getRelativeChartPositions("narrative")





    g
      .append("line")
      .attr("class", "milwaukee medianLine")
      .attr("x1", x(TAMARACK_MEDIAN))
      .attr("x2", x(TAMARACK_MEDIAN))
      .attr("y1", chartPos.y1)
      .attr("y2", chartPos.y1)



  g.append("g")
  .attr("class", "narrative v milwaukee y axis")
  .attr("transform", "translate(" + vMargins.left + ",0)")
  .style("opacity",0)
  .call(d3.axisLeft(y).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".1%")).tickPadding(10))






      g.append("g")
        .attr("class", "narrative v milwaukee x axis")
        .attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")
        .call(d3.axisBottom(x)
                .tickFormat(d3.format(".0%"))
                .tickSizeOuter(0)
             );

    var avgG = g.append("g")
    .attr("class", "milwaukee medianTextG")
    .attr("transform", "translate(" + (x(TAMARACK_MEDIAN) - 50) + "," + (svgHeight + 200) + ")")

    avgG.append("text")
      .attr("class", "milwaukee districtAverage label")
      .text("District Average")
      .attr("x",0)
      .attr("y",0)

    avgG.append("text")

      .attr("class", "milwaukee districtAverage value")
      .text(d3.format(".0%")(TAMARACK_MEDIAN) + " black and hispanic")
      .attr("x",0)
      .attr("y",20)


        g.selectAll(".lollipop.narrative.milwaukee")
        .data(milwaukeeData)
      .enter().append("line")
        .attr("x1", function(d) { return x(d.minority_percent); })
        .attr("x2", function(d) { return x(d.minority_percent); })
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(0) })
        .attr("class",function(d){
          return "sid_" + d.schoolid;
        })
        .classed("lollipop narrative milwaukee",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .classed("highlight", function(d){
          return d.schoolid == TAMARACK_ID
        })


        g.selectAll(".dot.narrative.milwaukee")
        .data(milwaukeeData)
      .enter().append("circle")
        .attr("r", NARRATIVE_FIXED_R)
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d){
          return (d.schoolid == TAMARACK_ID) ? chartPos.dot : chartPos.hide;
        })
        .attr("class",function(d){
          return "sid_" + d.schoolid;
        })
        .classed("dot narrative milwaukee",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .classed("highlight", function(d){
          return d.schoolid == TAMARACK_ID
        })
        .style("opacity", function(d){
          return (d.schoolid == TAMARACK_ID) ? 1 : NUMBER_LINE_DOT_OPACITY;
        })








    tamarackDot = d3.select(".dot.milwaukee.highlight")
    tamarackLine = d3.select(".lollipop.milwaukee.highlight")

    tdClone = tamarackDot.node().cloneNode(true)
    tlClone = tamarackLine.node().cloneNode(true)

    d3.select(tdClone).classed("beeHide", true).datum(tamarackDot.datum())
    d3.select(tlClone).classed("beeHide", true).datum(tamarackLine.datum())
    
    
    tamarackDot.node().parentNode.appendChild(tdClone)
    tamarackDot.node().parentNode.appendChild(tlClone)
    


    // y domain



    // size domain
    //g append g, y axis
    //g append g, x axis
    // g bind WI data, draw dot

  };




  /**
  * setupSections - each section is activated
  * by a separate function. Here we associate
  * these functions to the sections based on
  * the section's index.
  *
  */
  var setupSections = function (milwaukeeData, chartData, mapData, allDistrictData) {

    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = function(trigger){ topText(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[1] = function(trigger){ showSingleDot(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[2] = function(trigger){ showMedian(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[3] = function(trigger){ showAllDots(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[4] = function(trigger){ showVChart(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[5] = function(trigger){ scaleDotsByPopulation(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[6] = function(trigger){ breakInNarrative(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[7] = function(trigger){ stackSCI(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[8] = function(trigger){ groupedStackedSCI(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[9] = function(trigger){ narrativeBeeSwarm(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[10] = function(trigger){ dispatch.call("changeDistrict", this, getActiveDistrict())  };
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
    unsquishCharts();
    d3.select("#narrativeChooseSchoolContainer")
      .classed("hidden",true)
      .transition()
      .style("height", "0px")
  }
  function toggleChooseSchool(action){
    var drawer = d3.select("#narrativeChooseSchoolContainer"),
        arrow = d3.select("#narrativeChooseSchoolArrow")
    if(drawer.classed("hidden")){
      return false;
    }
    if( (drawer.classed("open") && action != "open") || action == "close"){
      drawer
        .classed("open", false)
        .transition()
        .style("height", "50px")
      arrow
        .transition()
        .style("transform","rotate(0deg)")

    squishCharts();


    }
    else if( (drawer.classed("open") == false && action != "close") || action == "open"){
      var containerHeight = (window.innerHeight * .5 - 25) + "px";
      drawer
        .classed("open", true)
        .transition()
        .style("height", containerHeight)
      arrow
        .transition()
        .style("transform","rotate(180deg)")

      squishCharts();
    }
  }

  d3.select("#narrativeChooseSchoolArrow").on("click", toggleChooseSchool)
  // d3.select("#narrativeChooseSchoolInput").on("input", function(){
  //   toggleChooseSchool();
  //   //do some stuff
  // })


  function getSize(){
    return "desktop"
  }




  function getVWidth(section){
    var size = getSize(),
        margins = getVMargins(section),
        width = 600 - margins.left - margins.right;
    return width

  }
  function getVHeight(section, index){
    var size = getSize(),
        chooseSchoolStatus = getChooseSchoolStatus()
        margins = getVMargins(section, size),
        baseH = (chooseSchoolStatus == "closed" || index > 5) ? 600 : 300;
        if(section == "choose") baseH = 300;
        height = baseH - margins.top - margins.bottom;


    return height
  }
  function getRelativeChartPositions(section, index){
    chooseSchoolStatus = getChooseSchoolStatus()
    scalar = (chooseSchoolStatus == "closed" || index > 5) ? .1 : .15;



    var vH = getVHeight(section, index)
    return {"y1": vH , "y2": vH *.5, "y3": vH * scalar, "dot": vH - 20, "hide" : - 50, "lowM": vH * .5 - 30, "highM": vH * scalar + 10}
  }
  function getVMargins(section){
    var size = getSize()
    var margin = {top: 20, right: 20, bottom: 30, left: 50}
      
    return margin;  
  }
  function getVX(section){
    var width = getVWidth(section),
        margins = getVMargins(section)
  
    var x = d3
      .scaleLinear()
      .range([margins.left, width])
      .domain([0,1])

    return x
  }
  function getVY(section, index, data){
    var height = getVHeight(section, index)
        
    // if()
  
    if(index >= 7){
      height = height *.8
    }

    var yMax = (index >= 7.5) ? 1 : d3.max(data, function(d) { return d.sci; })

    var y = d3
      .scaleLinear()
      .range([height,60])
      .domain([0, yMax]);
    return y
  }

  function unsquishCharts(){
var   data = d3.selectAll(".milwaukee.dot").data(),
y = getVY("narrative", activeIndex, data),
vW = getVWidth("narrative"),
chartPos = getRelativeChartPositions("narrative", activeIndex, data),
margins = getVMargins("narrative")

// if(activeIndex == 1 ){

d3.select(".narrative.v.milwaukee.x.axis")
.transition()
.attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")

d3.select(".narrative.v.milwaukee.y.axis")
// .attr("transform", "translate(" + vMargins.left + ",0)")
// .style("opacity",0)
.transition()
.duration(500)
.call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))


d3.selectAll(".lollipop.narrative.milwaukee")
.transition()
.attr("y1", function(d){ return y(0) })

d3.selectAll(".medianLine.narrative.milwaukee")
.transition()
.attr("y1", chartPos.y1)

}



  

  function squishCharts(){
    var   data = d3.selectAll(".milwaukee.dot").data(),
          y = getVY("narrative", activeIndex, data),
          vW = getVWidth("narrative"),
          margins = getVMargins("narrative")
    
    // if(activeIndex == 1 ){

d3.select(".narrative.v.milwaukee.x.axis")
.transition()
.attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")

  d3.select(".narrative.v.milwaukee.y.axis")
  // .attr("transform", "translate(" + vMargins.left + ",0)")
  // .style("opacity",0)
  .transition()
  .duration(500)
  .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))


        d3.selectAll(".lollipop.narrative.milwaukee")
        .transition()
        .attr("y1", function(d){ return y(0) })

activateFunctions[activeIndex]("squish")

}

  var highestIndex = 0;
  /**
  * showTitle - initial title
  *
  * hides: count title
  * (no previous step to hide)
  * shows: intro title
  *
  */
  function getM(el, allDistrictData){
    if(d3.select(el).classed("milwaukee")){
      return TAMARACK_MEDIAN
    }else{
      var districtData = d3.selectAll(".choose.dot").data()
      return allDistrictData[districtData[0]["districtId"] + "_" + districtData[0]["level"]]["M"]
    }
  }

  function getChartSelector(trigger){
    var chartSelector;
    if(trigger == "squish"){
      chartSelector = ".milwaukee"
    }
    else if(trigger == "scroll"){
      chartSelector = ""
    }
    else if(trigger == "choose"){
      chartSelector = ".choose"
    }
    return chartSelector;
  }
  function topText(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    hideChooseSchool();
  }
  function showSingleDot(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    showChooseSchool();
    var districtData = d3.selectAll(".choose.dot").data()

    var vH = getVHeight("narrative", 1)
    var chartPos = getRelativeChartPositions("narrative",1)
    var x = getVX("narrative");
    var y = getVY("narrative", 1, milwaukeeData);
    // d3.select("#placeholderText").text("just a dot")
        d3.selectAll(".dot.narrative" + chartSelector)
        .transition()
        .attr("cy", function(d){
          return (d3.select(this).classed("highlight")) ? chartPos.dot : chartPos.hide;
        })


      d3.selectAll(".medianLine" + chartSelector)
      .transition()
      .attr("y2", chartPos.y1)
      .attr("y1", chartPos.y1)

      

    d3.selectAll(".medianTextG" + chartSelector)
    .transition()
    .attr("transform", function(){ return "translate(" + (x(getM(this,allDistrictData)) - 50) + "," + (height + 200) + ")" })

    d3.selectAll(".lollipop.narrative" + chartSelector)
        .transition()
        .duration(1000)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(0) })


    d3.select("#narrativeChooseSchoolText").text("a dot for school X")
  }

  function showMedian(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    var districtData = d3.selectAll(".choose.dot").data()

    d3.select("#narrativeChooseSchoolText").text("dot plus median for school X")

        var y = getVY("narrative", 2, milwaukeeData);
        var yC = getVY("choose", 2, districtData)
        var x = getVX("narrative");
        var chartPos = getRelativeChartPositions("narrative",2)
        
        d3.selectAll(".dot.narrative")
        .transition()
        .attr("cy", function(d){
          if(d3.select(this).classed("highlight")){
            // if(d3.select(this).classed("choose")){
              return chartPos.y1 + 20
            // }
          } 
        })

      d3.selectAll(".medianLine"  + chartSelector)
      .transition()
      .attr("y1", chartPos.y1)
      .attr("y2", chartPos.y2)

    d3.selectAll(".medianTextG"  + chartSelector)
    .transition()
    .attr("transform", function(){ return "translate(" + (x(getM(this,allDistrictData)) - 50) + "," + chartPos.lowM + ")" })

d3.selectAll(".lollipop.narrative"  + chartSelector)
        .transition()
        .duration(1000)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(0) })

        d3.selectAll(".dot.narrative" + chartSelector)
        .transition()
        .attr("cy", function(d){
          return (d3.select(this).classed("highlight")) ? chartPos.dot  : chartPos.hide;
        })


  }

  function showAllDots(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    d3.select("#narrativeChooseSchoolText").text("dots on number line for school X")

    var districtData = d3.selectAll(".choose.dot").data()

    var y = getVY("narrative", 3, milwaukeeData);
    var x = getVX("narrative");
    var chartPos = getRelativeChartPositions("narrative",3)

    if(trigger == "scroll"){
      var mLength = milwaukeeData.length,
          dLength = districtData.length




      d3.selectAll(".dot.narrative.milwaukee")
      .transition()
      .duration(400)
      .delay(function(d,i){
        return i*10;
      })
      .attr("cy", function(d){
      return chartPos.dot;
      })
      .attr("cx", function(d) { return x(d.minority_percent); })

      if(dLength > 0){
        d3.selectAll(".dot.narrative.choose")
        .transition()
        .duration(400)
        .delay(function(d,i){

        return ( mLength/dLength * (i+1)*10)
        })
        .attr("cy", function(d){
        return chartPos.dot;
        })
        .attr("cx", function(d) { return x(d.minority_percent); })
      }

    }else{
      d3.selectAll(".dot.narrative" + chartSelector)
      .transition()
      .duration(DEFAULT_TRANSITION_TIME)
      .delay(0)
      .attr("cy", function(d){
        return chartPos.dot;
      })
      .attr("cx", function(d) { return x(d.minority_percent); })
    }


        d3.selectAll(".lollipop.narrative" + chartSelector)
        .transition()
        // .ease(d3.easeElastic)
        .duration(1000)
        // .delay(function(d,i){ return i*10 })
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){
          return y(0)
        })

d3.selectAll(".narrative.v.y.axis" + chartSelector)
  .transition()
  .delay(1300)
  .style("opacity",0)


  }

  function showVChart(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    var districtData = d3.selectAll(".choose.dot").data()

    var y = getVY("narrative", 4, milwaukeeData);
    var yC = getVY("choose", 4, districtData)
    var x = getVX("narrative");
    var chartPos = getRelativeChartPositions("narrative",4)

      if(trigger == "scroll"){
        d3.selectAll(".dot.narrative" + chartSelector)
        .transition()
        .duration(300)
        .attr("r", NARRATIVE_FIXED_R)
        .attr("cy", y(0))
        .attr("cx", function(d) { return x(d.minority_percent); })
        .transition()
        .duration(1000)
        .attr("cy", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.normSci) : y(d.normSci)
        })

        d3.selectAll(".lollipop.narrative" + chartSelector)
        .transition()
        .delay(300)
        .duration(1000)
        .attr("y1", function(d){
          return (d3.select(this).classed("choose")) ? yC(0) : y(0)
        })
        .attr("y2", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.normSci) : y(d.normSci)
        })

      }else{
        d3.selectAll(".dot.narrative" + chartSelector)
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.normSci) : y(d.normSci)
        })

        d3.selectAll(".lollipop.narrative" + chartSelector)
        .transition()
        .delay(0)
        .duration(DEFAULT_TRANSITION_TIME)
        .attr("y1", function(d){
          return (d3.select(this).classed("choose")) ? yC(0) : y(0)
        })
        .attr("y2", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.normSci) : y(d.normSci)
        })


      }



  

d3.selectAll(".narrative.v.y.axis" + chartSelector)
  .transition()
  .delay(1500)
  .style("opacity",1)


      d3.selectAll(".medianLine" + chartSelector)
      .transition()
        .delay((trigger == "scroll") ? 1000 : 0)
  .duration((trigger == "scroll") ? 400 : DEFAULT_TRANSITION_TIME)
  .ease(d3.easeLinear)
      .attr("y2", chartPos.y3)
      .attr("y1", chartPos.y1)


if(trigger == "scroll"){
    d3.selectAll(".medianTextG" + chartSelector)
    .transition()
      .delay(1000)
  .duration(400)
    .ease(d3.easeLinear)
    .attr("transform", function(){ return "translate(" + (x(getM(this,allDistrictData)) - 50) + "," + chartPos.highM + ")"})
    .transition()
    .duration(200)
    .ease(d3.easeLinear)
    .attr("transform", function(){ return "translate(" + (x(getM(this,allDistrictData)) + 10) + "," + chartPos.highM + ")"})
  }else{
    d3.selectAll(".milwaukee.medianTextG")
    .transition()
  .duration(DEFAULT_TRANSITION_TIME)
    .attr("transform",function(){ return "translate(" + (x(getM(this,allDistrictData)) + 10) + "," + chartPos.highM + ")"})

  }

    d3.select("#narrativeChooseSchoolText").text("same size v chart school X")
  }

  function scaleDotsByPopulation(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    showChooseSchool()
    var y = getVY("narrative", 5, milwaukeeData);
    var vW = getVWidth("narrative");
    var chartPos = getRelativeChartPositions("narrative",5)
    var margins = getVMargins("narrative")
    
    var districtData = d3.selectAll(".choose.dot").data()

    var yC = getVY("choose", 4, districtData)


      d3.selectAll(".medianLine" + chartSelector)
      .transition()
        .delay((trigger == "scroll") ? 1000 : 0)
  .duration((trigger == "scroll") ? 400 : DEFAULT_TRANSITION_TIME)
  .ease(d3.easeLinear)
      .attr("y2", chartPos.y3)
      .attr("y1", chartPos.y1)

  d3.selectAll(".narrative.v.y.axis.milwaukee")
  .transition()
  .duration(DEFAULT_TRANSITION_TIME)
  .style("opacity",1)
  .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))

  d3.selectAll(".narrative.v.y.axis.choose")
  .transition()
  .duration(DEFAULT_TRANSITION_TIME)
  .style("opacity",1)
  .call(d3.axisLeft(yC).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))

        d3.select(".narrative.v.milwaukee.x.axis")
        .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",5)) + ")")





if(trigger == "scroll"){
         d3.selectAll(".dot.narrative" + chartSelector)
        .transition()
        .duration(500)
        .delay(function(d,i){
          return 10000/Math.sqrt(d.pop)
        })
        .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
        .attr("cy", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.sci) : y(d.sci)
        })

        d3.selectAll(".lollipop.narrative" + chartSelector)

        .transition()
        .duration((trigger == "scroll") ? 500 : DEFAULT_TRANSITION_TIME)
        .delay(function(d,i){
          return 10000/Math.sqrt(d.pop)
        })
        .attr("y1", function(d){
          return (d3.select(this).classed("choose")) ? yC(0) : y(0)
        })
        .attr("y2", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.sci) : y(d.sci)
        })
}else{
         d3.selectAll(".dot.narrative" + chartSelector)
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
        .delay(0)
        .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
        .attr("cy", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.sci) : y(d.sci)
        })

        d3.selectAll(".lollipop.narrative" + chartSelector)

        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
        .delay(0)
        .attr("y1", function(d){
          return (d3.select(this).classed("choose")) ? yC(0) : y(0)
        })
        .attr("y2", function(d){
          return (d3.select(this).classed("choose")) ? yC(d.sci) : y(d.sci)
        })

}



    d3.select("#narrativeChooseSchoolText").text("v chart school X")
  }
  function breakInNarrative(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    unsquishCharts()
    // squishCharts()
   hideChooseSchool();
         var y = getVY("narrative", 6, milwaukeeData);
         var x = getVX("narrative");
               var vW = getVWidth("narrative");
               var chartPos = getRelativeChartPositions("narrative",6)
               var margins = getVMargins("narrative")

  d3.select(".narrative.v.milwaukee.y.axis")
  // .attr("transform", "translate(" + vMargins.left + ",0)")
  // .style("opacity",0)
  .transition()
  .duration(500)
  .style("opacity",1)
  .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))

         svg
         .selectAll(".dot.narrative.milwaukee")
        .transition()
        // .ease(d3.easeElastic)
        .duration(500)
        .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
        .attr("cy", function(d){
          return y(d.sci)
        })

        d3.selectAll(".lollipop.narrative.milwaukee")
        .transition()
        // .ease(d3.easeElastic)
        .duration(500)

        // .delay(function(d,i){ return i*10 })
        .attr("y2", function(d){
          return y(d.sci)
        })
        .attr("y1", function(d){
          return y(d.sci)
        })
        .attr("y1", function(d){
          return y(0)
        })
        .attr("x1", function(d){ return x(d.minority_percent)})
        .attr("x2", function(d){ return x(d.minority_percent)})
        .style("stroke-width", "1px")



      d3.select(".milwaukee.medianLine")
      .transition()
  .duration(500)
  .style("opacity",1)
.attr("y1", chartPos.y1)

    d3.select(".milwaukee.medianTextG")
          .transition()
  .duration(500)
  .style("opacity",1)

        d3.select(".narrative.v.milwaukee.x.axis")
        .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",6)) + ")")


        d3.selectAll(".lollipop.beeHide").style("opacity",1)

   // d3.select("#placeholderText").text("break in action")
  }
  function stackSCI(milwaukeeData, chartData, mapData,allDistrictData,trigger){


    // d3.select("#placeholderText").text("stacked SCI up to 1")
      var y = getVY("narrative", 7, milwaukeeData);
      var x = getVX("narrative", 7)
      var ySquish = getVY("narrative", 7.5, milwaukeeData);
      var vW = getVWidth("narrative");
      var vMargins = getVMargins("narrative")
         
        var totalY = 0;
        var prevY = false;

          var totalY2 = 0;
        var prevY2 = false;

        var totalYL = 0;
        var prevYL = false;

          var totalY2L = 0;
        var prevY2L = false;

          var totalYR = 0;
        var prevYR = false;

          var totalY2R = 0;
        var prevY2R = false;

        var returnVal, returnVal2, returnValL, returnVal2L, returnValR, returnVal2R;




  d3.select(".narrative.v.milwaukee.y.axis")
  // .attr("transform", "translate(" + vMargins.left + ",0)")
  // .style("opacity",0)
  .transition()
  .duration(500)
  .style("opacity",1)
  .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))
  .transition()
  .delay(200)
  .call(d3.axisLeft(ySquish).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).tickPadding(10))






        d3.selectAll(".lollipop.narrative.milwaukee")
        .transition()
        .duration(500)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(d.sci) })
 .transition()
  .delay(200)
        .attr("y2", function(d){ return ySquish(d.sci) })
        .style("stroke-width", "2px")


            .transition()
            .delay(function(d,i){
              if(10/d.sci < 3000){ return 10/d.sci }
              else{ return 1/d.sci}
            })
            .duration(900)
            
            .attr("y1", function(d,i){
              if(prevY == false){
                prevY = true;
                totalY = d.sci
                return ySquish(0);
              }else{
                prevY = d.sci
                totalY += d.sci
                returnVal = totalY
                // totalY += prevY
                return ySquish(returnVal)
              }
              // totalY += 
              // return totalY


            })
            .attr("y2", function(d,i){
              if(prevY2 == false){
                prevY2 = true;
                totalY2 = d.sci;
                return ySquish(d.sci);
              }else{
                prevY2 = d.sci
                returnVal2 = totalY2
                totalY2 += prevY2
                return ySquish(returnVal2)
              }
            })
              .attr("x1", 200)
              .attr("x2", 200)
            //   .transition()
            // .delay(function(d,i){
            //   if(10/d.sci < 3000){ return 900 - 10/d.sci }
            //   else{ return 900 - 1/d.sci}
            // })
            //   .style("stroke-width", "50px")



         svg
         .selectAll(".dot.narrative.milwaukee")
        .transition()
        // .ease(d3.easeElastic)
        .duration(500)
        .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d){
          return (getVHeight("narrative",7) - 20)
        })

      d3.selectAll(".lollipop.beeHide").style("opacity",0)
      d3.selectAll(".dot.beeHide").style("opacity",1)

      d3.select(".milwaukee.medianLine")
      .transition()
  .duration(500)
  .style("opacity",0)
    d3.select(".milwaukee.medianTextG")
          .transition()
  .duration(500)
  .style("opacity",0)

        d3.select(".narrative.v.milwaukee.x.axis")
        .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",7) + 10) + ")")


  }

  function groupedStackedSCI(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    // d3.select("#placeholderText").text("stacked SCI break out 50/50")

        d3.selectAll(".lollipop.narrative.milwaukee")
        .transition()
        .style("stroke-width", "50px")

  }

  function narrativeBeeSwarm(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    // d3.select("#placeholderText").text("BEES")

    d3.selectAll(".beeHide").style("opacity",0)

function BEES(data){

  var margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      // padding between nodes
      padding = 0,
      maxRadius = 100000,
      numberOfNodes = milwaukeeData.length;


    var y = getVY("narrative", 9, milwaukeeData);
    var x = getVX("narrative");

  // Map the basic node data to d3-friendly format.
  var nodes = data.map(function(node, index) {
    return {
      schoolid: node.schoolid,
      minority_pop: node.minority_pop,
      sci: node.sci,
      type: node.type,
      compareMedian: node.compareMedian,
      minority_percent: node.minority_percent,
      normSci: node.normSci,
      pop: node.pop,
      radius: NARRATIVE_DOT_SCALAR*Math.sqrt(node.pop),
      x: x(node.minority_percent),
      y: (getVHeight("narrative",9) - 20)
    };
  });

    
  var force = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(0))
    // .force('center', d3.forceCenter(margin.left +width/2, height / 2))
    // .force("center", d3.forceCenter().x(x(.5)).y(height/2))

    .force('x', d3.forceX().x(function(d) {
  return d.x;
}))
.force('y', d3.forceY().y(function(d) {
  return (getVHeight("narrative",9) - 20);
}))
    .force('collide', d3.forceCollide(function(d){
      return d.radius
    }))
    .on("tick", tick)
    .stop();


  /**
   * On a tick, apply custom gravity, collision detection, and node placement.
   */
  function tick() {

    for ( i = 0; i < nodes.length; i++ ) {
      var node = nodes[i];
      node.cx = node.x;
      node.cy = node.y;
    }
  }


  /**
   * Run the force layout to compute where each node should be placed,
   * then replace the loading text with the graph.
   */
  function renderGraph() {
    // Run the layout a fixed number of times.
    // The ideal number of times scales with graph complexity.
    // Of course, don't run too long—you'll hang the page!
    const NUM_ITERATIONS = 500;
    force.tick(NUM_ITERATIONS);
    force.stop();


    d3.selectAll(".milwaukee.dot")
      .data(nodes)
    // .enter().append("circle")
      .transition()
      .duration(2500)
      .delay(function(d,i){ return i*2})
      .attr("cx", function(d) { return d.x} )
      .attr("cy", function(d) { return d.y} )
      .attr("r", function(d) { return d.radius } );

  }
  // setTimeout(renderGraph, 10);
  renderGraph()
  // Use a timeout to allow the rest of the page to load first.


}
  BEES(milwaukeeData)



  }




  /**
  * DATA FUNCTIONS
  *
  * Used to coerce the data into the
  * formats we need to visualize
  *
  */


  function preprocessMilwaukeeData(milwaukeeData, allDistrictData) {
    TAMARACK_MEDIAN = allDistrictData[MILWAUKEE_ID + "_" + DEFAULT_LEVEL]["M"]
    MILWAUKEE_SUM = allDistrictData[MILWAUKEE_ID + "_" + DEFAULT_LEVEL]["sum"]

    return milwaukeeData.map(function (d, i) {
      d.pop = +d.pop;
      d.minority_pop = +d.minority_pop;
      d.minority_percent = +d.minority_percent;
      d.sci = +d.sci;
      d.normSci = Math.abs(+d.minority_percent - TAMARACK_MEDIAN)/MILWAUKEE_SUM
      return d;
    }).sort(function(a, b){ return (a.minority_percent < b.minority_percent) ? -1 : 1 })
  }

  function preprocessSchoolData(schoolData, allDistrictData){
    return schoolData.map(function (d, i) {
      districtDatum = allDistrictData[d.districtId + "_" + d.level]
      d.pop = +d.pop;
      d.minority_pop = +d.minority_pop;
      d.minority_percent = +d.minority_percent;
      d.sci = +d.sci;
      d.normSci = Math.abs(+d.minority_percent - districtDatum["M"])/districtDatum["sum"]
      d.compareMedian = (+d.minority_percent < districtDatum["M"]) ? "below" : "above"
      return d;
    }).sort(function(a, b){ return (a.schoolName < b.schoolName) ? -1 : 1 })
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
      activateFunctions[i]("scroll");
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
  if(getInternetExplorerVersion() != -1){
    IS_IE = true;
  }
  // create a new plot and
  // display it
  var plot = scrollVis();

  d3.select('#narrativeVizContainer')
    .style("left", function(){
      if(IS_PHONE()){
        return ( (window.innerWidth - PHONE_VIS_WIDTH - svgMargin.left - svgMargin.right)*.5 ) + "px"
      }
      if(IS_MOBILE()){
        return ( (window.innerWidth - VIS_WIDTH - svgMargin.left - svgMargin.right)*.5 ) + "px"
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



const dataFiles = ["data/charts/csv/wi_schools.csv", "data/charts/csv/all_schools.csv", "data/charts/json/all_districts.json"];
const promises = [];

dataFiles.forEach(function(url, index) {
    promises.push(url.search(".csv") != -1 ? d3.csv(url) : d3.json(url))
});

Promise.all(promises)
.then(function(data) {
    display(data)
    //any code that depends on 'data' goes here
});
