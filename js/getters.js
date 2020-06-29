function getSize(){
  // return "desktop"
  if(IS_MOBILE()) return "mobile"
  else if(IS_PHONE()) return "phone"
  else return "desktop"
}
function getChooseSchoolStatus(){
  var drawer = d3.select("#narrativeChooseSchoolContainer")
  
  if(drawer.classed("open")) return "open"
  else if (drawer.classed("hidden")) return "hidden"
  else return "closed"
}
function getVWidth(section){
  var size = getSize(),
      margins = getVMargins(section),
      w
    if(size == "phone") w = Math.min(screen.width - 70, 600)
    else w= 600
    var width = w - margins.left - margins.right;
  return width
}
function getVHeight(section, index){
  var size = getSize(),
    chooseSchoolStatus = getChooseSchoolStatus(),
    margins = getVMargins(section, size),
    baseH;
  if(section == "explore") baseH = 570;
  else if(size == "phone") baseH = 500;
  else if(section == "narrative"){
    if(index == "squish") baseH = 300
    else if(index == "unsquish") baseH = 600
    else baseH = (chooseSchoolStatus == "closed" || index > 5) ? 600 : 300;
  }
  else if(section == "choose") baseH = 300;
  
  
  height = baseH - margins.top - margins.bottom;
  return height
}
function getRelativeChartPositions(section, index){
  chooseSchoolStatus = getChooseSchoolStatus()
  scalar = (chooseSchoolStatus == "closed" || index > 5) ? .4 : .45;

  var vH = getVHeight(section, index)
  return {"y1": vH , "y2": vH *.5, "y3": vH * scalar, "dot": vH - 20, "hide" : - 50, "lowM": vH * .5 - 30, "highM": vH * scalar + 10}
}
function getVMargins(section){
  var size = getSize()
  var mb = (section == "explore") ? 60 : 33;
  var margin = {top: 20, right: 20, bottom: mb, left: 40}

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

  if(index >= 7){
    height = height *.8
  }
  
  var yMax;
  
  if(index >= 7.5){
    yMax = 1
  }
  else if(data.length > 0 && data[0].districtId == MILWAUKEE_ID){
    yMax = d3.max(data, function(d) { return d.sci; })
  }
  else{
    var sciMax = d3.max(data, function(d) { return d.sci; })
    var normMax = d3.max(data, function(d) { return d.normSci; })
    yMax = Math.max(sciMax, normMax)
  }
  var y = d3
    .scaleLinear()
    .range([height,60])
    .domain([0, yMax]);
  return y
}
function getFixedR(isMilwaukee){
  if(isMilwaukee || typeof(getActiveDistrict()) == "undefined" || typeof(getLevel()) == "undefined"){
    return NARRATIVE_DOT_SCALAR * Math.sqrt(37578 / (116 + 55))
  }else{
    d = getAllDistrictData()[getActiveDistrict() + "_" + getLevel()]
    return NARRATIVE_DOT_SCALAR * Math.sqrt(d.totalPop / (d.aboveSchools + d.belowSchools))
  }
}
function getSchoolData(){
  return d3.select("#schoolDataContainer").datum()
}
function getAllDistrictData(){
  return d3.select("#allDistrictDataContainer").datum()
}
function getActiveDistrict(){
  return  d3.select("#activeDistrict").datum()
}
function getActiveSchool(){
  return d3.select("#activeSchool").datum()
}
function getLevel(){
  return d3.select("#activeLevel").datum();
}
function getSchoolTypes(){
  var returnTypes = []
  ALL_SCHOOL_TYPES.forEach(function(s){
    if(d3.select(".radioContainer." + s).classed("active")) returnTypes.push(s)
  })
  return returnTypes
}
