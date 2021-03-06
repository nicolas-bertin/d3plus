//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates focus elements, if available
//------------------------------------------------------------------------------
d3plus.draw.focus = function(vars) {

  vars.g.edge_focus
    .selectAll("g")
    .remove()

  vars.g.data_focus
    .selectAll("g")
    .remove()

  if (vars.focus.value && d3plus.apps[vars.type.value].zoom && vars.zoom.value) {

    if (vars.dev.value) d3plus.console.time("drawing focus elements")

    var edges = vars.g.edges.selectAll("g")

    if (edges.size() > 0) {

      edges.each(function(l){

          var source = l[vars.edges.source][vars.id.key],
              target = l[vars.edges.target][vars.id.key]

          if (source == vars.focus.value || target == vars.focus.value) {
            var elem = vars.g.edge_focus.node().appendChild(this.cloneNode(true))
            var elem = d3.select(elem).datum(l).attr("opacity",1)
          }

        })


      var marker = vars.edges.arrows.value ? "url(#d3plus_edge_marker_focus)" : "none"

      vars.g.edge_focus.selectAll("line, path")
        .attr("vector-effect","non-scaling-stroke")
        .style("stroke",vars.style.highlight.focus)
        .style("stroke-width",vars.style.data.stroke.width*2)
        .attr("marker-start",function(){
          return vars.edges.arrows.direction.value == "source" ? marker : "none"
        })
        .attr("marker-end",function(){
          return vars.edges.arrows.direction.value == "target" ? marker : "none"
        })

      vars.g.edge_focus.selectAll("text")
        .style("fill",vars.style.highlight.focus)

    }

    var focii = d3plus.utils.uniques(vars.connections(vars.focus.value,true),vars.id.key)
    focii.push(vars.focus.value)

    var x_bounds = [], y_bounds = [], x_buffer = [0], y_buffer = [0]

    var groups = vars.g.data.selectAll("g")
      .each(function(d){
        if (focii.indexOf(d[vars.id.key]) >= 0) {
          var elem = vars.g.data_focus.node().appendChild(this.cloneNode(true))
          var elem = d3.select(elem).datum(d).attr("opacity",1)

          if (vars.shape.value == "coordinates") {

            vars.zoom.viewport = vars.path.bounds(vars.zoom.coords[d.d3plus.id])

          }
          else if ("d3plus" in d) {
            if ("x" in d.d3plus) {
              x_bounds.push(d.d3plus.x)
            }
            if ("y" in d.d3plus) {
              y_bounds.push(d.d3plus.y)
            }
            if ("r" in d.d3plus) {
              x_buffer.push(d.d3plus.r)
              y_buffer.push(d.d3plus.r)
            }
            else {
              if ("width" in d.d3plus) {
                x_buffer.push(d.d3plus.width/2)
              }
              if ("height" in d.d3plus) {
                y_buffer.push(d.d3plus.height/2)
              }
            }
          }

          for (e in d3plus.evt) {
            var evt = d3.select(this).on(d3plus.evt[e])
            if (evt) {
              elem.on(d3plus.evt[e],evt)
            }
          }

        }
      })

    if (x_bounds.length && y_bounds.length) {

      var xcoords = d3.extent(x_bounds),
          ycoords = d3.extent(y_bounds),
          xmax = d3.max(x_buffer),
          ymax = d3.max(y_buffer)

      vars.zoom.viewport = [
        [xcoords[0]-xmax,ycoords[0]-ymax],
        [xcoords[1]+xmax,ycoords[1]+ymax]
      ]

    }

    vars.g.data_focus.selectAll("path")
      .style("stroke-width",vars.style.data.stroke.width*2)

    if (vars.dev.value) d3plus.console.timeEnd("drawing focus elements")

  }
  else {
    vars.zoom.viewport = null
  }

}
