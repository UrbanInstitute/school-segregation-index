

/**
* scrollVis - encapsulates
* all the code for the visualization
* using reusable charts pattern:
* http://bost.ocks.org/mike/chart/
*/
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.

  // var dotMargin = (IS_PHONE() ) ? PHONE_DOT_MARGIN : DOT_MARGIN;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;


  // main svg used for visualization
  var svg = null;
  var svgChoose = null;
  var svgExplore = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;
  var gChoose = null;
  var gExplore = null;

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

      svg.attr('width', getVWidth("narrative") + svgMargin.left + svgMargin.right);
      svg.attr('height', getVHeight("narrative") + svgMargin.top + svgMargin.bottom );

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = d3.select('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');


      svgChoose = d3.select("#narrativeChooseSchoolChartContainer").append('svg')
      svgChoose.attr('width', getVWidth("narrative") + svgMargin.left + svgMargin.right);
      svgChoose.attr('height', getVHeight("narrative") + svgMargin.top + svgMargin.bottom);
      svgChoose.append('g');

      svgExplore = d3.select("#exploreVChartContainer").append('svg')
      svgExplore.attr('width', getVWidth("explore") + vExploreMargin.left + vExploreMargin.right);
      svgExplore.attr('height', getVHeight("explore") + vExploreMargin.top + vExploreMargin.bottom + 120);
      svgExplore.append('g').attr("id","exploreGroup");

      g = svg.select('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');
      gChoose = svgChoose.select('g')
        .attr('transform', 'translate(' + svgMargin.left + ',' + svgMargin.top + ')');
      gExplore = svgExplore.select('g')
        .attr('transform', 'translate(' + vExploreMargin.left + ',' + vExploreMargin.top + ')');


      var defs = svg.append("defs")
          filterId = "textShadow"
      var filter = defs.append("filter")
        .attr("id", filterId)
        .attr("x", "-30%")
        .attr("y", "-30%")
        .attr("width", "160%")
        .attr("height", "160%")
      filter.append("feGaussianBlur")
        .attr("stdDeviation","2 2")
        .attr("result", filterId)
      feMerge = filter.append("feMerge")
      feMerge.append("feMergeNode")
        .attr("in", filterId)
      feMerge.append("feMergeNode")
        .attr("in", filterId)
      feMerge.append("feMergeNode")
        .attr("in", filterId)
      feMerge.append("feMergeNode")
        .attr("in", filterId)
      feMerge.append("feMergeNode")
        .attr("in", filterId)



      // perform some preprocessing on raw data
      var milwaukeeData = preprocessMilwaukeeData(rawData[0], rawData[2]);
      var schoolData = preprocessSchoolData(rawData[1], rawData[2])
      var allDistrictData = rawData[2]
      var boundaries = rawData[3]

      bindGlobalData(milwaukeeData, schoolData, null, allDistrictData);
      setupVis(milwaukeeData, schoolData, null, allDistrictData);
      setupExploreVis(milwaukeeData, allDistrictData);
      setupSections(milwaukeeData, schoolData, null, allDistrictData);

      setSchoolTypes(ALL_SCHOOL_TYPES)
      dispatch.call("dataLoad", null, boundaries)

    });
  };
  function setupControls(){
    d3.selectAll(".tt-lvl").on("click", function(){
      var level = d3.select(this).attr("data-lvl")
      if(level == getLevel()) return false
      else{
        d3.selectAll(".tt-lvl").classed("active",false)
        d3.select(this).classed("active",true)
        setActiveDistrict(getActiveDistrict(), level, getActiveSchool(), "clickLevel")
      }
    })

    d3.selectAll(".radioContainer").on("click", function(){
      // var schoolTypes = all(),
      var el = d3.select(this);
      var newSchoolTypes = []

      if(el.classed("all")){
        if(el.classed("active")) newSchoolTypes = []
        else newSchoolTypes = ALL_SCHOOL_TYPES

      }else{
        ALL_SCHOOL_TYPES.forEach(function(s){
          if(el.classed(s)){
            if(el.classed("active") == false){
              newSchoolTypes.push(s)
            }
          }else{
            if(d3.select(".radioContainer." + s).classed("active")){
              newSchoolTypes.push(s)
            }
          }
        })
      }
      setSchoolTypes(newSchoolTypes)
    })
  }

  function setupExploreVis(milwaukeeData, allDistrictData){
    setupControls();

    gExplore.selectAll(".explore").remove()

    var x = getVX("explore");
    var y = getVY("explore", 1, milwaukeeData);
    var vH = getVHeight("explore", -1)
    var vW = getVWidth("explore")
    var vMargins = getVMargins("explore")
    var chartPos = getRelativeChartPositions("explore")

    var districtMedian = TAMARACK_MEDIAN

    gExplore.append("line")
      .attr("class", "explore medianLine")
      .attr("x1", x(districtMedian))
      .attr("x2", x(districtMedian))
      .attr("y1", 198)
      .attr("y2", vH)

    gExplore.append("g")
      .attr("class", "v explore y axis exploreBeeHide")
      .attr("transform", "translate(" + vMargins.left + ",0)")
      .call(d3.axisLeft(y)
              .tickSize([-vW + vMargins.left])
              .tickFormat(d3.format(".1%"))
              .tickPadding(10)
            )

    gExplore.append("text")
      .attr("class", "yaxis axis label y explore exploreBeeHide")
      .attr("x",0)
      .attr("y", vMargins.top + 20)
      .text("Segregation Contribution Index")

    var tickCount = (IS_PHONE()) ? 5 : 10
    gExplore.append("g")
      .attr("class", "v explore x axis")
      .attr("transform", "translate(0," + (getVHeight("explore",1)) + ")")
      .call(d3.axisBottom(x)
              .tickFormat(d3.format(".0%"))
              .tickSizeOuter(0)
              .ticks(tickCount)
            );

    gExplore.append("text")
      .attr("x",0)
      .attr("y", vH - vMargins.bottom + 115)
      .attr("x", vW/2 + vMargins.left - 14)
      .attr("text-anchor", "middle")
      .attr("class", "xaxis axis label x explore")
      .text("Black or Hispanic enrollment share")


    gExplore.append("svg:image")
      .attr('x', vW - 114 + 18)
      .attr('y', 50)
      .attr('width', 114)
      .attr('height', 69.3)
      .attr("xlink:href", "images/dot-legend.png")



    gExplore.selectAll(".lollipop.explore")
      .data(milwaukeeData)
      .enter().append("line")
        .attr("x1", function(d) { return x(d.minority_percent); })
        .attr("x2", function(d) { return x(d.minority_percent); })
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(d.sci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop) })
        .attr("class",function(d){
          return d.type + " sid_" + d.schoolId;
        })
        .classed("lollipop explore exploreBeeHide",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })

    gExplore.selectAll(".dot.explore")
      .data(milwaukeeData)
      .enter().append("circle")
        .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d) { return y(d.sci); })
        .attr("class",function(d){
          return d.type + " sid_" + d.schoolId;
        })
        .classed("dot explore",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .style("opacity", V_SHOW_DOT_OPACITY)

    gExplore.append("rect")
      .attr("width", 155)
      .attr("height", 40)
      .attr("x", function(){
        if(IS_PHONE()) return 40
        else return x(districtMedian) - 60
      })
      .attr("y", 185-16)
      .attr("class", "distAvgBg explore")

    gExplore.append("text")
      .attr("class", "exploreMedianText exploreMedianBottomText")
      .text("District")
      .attr("x", function(){
        if(IS_PHONE()) return 40
        else return x(districtMedian) - 60
      })
      .attr("y", 185)

    gExplore.append("text")
      .attr("class", "exploreMedianText exploreMedianPercentText")
      .text(d3.format(".1%")(districtMedian) + " Black or Hispanic")
      .attr("x", function(){
        if(IS_PHONE()) return 40
        else return x(districtMedian) - 60
      })
      .attr("y", 205)

    updateVoronoi("explore", milwaukeeData, milwaukeeData)

  }

  function closeChooseMenu(){
    d3.selectAll("#narrativeChooseSchoolList ul.ui-menu.ui-widget.ui-widget-content.ui-autocomplete.ui-front li").remove()
  }
  function closeExploreMenu(){
    d3.selectAll("#exploreSchoolList ul.ui-menu.ui-widget.ui-widget-content.ui-autocomplete.ui-front li").remove()
  }

  function buildAutocompletes(schoolData, allDistrictData){
    var schoolNames = schoolData
      .map(function(o){
        return {
          "label" : "<div class = 'searchSchool'>" + o.schoolName + "</div><div class = 'searchCity'>" + o.displayCity + ", " + o.state + "</div><div class = 'searchLevel'>" + o.allLevels.split(" ").map(function(o){ return ALL_LEVELS[+o] }).join(", ") + "</div>",
          "value": o.schoolId,
          "search": o.schoolName + " " + o.displayCity + ", " + o.state
        }
      })


    $( "#narrativeChooseSchoolInput" )
      .on("click", function(event, ui){
        event.preventDefault()
        d3.select("#narrativeChooseSchoolInput").node().value = ""
      })
      .autocomplete({
        source: function( request, response ) {
          var words = request.term.toUpperCase().split(" ")

          words = words.map(function(w){ return "(?=.*?" + w + ")"  })

          var matcher = new RegExp(
            "^" + words.join("") + ".*$"
          );
          var rep = new Array();
          var maxRepSize = Math.round(window.innerHeight/ 111); // maximum response size
          var vals = []
          for (var i = 0; i < schoolNames.length; i++) {
            var o = schoolNames[i];
            var text = o.label,
            search = o.search.toUpperCase()
            val = o.value
            if ( vals.indexOf(val) == -1 && text && ( !request.term || matcher.test(search) ) ){
              // add element to result array
              rep.push({
                "label" : text,
                "value": val,
                "option": ""
              });
              vals.push(val)
            }
            else if(!matcher.test(search)){
              closeChooseMenu()
            }
            if ( rep.length > maxRepSize ) {
              //add element at end of list saying how many more search results available
              // rep.push({
              // label: d3.format(",")(schoolNames.length - maxRepSize) + " more schools available" ,
              // value: "maxRepSizeReached",
              // option: "",
              // });
              break;
            }
          }

          // send response
          if(rep.length == 0){
              rep.push({
                "label" : "<div class = 'noSchool'>Can&rsquo;t find your school? To focus only on districts that have enough schools and students to have a chance for integration, we don’t include districts that have fewer than two public schools serving the same grade, enroll fewer than 200 students, or are less than 5 percent Black or Hispanic.</div>",
                "value": "noSchool",
                "option": ""
              });

          }
          response( rep);
        },
        // minLength: 5,
        delay: 0,
        appendTo: "#narrativeChooseSchoolList",
        focus: function(event, ui){
          return false
        },
        select: function(event, ui){
          // d3.select("#narrativeChooseSchoolInput").node().value = ui.label
          event.preventDefault()
          d3.select("#narrativeChooseSchoolInput").node().value = "Search for a school"

          closeChooseMenu()

          if(ui.item.value == "noSchool"){
            return false
          }else{
            if(getChooseSchoolStatus() == "closed"){
              toggleChooseSchool()
            }

            var schoolDatum = schoolData.filter(function(o){ return o.schoolId == ui.item.value })[0]
            var districtData = schoolData.filter(function(o){ return o.districtId == schoolDatum.districtId && o.level == schoolDatum.level })


            setActiveDistrict(schoolDatum.districtId, schoolDatum.level, ui.item.value, "menu")
          }
        }

      })
      .data("ui-autocomplete")._renderItem = function( ul, item ) {
        //custom render function, adds classes to disable/custom style "more schools" option
        var maxSizeClass = (item.value == "maxRepSizeReached") ? " maxRepSizeReached ui-state-disabled" : ""
        return $( "<li>" )
          .addClass("ui-menu-item" + maxSizeClass)
          .append( "<div class = \"ui-menu-item-wrapper" + maxSizeClass + "\">" + item.label + "</div>" )
          .appendTo( ul );
      }





    $( "#exploreSchoolInput" )
      .on("click", function(event, ui){
        event.preventDefault();
        event.stopPropagation();;
        d3.select("#exploreSchoolInput").node().value = ""
      })
      .autocomplete({
        source: function( request, response ) {
          var words = request.term.toUpperCase().split(" ")
          // /^(?=.*?one)(?=.*?\btwo\b)(?=.*?\bthree\b).*$/

          words = words.map(function(w){ return "(?=.*?" + w + ")"  })

          var matcher = new RegExp(
            "^" + words.join("") + ".*$"
          );

          var rep = new Array();
          var maxRepSize = 5; // maximum response size
          var vals = []
          for (var i = 0; i < schoolNames.length; i++) {
            var o = schoolNames[i];
            var text = o.label,
                search = o.search.toUpperCase()
                val = o.value
            if ( vals.indexOf(val) == -1 && text && ( !request.term || matcher.test(search) ) ){
              // add element to result array
              rep.push({
                "label" : text,
                "value": val,
                "option": ""
              });
              vals.push(val)
            }
            else if(!matcher.test(search)){
              closeExploreMenu()
            }
            if ( rep.length > maxRepSize ) {
              //add element at end of list saying how many more search results available
              // rep.push({
              // label: d3.format(",")(schoolNames.length - maxRepSize) + " more schools available" ,
              // value: "maxRepSizeReached",
              // option: "",
              // });
              break;
            }
          }
          if(rep.length == 0){
              rep.push({
                "label" : "<div class = 'noSchool'>Can&rsquo;t find your school? To focus only on districts that have enough schools and students to have a chance for integration, we don’t include districts that have fewer than two public schools serving the same grade, enroll fewer than 200 students, or are less than 5 percent Black or Hispanic.</div>",
                "value": "noSchool",
                "option": ""
              });

          }
          // send response
          response( rep);
        },
        // minLength: 5,
        delay: 0,
        appendTo: "#exploreSchoolList",
        focus: function(event, ui){
          return false
        },
        select: function(event, ui){
          // d3.select("#narrativeChooseSchoolInput").node().value = ui.label
          event.preventDefault()
          d3.select("#exploreSchoolInput").node().value = "Search for a school"
          d3.select("#exploreContainer").style("display", "block")
          closeExploreMenu()

          if(ui.item.value == "noSchool"){
            return false
          }else{

            var schoolDatum = schoolData.filter(function(o){ return o.schoolId == ui.item.value })[0]
            var districtData = schoolData.filter(function(o){ return o.districtId == schoolDatum.districtId && o.level == schoolDatum.level })

            setActiveDistrict(schoolDatum.districtId, schoolDatum.level, ui.item.value, "menu")
          }
        }
      })
      .data("ui-autocomplete")._renderItem = function( ul, item ) {
        //custom render function, adds classes to disable/custom style "more schools" option
        var maxSizeClass = (item.value == "maxRepSizeReached") ? " maxRepSizeReached ui-state-disabled" : ""

        return $( "<li>" )
          .addClass("ui-menu-item" + maxSizeClass)
          .append( "<div class = \"ui-menu-item-wrapper" + maxSizeClass + "\">" + item.label + "</div>" )
          .appendTo( ul );
      }

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

    buildAutocompletes(schoolData, allDistrictData)

    g.append("text")
      .attr("id", "placeholderText")

    var x = getVX("narrative");
    var y = getVY("narrative", 1, milwaukeeData);
    var vH = getVHeight("narrative", -1)
    var vW = getVWidth("narrative")
    var vMargins = getVMargins("narrative")
    var chartPos = getRelativeChartPositions("narrative")


    g.append("line")
      .attr("class", "milwaukee medianLine narrative")
      .attr("x1", x(TAMARACK_MEDIAN))
      .attr("x2", x(TAMARACK_MEDIAN))
      .attr("y1", chartPos.y1)
      .attr("y2", chartPos.y1)

    g.append("g")
      .attr("class", "narrative v milwaukee y axis")
      .attr("transform", "translate(" + vMargins.left + ",0)")
      .style("opacity",0)
      .call(d3.axisLeft(y).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".0%")).ticks(7).tickPadding(10))

    g.append("text")
      .attr("class", "yaxis axis label y main narrative")
      .attr("x",0)
      .attr("y", vMargins.top + 20)
      .text("Segregation Contribution Index")
      .style("opacity",0)

    var tickCount = (IS_PHONE()) ? 5 : 10
    g.append("g")
      .attr("class", "narrative v milwaukee x axis")
      .attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")
      .call(d3.axisBottom(x)
        // .tickFormat(d3.format(".0%"))
        .tickSizeOuter(0)
        .ticks(tickCount,".0%")
      )

    g.append("text")
      .attr("x",0)
      .attr("y", vH - vMargins.bottom + 80)
      .attr("x", vW/2 + vMargins.left/2)
      .attr("text-anchor", "middle")
      .attr("class", "xaxis axis label x main narrative")
      .text("Black or Hispanic enrollment share")

    var avgG = g.append("g")
      .attr("class", "milwaukee medianTextG narrative")
      .datum(TAMARACK_MEDIAN)
      .attr("transform", "translate(" + (x(TAMARACK_MEDIAN) - 50) + "," + (svgHeight + 400) + ")")

    avgG.append("rect")
      .attr("width", 155)
      .attr("height", 40)
      .attr("y", -16)
      .attr("class", "distAvgBg narrative")

    avgG.append("text")
      .attr("class", "milwaukee districtAverage label narrative")
      .html("District")
      .attr("x",0)
      .attr("y",0)

    avgG.append("text")
      .attr("class", "milwaukee districtAverage value")
      .text(d3.format(".0%")(TAMARACK_MEDIAN) + " Black or Hispanic")
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
          return d.type + " sid_" + d.schoolId;
        })
        .classed("lollipop narrative milwaukee",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .classed("highlight", function(d){
          return d.schoolId == TAMARACK_ID
        })

    g.selectAll(".dot.narrative.milwaukee")
      .data(milwaukeeData)
      .enter().append("circle")
        .attr("cy", function(d){
          return (d.schoolId == TAMARACK_ID) ? getFixedR(false) : 0;
        })
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy",  chartPos.dot )
        .attr("class",function(d){
          return d.type + " sid_" + d.schoolId;
        })
        .classed("dot narrative milwaukee",true)
        .classed("belowMedian", function(d){
          return d.compareMedian == "below"
        })
        .classed("aboveMedian", function(d){
          return d.compareMedian == "above"
        })
        .classed("highlight", function(d){
          return d.schoolId == TAMARACK_ID
        })
        .style("opacity", function(d){
          return (d.schoolId == TAMARACK_ID) ? 1 : V_SHOW_DOT_OPACITY;
        })

    var overSci = g.append("g")
      .attr("class", "directLabel over sci")
      .attr("transform", "translate(" + x(.34) + "," + 139.5 + ")")
      .style("opacity",0)

    overSci.append("rect")
      .attr("width", 73)
      .attr("height",2)
      .attr("x", 17)
      .attr("y", 25)

    overSci.append("text")
      .attr("x", 19)
      .attr("y", 21)
      .text("50% of SCI")

    var underSci = g.append("g")
      .attr("class", "directLabel under sci")
      .attr("transform", "translate(" + x(.34) + "," + 329.5 + ")")
      .style("opacity",0)

    underSci.append("rect")
      .attr("width", 73)
      .attr("height",2)
      .attr("x", 17)
      .attr("y", 25)

    underSci.append("text")
      .attr("x", 19)
      .attr("y", 21)
      .text("50% of SCI")

    var dlup = (IS_PHONE()) ? -.05 : .17;
    var dlupy = (IS_PHONE()) ? 429.5 : 479.5;
    var underPop = g.append("g")
      .attr("class", "directLabel under pop")
      .attr("transform", "translate(" + x(dlup) + "," + dlupy + ")")
      .style("opacity",0)

    underPop.append("rect")
      .attr("width", 175)
      .attr("height",2)
      .attr("x", 17)
      .attr("y", 25)

    underPop.append("text")
      .attr("class", "explore textShadow")
      .attr("x", 19)
      .attr("y", 21)
      .text("33% of students, 52 schools")

    underPop.append("text")
      .attr("x", 19)
      .attr("y", 21)
      .text("33% of students, 52 schools")

    var dlop = (IS_PHONE()) ? .13 : .7;
    var dlopy = (IS_PHONE()) ? 372.5 : 452.5;
    var overPop = g.append("g")
      .attr("class", "directLabel over pop")
      .attr("transform", "translate(" + x(dlop) + "," + dlopy + ")")
      .style("opacity",0)

    overPop.append("rect")
      .attr("width", 183)
      .attr("height",2)
      .attr("x", 17)
      .attr("y", 25)

    overPop.append("text")
      .attr("class", "explore textShadow")
      .attr("x", 19)
      .attr("y", 21)
      .text("67% of students, 120 schools")
    overPop.append("text")
      .attr("x", 19)
      .attr("y", 21)
      .text("67% of students, 120 schools")

    tamarackDot = d3.select(".dot.milwaukee.highlight")
    tamarackLine = d3.select(".lollipop.milwaukee.highlight")

    tdClone = tamarackDot.node().cloneNode(true)
    tlClone = tamarackLine.node().cloneNode(true)

    d3.select(tdClone).classed("beeHide", true).datum(tamarackDot.datum())
    d3.select(tlClone).classed("beeHide", true).datum(tamarackLine.datum())

    tamarackDot.node().parentNode.appendChild(tdClone)
    tamarackDot.node().parentNode.appendChild(tlClone)

    setSchoolTypes(ALL_SCHOOL_TYPES)
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
    activateFunctions[8] = function(trigger){ narrativeBeeSwarm(milwaukeeData, chartData, mapData,allDistrictData,trigger) };
    activateFunctions[9] = function(trigger){ lastSection(milwaukeeData, chartData, mapData,allDistrictData,trigger);}
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

  function showChooseSchool(){

    var drawerHeight;
    if(IS_MOBILE()){
      drawerHeight = window.innerHeight - 120
    }
    else if(IS_PHONE()){
      drawerHeight = 0
    }else{
      drawerHeight = window.innerHeight * .5 - 25
    }

    svg.transition()
      .style("margin-top", "-130px")

    if(activeIndex == 1){
      var containerHeight = (getChooseSchoolStatus() == "open") ? (drawerHeight) + "px" : "150px"

      svg.transition()
        .style("margin-top",(getChooseSchoolStatus() == "open") ?  "0px" : "-130px")

      d3.select("#narrativeChooseSchoolContainer")
        .classed("hidden",false)
        .classed("teaser",getChooseSchoolStatus() != "open")
        .transition()
          .style("height", containerHeight)
      d3.select("#narrativeChooseSchoolList")
        .classed("open", (getChooseSchoolStatus() == "open"))
        .classed("teaser", !(getChooseSchoolStatus() == "open"))
      
      var tOpacity = (getChooseSchoolStatus() == "open") ? 1 : 0;
      d3.select("#narrativeChooseSchoolTextContainer").style("opacity",tOpacity);

      dispatch.call("reset")
    }else{
      svg.transition()
        .style("margin-top","0px")

      var containerHeight = (getChooseSchoolStatus() == "open") ? (drawerHeight) + "px" : "50px"

      d3.select("#narrativeChooseSchoolContainer")
        .classed("hidden",false)
        .classed("teaser",false)
        .transition()
          .style("height", containerHeight)

      dispatch.call("reset")
    }

  }

  function hideChooseSchool(){
    closeChooseMenu()
    unsquishCharts("narrative")

    d3.select("#narrativeChooseSchoolContainer")
      .classed("hidden",true)
      .classed("teaser",false)
      .transition()
        .style("height", "0px")

    dispatch.call("reset")
  }
  function toggleChooseSchool(action){
    closeChooseMenu()

    var drawer = d3.select("#narrativeChooseSchoolContainer"),
        arrow = d3.select("#narrativeChooseSchoolArrow img")

    if(IS_MOBILE()){
      drawerHeight = window.innerHeight - 120
    }
    else if(IS_PHONE()){
      drawerHeight = 0
    }else{
      drawerHeight = window.innerHeight * .5 - 25
    }


    if(drawer.classed("hidden")){
      return false;
    }
    if( (drawer.classed("open") && action != "open") || action == "close"){
      d3.select("#narrativeChooseSchoolTextContainer").style("opacity",0)
      svgChoose.style("opacity",0)
      drawer
        .classed("open", false)
        .transition()
        .style("height", "50px")

      arrow
        .transition()
        .style("transform","rotate(0deg)")

      d3.select("#narrativeChooseSchoolList").classed("open", false).classed("teaser", false)

      unsquishCharts("toggle");
    }
    else if( (drawer.classed("open") == false && action != "close") || action == "open"){
      d3.select("#narrativeChooseSchoolTextContainer").style("opacity",1)
      svgChoose.style("opacity",1)

      var containerHeight = (drawerHeight) + "px";

      drawer
        .classed("open", true)
        .transition()
          .style("height", containerHeight)

      arrow
        .transition()
        .style("transform","rotate(180deg)")

      d3.select("#narrativeChooseSchoolList").classed("open", true).classed("teaser", false)

      squishCharts();
    }
    dispatch.call("reset")
  }

  d3.select("#narrativeChooseSchoolArrow").on("click",function(){
    if(d3.selectAll(".dot.choose").data().length == 0){
      return false
    }else{
      toggleChooseSchool()
    }
  })

  function unsquishCharts(trigger){
    var   data = d3.selectAll(".milwaukee.dot").data(),
          y = getVY("narrative", activeIndex, data),
          vW = getVWidth("narrative"),
          chartPos = getRelativeChartPositions("narrative", activeIndex, data),
          margins = getVMargins("narrative")

    // if(activeIndex == 1 ){
    d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative","unsquish")) + ")")

    d3.select(".xaxis.axis.label.x.main.narrative")
      .transition()
        .attr("y", (getVHeight("narrative","unsquish") - margins.bottom + 80))

    d3.select(".narrative.v.milwaukee.y.axis")
      .transition()
        .duration(500)
        .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".0%")).ticks(7).tickPadding(10))

    d3.selectAll(".lollipop.narrative.milwaukee")
      .transition()
        .attr("y1", function(d){ return y(0) })

    d3.selectAll(".medianLine.narrative.milwaukee")
      .transition()
      .attr("y1", chartPos.y1)

    d3.select("#dotLegend")
      .transition()
      .style("right", "60px")


    if(trigger == "toggle"){
      activateFunctions[activeIndex]("squish")
    }
  }

  function squishCharts(){
    var   data = d3.selectAll(".milwaukee.dot").data(),
          y = getVY("narrative", activeIndex, data),
          vW = getVWidth("narrative"),
          margins = getVMargins("narrative")

    d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative","squish")) + ")")

    d3.select(".xaxis.axis.label.x.main.narrative")
      .transition()
        .attr("y", (getVHeight("narrative","squish") - margins.bottom + 80))

    d3.select(".narrative.v.milwaukee.y.axis")
      .transition()
        .duration(500)
        .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".0%")).ticks(7).tickPadding(10))

    d3.selectAll(".lollipop.narrative.milwaukee")
      .transition()
        .attr("y1", function(d){ return y(0) })


    d3.select("#dotLegend")
      .transition()
      .style("right", "180px")


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
  function getChartSelector(trigger){
    var chartSelector;
    if(trigger == "squish"){
      chartSelector = ".milwaukee"
    }
    else if(trigger == "scroll"){
      chartSelector = ".narrative"
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
    var margins = getVMargins("narrative")

    d3.selectAll(".dot.narrative")
      .transition()
        .attr("r", function(d){
          return (d3.select(this).classed("highlight")) ? getFixedR(false) : 0;
        })
        .attr("cy", chartPos.dot)

    d3.selectAll(".medianLine" + chartSelector)
      .transition()
        .attr("y2", chartPos.y1)
        .attr("y1", chartPos.y1)

    d3.selectAll(".medianTextG")
      .transition()
        .attr("transform", function(d){
          if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + (height + 200) + ")"
          else return "translate(" + (x(d) - 50) + "," + (height + 200) + ")"
        })

    d3.selectAll(".lollipop" + chartSelector)
      .transition()
      .duration(1000)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(0) })

    updateChooseText(activeIndex)

  d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",1)) + ")")

  d3.select(".xaxis.axis.label.x.main.narrative")
    .transition()
      .style("opacity",1)
      .attr("y", (getVHeight("narrative",1) - margins.bottom + 80))



  }

  function showMedian(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    var districtData = d3.selectAll(".choose.dot").data()

    showChooseSchool();

    updateChooseText(activeIndex)

    var y = getVY("narrative", 2, milwaukeeData);
    var yC = getVY("choose", 2, districtData)
    var x = getVX("narrative");
    var chartPos = getRelativeChartPositions("narrative",2)
    var margins = getVMargins("narrative")

    d3.selectAll(".dot.narrative")
      .transition()
      .attr("cy", chartPos.dot)
      .attr("r", function(d){
        return (d3.select(this).classed("highlight")) ? getFixedR(false)  : 0;
      })

    d3.selectAll(".medianLine.narrative")
      .transition()
        .attr("y1", chartPos.y1)
        .attr("y2", chartPos.y2)

    d3.selectAll(".medianTextG")
      .transition()
        .attr("transform", function(d){
          if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.lowM + ")"
          return "translate(" + (x(d) - 50) + "," + chartPos.lowM + ")"
        })

    d3.selectAll(".lollipop"  + chartSelector)
      .transition()
      .duration(1000)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(0) })


  d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",2)) + ")")

  d3.select(".xaxis.axis.label.x.main.narrative")
    .transition()
      .style("opacity",1)
      .attr("y", (getVHeight("narrative",2) - margins.bottom + 80))



  }

  function showAllDots(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    updateChooseText(activeIndex)

    var districtData = d3.selectAll(".choose.dot").data()
    var y = getVY("narrative", 3, milwaukeeData);
    var x = getVX("narrative");
    var chartPos = getRelativeChartPositions("narrative",3)
    var margins = getVMargins("narrative")

    if(trigger == "scroll"){
      var mLength = milwaukeeData.length,
      dLength = districtData.length

      d3.selectAll(".dot.narrative.highlight")
        .transition()
        .duration(0)
        .attr("cy", chartPos.dot)

      d3.selectAll(".dot.narrative:not(.highlight)")
        .transition()
        .duration(0)
        .attr("cy", chartPos.dot)
        .attr("r",0)
        .transition()
        .duration(12500)
          .delay(function(d,i){
            return i*10;
          })
          .ease(d3.easeElastic)
          .attr("r", getFixedR(false))
          .attr("cx", function(d) { return x(d.minority_percent); })

      if(dLength > 0){
        d3.selectAll(".dot.narrative.choose.highlight")
          .attr("cy", chartPos.dot)

        d3.selectAll(".dot.narrative.choose:not(.highlight)")
        .attr("cy", chartPos.dot)
        .attr("r",0)
        .transition()
        .duration(5500)
        .delay(function(d,i){
          return ( mLength/dLength * (i+1)*10)
        })
          .ease(d3.easeElastic)
          .attr("r", getFixedR(false))
          .attr("cx", function(d) { return x(d.minority_percent); })
      }

    }else{
      d3.selectAll(".dot.narrative")
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
        // .delay(0)
          .attr("cy", function(d){
            return chartPos.dot;
          })
          .attr("cx", function(d) { return x(d.minority_percent); })
          .attr("r", getFixedR(false))
    }

    d3.selectAll(".medianLine.narrative")
      .transition()
        .attr("y1", chartPos.y1)
        .attr("y2", chartPos.y2)

    d3.selectAll(".medianTextG")
      .transition()
        .attr("transform", function(d){
          if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.lowM + ")"
          return "translate(" + (x(d) - 50) + "," + chartPos.lowM + ")"
        })

    d3.selectAll(".lollipop" + chartSelector)
      .transition()
      .duration(1000)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){
          return y(0)
        })

    d3.selectAll(".v.y.axis")
      .transition()
      .delay(1300)
        .style("opacity",0)

    d3.selectAll(".y.axis.label.main")
      .transition()
      .delay(1300)
        .style("opacity",0)

  d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",3)) + ")")

  d3.select(".xaxis.axis.label.x.main.narrative")
    .transition()
      .style("opacity",1)
      .attr("y", (getVHeight("narrative",3) - margins.bottom + 80))


  }

  function showVChart(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    var districtData = d3.selectAll(".choose.dot").data()


    d3.select("#dotLegend")
      .classed("show", false)


    var y = getVY("narrative", 4, milwaukeeData);
    var yC = getVY("choose", 4, districtData)
    var x = getVX("narrative");
    var chartPos = getRelativeChartPositions("narrative",4)

    if(trigger == "scroll"){
      d3.selectAll(".dot" + chartSelector)
        .transition()
        .duration(300)
          .attr("r", getFixedR(false))
          .attr("cy", y(0))
          .attr("cx", function(d) { return x(d.minority_percent); })
          .transition()
          .duration(1000)
            .attr("cy", function(d){
              return (d3.select(this).classed("choose")) ? yC(d.normSci) : y(d.normSci)
            })

      d3.selectAll(".lollipop" + chartSelector)
        .transition()
        .delay(300)
        .duration(1000)
          .attr("x1", function(d) { return x(d.minority_percent); })
          .attr("x2", function(d) { return x(d.minority_percent); })
          .style("stroke-width", "1px")
          .attr("y1", function(d){
            return (d3.select(this).classed("choose")) ? yC(0) : y(0)
          })
          .attr("y2", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.normSci) + NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop) : y(d.normSci) + NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)
          })

    }else{
      d3.selectAll(".dot" + chartSelector)
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
          .attr("cx", function(d) { return x(d.minority_percent); })
          .attr("cy", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.normSci) : y(d.normSci)
          })

      d3.selectAll(".lollipop" + chartSelector)
        .transition()
        .delay(0)
        .duration(DEFAULT_TRANSITION_TIME)
          .attr("y1", function(d){
            return (d3.select(this).classed("choose")) ? yC(0) : y(0)
          })
          .attr("y2", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.normSci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop) : y(d.normSci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)
          })
          .attr("x1", function(d) { return x(d.minority_percent); })
          .attr("x2", function(d) { return x(d.minority_percent); })
          .style("stroke-width", "1px")
    }

    d3.selectAll(".v.y.axis")
      .transition()
      .delay(1500)
        .style("opacity",1)

    d3.selectAll(".y.axis.label.main")
      .transition()
      .delay(1500)
        .style("opacity",1)

    d3.selectAll(".medianLine.narrative")
      .transition()
      .delay((trigger == "scroll") ? 1000 : 0)
      .duration((trigger == "scroll") ? 400 : DEFAULT_TRANSITION_TIME)
      .ease(d3.easeLinear)
        .attr("y2", chartPos.y3)
        .attr("y1", chartPos.y1)

    if(trigger == "scroll"){
      d3.selectAll(".medianTextG")
        .transition()
        .delay(1000)
        .duration(400)
        .ease(d3.easeLinear)
          .attr("transform", function(d){
            if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.highM + ")"
            else return "translate(" + (x(d) - 50) + "," + chartPos.highM + ")"
          })
          .transition()
          .duration(200)
            .ease(d3.easeLinear)
            .attr("transform", function(d){
              if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.highM + ")"
              else return "translate(" + (x(d) + 10) + "," + chartPos.highM + ")"
            })
    }else{
      d3.selectAll(".medianTextG")
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
            .attr("transform", function(d){
              if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.highM + ")"
              else return "translate(" + (x(d) + 10) + "," + chartPos.highM + ")"
            })
    }

  var margins = getVMargins("narrative")

  d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",4)) + ")")

  d3.select(".xaxis.axis.label.x.main.narrative")
    .transition()
      .style("opacity",1)
      .attr("y", (getVHeight("narrative",4) - margins.bottom + 80))


    updateChooseText(activeIndex)
  }

  function scaleDotsByPopulation(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    var chartSelector = getChartSelector(trigger)
    showChooseSchool()
    d3.select("#dotLegend")
      .classed("show", true)
      .transition()
      .style("right", function(){
        return (getChooseSchoolStatus() == "open") ? "180px" : "60px"
      })

    var y = getVY("narrative", 5, milwaukeeData);
    var x = getVX("narrative");
    var vW = getVWidth("narrative");
    var chartPos = getRelativeChartPositions("narrative",5)
    var margins = getVMargins("narrative")

    var districtData = d3.selectAll(".choose.dot").data()

    var yC = getVY("choose", 4, districtData)

    d3.selectAll(".medianLine.narrative")
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
        .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".0%")).ticks(7).tickPadding(10))

    d3.selectAll(".narrative.v.y.axis.choose")
      .transition()
      .duration(DEFAULT_TRANSITION_TIME)
        .style("opacity",1)
        .call(d3.axisLeft(yC).tickSize([-vW + margins.left]).tickFormat(d3.format(".1%")).ticks(7).tickPadding(10))

    d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",5)) + ")")

    d3.select(".xaxis.axis.label.x.main.narrative")
      .transition()
        .style("opacity",1)
        .attr("y", (getVHeight("narrative",5) - margins.bottom + 80))

    if(trigger == "scroll"){
      d3.selectAll(".dot" + chartSelector)
        .transition()
        .duration(500)
        .delay(function(d,i){
          return 10000/Math.sqrt(d.pop)
        })
          .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
          .attr("cy", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.sci) : y(d.sci)
          })

      d3.selectAll(".lollipop" + chartSelector)
        .transition()
        .duration((trigger == "scroll") ? 500 : DEFAULT_TRANSITION_TIME)
        .delay(function(d,i){
          return 10000/Math.sqrt(d.pop)
        })
          .attr("y1", function(d){
            return (d3.select(this).classed("choose")) ? yC(0) : y(0)
          })
          .attr("y2", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.sci) + NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop): y(d.sci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)
          })
          .attr("x1", function(d) { return x(d.minority_percent); })
          .attr("x2", function(d) { return x(d.minority_percent); })
          .style("stroke-width", "1px")

    }else{
      d3.selectAll(".dot" + chartSelector)
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
        .delay(0)
          .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
          .attr("cy", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.sci) : y(d.sci)
          })

      d3.selectAll(".lollipop" + chartSelector)
        .transition()
        .duration(DEFAULT_TRANSITION_TIME)
        .delay(0)
          .attr("y1", function(d){
            return (d3.select(this).classed("choose")) ? yC(0) : y(0)
          })
          .attr("y2", function(d){
            return (d3.select(this).classed("choose")) ? yC(d.sci) + NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop): y(d.sci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)
          })
          .attr("x1", function(d) { return x(d.minority_percent); })
          .attr("x2", function(d) { return x(d.minority_percent); })
          .style("stroke-width", "1px")
    }
    d3.selectAll(".medianTextG")
      .transition()
      .duration(DEFAULT_TRANSITION_TIME)
          .style("opacity",1)
          .attr("transform", function(d){
            if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.highM + ")"
            else return "translate(" + (x(d) + 10) + "," + chartPos.highM + ")"
          })
    updateChooseText(activeIndex)
  }

  function breakInNarrative(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    unsquishCharts("narrative")
    updateChooseText(activeIndex)
    hideChooseSchool();

    var y = getVY("narrative", 6, milwaukeeData);
    var x = getVX("narrative");
    var vW = getVWidth("narrative");
    var chartPos = getRelativeChartPositions("narrative",6)
    var margins = getVMargins("narrative")

    d3.select(".narrative.v.milwaukee.y.axis")
      .transition()
      .duration(500)
        .style("opacity",1)
        .call(d3.axisLeft(y).tickSize([-vW + margins.left]).tickFormat(d3.format(".0%")).ticks(7).tickPadding(10))

    svg.selectAll(".dot.narrative.milwaukee")
    .transition()
    .duration(500)
      .attr("r", function(d){return NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)})
      .attr("cy", function(d){
        return y(d.sci)
      })

    d3.selectAll(".lollipop.narrative.milwaukee")
      .transition()
      .duration(500)
        .attr("y2", function(d){
          return y(d.sci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop)
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
        .attr("y2", chartPos.y3)
        .attr("y1", chartPos.y1)

    d3.select(".milwaukee.medianTextG")
      .transition()
      .duration(500)
          .style("opacity",1)
          .attr("transform", function(d){
            if(IS_PHONE()) return "translate(" + (x(d) - 80) + "," + chartPos.highM + ")"
            else return "translate(" + (x(d) + 10) + "," + chartPos.highM + ")"
          })

    d3.select(".narrative.v.milwaukee.x.axis")
      .transition()
        .attr("transform", "translate(0," + (getVHeight("narrative",6)) + ")")

    d3.selectAll(".lollipop.beeHide").style("opacity",1)
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
      .transition()
      .duration(500)
        .style("opacity",1)
        .call(d3.axisLeft(y).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".0%")).ticks(7).tickPadding(10))
          .transition()
          .delay(200)
            .call(d3.axisLeft(ySquish).tickSize([-vW + vMargins.left]).tickFormat(d3.format(".0%")).ticks(10).tickPadding(10))

    d3.selectAll(".lollipop.narrative.milwaukee")
      .transition()
      .duration(500)
        .attr("y1", function(d){ return y(0) })
        .attr("y2", function(d){ return y(d.sci)+ NARRATIVE_DOT_SCALAR*Math.sqrt(d.pop) })
        .transition()
        .delay(200)
          .attr("y2", function(d){ return ySquish(d.sci) })
          .style("stroke-width", "10px")
          .transition()
          .delay(function(d,i){
            return .5/d.sci
          })
          .duration(1200)
            .attr("x1", 200)
            .attr("x2", 200)
            .attr("y1", function(d,i){
              if(prevY == false){
                prevY = true;
                totalY = d.sci
                return ySquish(0);
              }else{
                prevY = d.sci
                totalY += d.sci
                returnVal = totalY
                return ySquish(returnVal)
              }
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

    svg.selectAll(".dot.narrative.milwaukee")
      .transition()
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

    d3.selectAll(".directLabel")
      .transition()
        .style("opacity",0)
  }

  function narrativeBeeSwarm(milwaukeeData, chartData, mapData,allDistrictData,trigger){
    d3.selectAll(".beeHide").style("opacity",0)
    d3.selectAll(".directLabel")
      .transition()
      .delay(2000)
      .duration(700)
        .style("opacity",1)

    BEES(milwaukeeData, "narrative")
  }

  function lastSection(){
    setActiveDistrict(getActiveDistrict(), getLevel(), getActiveSchool(), "scroll")
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
    return milwaukeeData
      .map(function (d, i) {
        districtDatum = allDistrictData[d.districtId + "_" + d.level]
        if(districtDatum["M"])
        d.pop = +d.pop;
        d.minority_pop = +d.minority_pop;
        d.minority_percent = +d.minority_percent;
        d.sci = +d.sci;
        d.normSci = Math.abs(+d.minority_percent - districtDatum["M"])/districtDatum["sum"]
        d.compareMedian = (+d.minority_percent < districtDatum["M"]) ? "below" : "above"
        d.type = d.type;
        d.schoolName = d.schoolName;
        d.lon = +d.lon;
        d.lat = +d.lat;
        d.level = d.level;
        d.allLevels= d.allLevels;
        d.neighbor_minority_percent = +d.neighbor_minority_percent
        d.displayCity = d.cityName
        return d;
      })
      .sort(function(a, b){ return (a.minority_percent < b.minority_percent) ? -1 : 1 })
      .filter(function(o){ return o.level == DEFAULT_LEVEL })

    // var minMax = d3.extent(milwaukeeData, function(d){ return d.pop }),
    //   minRadius = NARRATIVE_DOT_SCALAR*Math.sqrt(minMax[0]),
    //   maxRadius = NARRATIVE_DOT_SCALAR*Math.sqrt(minMax[1])
  }

  function preprocessSchoolData(schoolData, allDistrictData){
    return schoolData
      .map(function (d, i) {
        districtDatum = allDistrictData[d.districtId + "_" + d.level]
        d.pop = +d.pop;
        d.minority_pop = +d.minority_pop;
        d.minority_percent = +d.minority_percent;
        d.sci = +d.sci;
        d.normSci = Math.abs(+d.minority_percent - districtDatum["M"])/districtDatum["sum"]
        d.compareMedian = (+d.minority_percent < districtDatum["M"]) ? "below" : "above"
        d.type = d.type;
        d.schoolName = d.schoolName;
        d.lon = +d.lon;
        d.lat = +d.lat;
        d.level = d.level;
        d.allLevels= d.allLevels;
        d.neighbor_minority_percent = +d.neighbor_minority_percent
        d.district = d.distName
        d.displayCity = d.cityName;

        return d;
      })
      .sort(function(a, b){ return (a.schoolName < b.schoolName) ? -1 : 1 })
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
// var scroll;
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
    d3.select("#exploreVChartContainer svg").remove()
    display(rawData)
  })

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    var offOpacity = (IS_MOBILE() || IS_PHONE()) ? 1 : .1
    d3.selectAll('.step')
      .style('opacity', function (d, i) {
        return (i === index) ? 1 : offOpacity;
      });
    // activate current section
    plot.activate(index);

  });

}
const dataFiles = ["data/charts/csv/wi_schools.csv", "data/charts/csv/all_schools.csv", "data/charts/json/all_districts.json", "data/mapping/schoolDistricts/boundaries/boundaries.csv"];
const promises = [];

dataFiles.forEach(function(url, index) {
  promises.push(url.search(".csv") != -1 ? d3.csv(url) : d3.json(url))
});

Promise.all(promises)
  .then(function(data) {
    display(data)
  });
