function SEEB(data){

d3.selectAll(".exploreBeeHide").transition().duration(2500).style("opacity",1)  
    var x = getVX("explore");
    var y = getVY("explore", 1, schools);

  var section = "explore"
 d3.selectAll(".dot.explore")
 .transition()
 .duration(2500)
        .attr("cx", function(d) { return x(d.minority_percent); })
        .attr("cy", function(d) { return y(d.sci); })
}

function BEES(data, section){
  var margin = {top: 50, right: 50, bottom: 50, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      // padding between nodes
      padding = 0,
      maxRadius = 100000,
      numberOfNodes = data.length;

  if(section == "explore"){
    d3.selectAll(".exploreBeeHide").transition().duration(2500).style("opacity",0)  
  }else{
    d3.selectAll(".beeHide").style("opacity",0)  
  }
  


    var y = getVY(section, 9, data);
    var x = getVX(section);

  // Map the basic node data to d3-friendly format.
  var nodes = data.map(function(node, index) {
    return {
      schoolId: node.schoolId,
      minority_pop: node.minority_pop,
      sci: node.sci,
      type: node.type,
      compareMedian: node.compareMedian,
      minority_percent: node.minority_percent,
      normSci: node.normSci,
      pop: node.pop,
      radius: NARRATIVE_DOT_SCALAR*Math.sqrt(node.pop),
      x: x(node.minority_percent),
      y: (getVHeight(section,9) - 20)
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
  return (getVHeight(section,9) -20)*.5;
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
    var selector = (section == "narrative") ? ".milwaukee" : ".explore"
// console.log(nodes)
  nodes.forEach(function(d,i){
    d3.select(selector + ".dot.sid_" + d.schoolId)
      .transition()
      .duration(2500)
      .delay(i*2)
      .attr("cx", d.x )
      .attr("cy", d.y )
      .attr("r",  d.radius  );
  })

    // d3.selectAll(selector + ".dot")
    //   .data(nodes)
    // // .enter().append("circle")
    //   .transition()
    //   .duration(2500)
    //   .delay(function(d,i){ return i*2})
    //   .attr("cx", function(d) { return d.x} )
    //   .attr("cy", function(d) { return d.y} )
    //   .attr("r", function(d) { return d.radius } );

  }
  // setTimeout(renderGraph, 10);
  renderGraph()
  // Use a timeout to allow the rest of the page to load first.


}