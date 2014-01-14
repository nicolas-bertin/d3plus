//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Sets color range of data, if applicable
//-------------------------------------------------------------------
d3plus.data.color = function(vars) {
  
  if (vars.color.key && typeof vars.color.key == "object") {
    if (vars.color.key[vars.id.key]) {
      var color_id = vars.color.key[vars.id.key]
    }
    else {
      var color_id = vars.color.key[Object.keys(vars.color.key)[0]]
    }
  }
  else {
    var color_id = vars.color.key
  }
  
  if (vars.data.default && vars.color.key && vars.color.changed && vars.data.keys[color_id] == "number") {

    if (vars.dev.default) d3plus.console.group("Calculating Color Range")
    
    var data_range = []
    vars.color_domain = null
    
    if (vars.dev.default) d3plus.console.time("get data range")
    
    vars.data.default.forEach(function(d){
      var val = parseFloat(d3plus.variable.value(vars,d,vars.color.key))
      if (val) data_range.push(val)
    })
    
    if (vars.dev.default) d3plus.console.timeEnd("get data range")
    
    if (vars.dev.default) d3plus.console.time("create color scale")
    
    data_range.sort(function(a,b) {return a-b})
    vars.color_domain = [d3.quantile(data_range,0.1),d3.quantile(data_range,0.9)]
    
    var new_range = vars.style.color.range.slice(0)
    if (vars.color_domain[0] < 0 && vars.color_domain[1] > 0) {
      vars.color_domain.push(vars.color_domain[1])
      vars.color_domain[1] = 0
    }
    else if (vars.color_domain[1] > 0 || vars.color_domain[0] < 0) {
      new_range = vars.style.color.heatmap
      vars.color_domain = d3plus.utils.buckets(d3.extent(data_range),new_range.length)
    }
    
    vars.color_scale
      .domain(vars.color_domain)
      .range(new_range)
  
    if (vars.dev.default) d3plus.console.timeEnd("create color scale")
    
    if (vars.dev.default) d3plus.console.groupEnd();
    
  }
  
}