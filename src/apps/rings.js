d3plus.apps.rings = {}
d3plus.apps.rings.data = "object";
d3plus.apps.rings.requirements = ["links","focus"];
d3plus.apps.rings.tooltip = "static"
d3plus.apps.rings.shapes = ["circle","square","donut"];
d3plus.apps.rings.scale = 1.05

d3plus.apps.rings.draw = function(vars) {
      
  var radius = d3.min([vars.app_height,vars.app_width])/2,
      // ring_width = vars.small ? radius/2.25 : radius/3,
      ring_width = radius/2.25,
      links = [],
      nodes = []
  
  if (vars.app_data) {
    
    var center = vars.app_data[vars.focus.default]
    center.d3plus.x = vars.app_width/2
    center.d3plus.y = vars.app_height/2
    center.d3plus.r = ring_width/2
    
    var primaries = [], claimed = []
    vars.connections[vars.focus.default].forEach(function(c){
      var n = vars.app_data[c[vars.id.key]]
      if (!n) {
        n = {"d3plus": {}}
        n[vars.id.key] = c[vars.id.key]
      }
      n.d3plus.children = vars.connections[n[vars.id.key]].filter(function(c){
        return c[vars.id.key] != vars.focus.default
      })
      claimed.push(n[vars.id.key])
      primaries.push(n)
    })
  
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Sort primary nodes by children (smallest to largest) and then by sort 
    // order.
    //--------------------------------------------------------------------------
    var sort = null
    if (vars.order.key) {
      sort = vars.order.key
    }
    else if (vars.color.key) {
      sort = vars.color.key
    }
    else if (vars.size.key) {
      sort = vars.size.key
    }
    else {
      sort = vars.id.key
    }
    
    function sort(a,b){
        
      a_value = d3plus.variable.value(vars,a,sort)
      b_value = d3plus.variable.value(vars,b,sort)
    
      if (vars.color.key && sort == vars.color.key) {
        
        a_value = d3plus.variable.color(vars,a)
        b_value = d3plus.variable.color(vars,b)
        
        a_value = d3.rgb(a_value).hsl()
        b_value = d3.rgb(b_value).hsl()

        if (a_value.s == 0) a_value = 361
        else a_value = a_value.h
        if (b_value.s == 0) b_value = 361
        else b_value = b_value.h

      }
      else {
        a_value = d3plus.variable.value(vars,a,sort)
        b_value = d3plus.variable.value(vars,b,sort)
      }
    
      if(a_value<b_value) return vars.order.sort.default == "desc" ? -1 : 1;
      if(a_value>b_value) return vars.order.sort.default == "desc" ? 1 : -1;
        
    }
    
    primaries.sort(function(a,b){
      
      var lengthdiff = a.d3plus.children.length - b.d3plus.children.length
      
      if (lengthdiff) {
        
        return lengthdiff
        
      }
      else {
        
        return sort(a,b)
      
      }
      
    })

    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // Check for similar children and give preference to nodes with less
    // overall children.
    //--------------------------------------------------------------------------
    var secondaries = [], total = 0
    primaries.forEach(function(p){
      p.d3plus.children = p.d3plus.children.filter(function(c){
        return claimed.indexOf(c[vars.id.key]) < 0
      })
      total += p.d3plus.children.length || 1
      p.d3plus.children.forEach(function(c){
        claimed.push(c[vars.id.key])
      })
    })
    
    primaries.sort(sort)
    
    var offset = 0, radian = Math.PI*2, start = 0
    primaries.forEach(function(p,i){
      
      var children = p.d3plus.children.length || 1,
          space = (radian/total)*children
          
      if (i == 0) {
        start = angle
        offset -= space/2
      }
      
      var angle = offset+(space/2)
          
      // Rotate everything by 90 degrees so that the first is at 12:00
      angle -= radian/4
      
      p.d3plus.radians = angle
      p.d3plus.x = vars.app_width/2 + (ring_width * Math.cos(angle))
      p.d3plus.y = vars.app_height/2 + (ring_width * Math.sin(angle))
      p.d3plus.r = 8
      
      var link = {"source": {}, "target": {}}
      link.source[vars.id.key] = center[vars.id.key]
      link.source.d3plus = {
        "x": vars.app_width/2,
        "y": vars.app_height/2
      }
      link.target[vars.id.key] = p[vars.id.key]
      link.target.d3plus = {
        "x": p.d3plus.x,
        "y": p.d3plus.y
      }
      links.push(link)
      
      offset += space
      p.d3plus.children.sort(sort)
      
      p.d3plus.children.forEach(function(c,i){
        var d = vars.app_data[c[vars.id.key]],
            s = radian/total
            
        if (!d) {
          d = {"d3plus": {}}
          d[vars.id.key] = c[vars.id.key]
        }
        
        a = (angle-(s*children/2)+(s/2))+((s)*i)
        d.d3plus.radians = a
        d.d3plus.x = vars.app_width/2 + ((ring_width*2) * Math.cos(a))
        d.d3plus.y = vars.app_height/2 + ((ring_width*2) * Math.sin(a))
        d.d3plus.r = 4
        secondaries.push(d)
      })
      
    })
    primaries.forEach(function(p,i){

      vars.connections[p[vars.id.key]].forEach(function(c){
        
        if (c[vars.id.key] != center[vars.id.key]) {

          var link = {"source": {}, "target": {}}
          link.d3plus = {
            "spline": true,
            "translate": {
              "x": vars.app_width/2,
              "y": vars.app_height/2
            }
          }
          link.source[vars.id.key] = p[vars.id.key]
          link.source.d3plus = {
            "a": p.d3plus.radians,
            "r": ring_width
          }
          var r = ring_width*2
          var target = secondaries.filter(function(s){
            return s[vars.id.key] == c[vars.id.key]
          })[0]
          if (!target) {
            r = ring_width
            target = primaries.filter(function(s){
              return s[vars.id.key] == c[vars.id.key]
            })[0]
          }
          link.target[vars.id.key] = c[vars.id.key]
          link.target.d3plus = {
            "a": target.d3plus.radians,
            "r": r
          }
          
          links.push(link)
          
        }
        
      })
      
    })
    
    nodes = [center].concat(primaries).concat(secondaries)
    
  }
  
  return {"links": links, "nodes": nodes}
  
  // function text_styles(t) {
  //   t
  //     .attr("fill",function(d){
  //       if (d.depth == 0) {
  //         var color = d3plus.color.text(fill_color(d));
  //       } 
  //       else {
  //         var color = d3plus.color.legible(d[vars.color]);
  //       }
  // 
  //       if (d.depth == 0) return color;
  //       else if (d.depth == 1 && (!hover || d == hover || d.children_total.indexOf(hover) >= 0)) return color;
  //       else if (d.depth == 2 && (!hover || d == hover || d.parents.indexOf(hover) >= 0)) return color;
  //       else return "lightgrey"
  //     })
  //     .attr("text-anchor", function(d) { 
  //       if (d.depth == 0) return "middle"
  //       else return d.ring_x%360 < 180 ? "start" : "end"; 
  //     })
  //     .attr("transform", function(d) { 
  //       if (d.depth == 0) return "none"
  //       else {
  //         var offset = d.radius*2
  //         return d.ring_x%360 < 180 ? "translate("+offset+")" : "rotate(180)translate(-"+offset+")";
  //       }
  //     })
  // }
  
};
