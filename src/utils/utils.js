//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Expands a min/max into a specified number of buckets
//------------------------------------------------------------------------------
d3plus.utils.buckets = function(arr, buckets) {
  var return_arr = [], step = 1/(buckets-1)*(arr[1]-arr[0]), i = step

  for (var i = arr[0]; i <= arr[1]; i = i + step) {
    return_arr.push(i)
  }
  if (return_arr.length < buckets) {
    return_arr[buckets-1] = arr[1]
  }
  if (return_arr[return_arr.length-1] < arr[1]) {
    return_arr[return_arr.length-1] = arr[1]
  }
  return return_arr
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Checks to see if element is inside of another elemebt
//------------------------------------------------------------------------------
d3plus.utils.child = function(parent,child) {

  if (!parent || !child) {
    return false;
  }

  if (d3plus.utils.d3selection(parent)) {
    parent = parent.node()
  }

  if (d3plus.utils.d3selection(parent)) {
    child = child.node()
  }

  var node = child.parentNode;
  while (node != null) {
    if (node == parent) {
      return true;
    }
    node = node.parentNode;
  }

  return false;

}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Finds closest numeric value in array
//------------------------------------------------------------------------------
d3plus.utils.closest = function(arr,value) {
  var closest = arr[0]
  arr.forEach(function(p){
    if (Math.abs(value-p) < Math.abs(value-closest)) {
      closest = p
    }
  })
  return closest
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Clones an object, removing any edges to the original
//------------------------------------------------------------------------------
d3plus.utils.copy = function(obj) {
  return d3plus.utils.merge(obj)
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates a Base-64 Data URL from and Image URL
//------------------------------------------------------------------------------
d3plus.utils.dataurl = function(url,callback) {

  var img = new Image();
  img.src = url;
  img.crossOrigin = "Anonymous";
  img.onload = function () {

    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(this, 0, 0);

    callback.call(this,canvas.toDataURL("image/png"))

    canvas = null

  }

}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Cross-browser detect for D3 element
//------------------------------------------------------------------------------
d3plus.utils.d3selection = function(selection) {
  return d3plus.ie ?
    typeof selection == "object" && selection instanceof Array
    : selection instanceof d3.selection
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Merge two objects to create a new one with the properties of both
//------------------------------------------------------------------------------
d3plus.utils.merge = function(obj1, obj2) {
  var obj3 = {};
  function copy_object(obj,ret) {
    for (var a in obj) {
      if (typeof obj[a] != "undefined") {
        if (typeof obj[a] == "object" && !(obj[a] instanceof Array) && obj[a] !== null) {
          if (typeof ret[a] != "object") ret[a] = {}
          copy_object(obj[a],ret[a])
        }
        else if (obj[a] instanceof Array) {
          ret[a] = obj[a].slice(0)
        }
        else {
          ret[a] = obj[a]
        }
      }
    }
  }
  if (obj1) copy_object(obj1,obj3)
  if (obj2) copy_object(obj2,obj3)
  return obj3;
}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Gives X and Y offset based off angle and shape
//------------------------------------------------------------------------------
d3plus.utils.offset = function(radians, distance, shape) {

  var coords = {"x": 0, "y": 0}

  if (radians < 0) {
    radians = Math.PI*2+radians
  }

  if (shape == "square") {

    var diagonal = 45*(Math.PI/180)

    if (radians <= Math.PI) {

      if (radians < (Math.PI / 2)) {

        if (radians < diagonal) {

          coords.x += distance;
          var oppositeLegLength = Math.tan(radians) * distance;
          coords.y += oppositeLegLength;

        } else {

          coords.y += distance;
          var adjacentLegLength = distance / Math.tan(radians);
          coords.x += adjacentLegLength;

        }

      } else {

        if (radians < (Math.PI - diagonal)) {

          coords.y += distance;
          var adjacentLegLength = distance / Math.tan(Math.PI - radians);
          coords.x -= adjacentLegLength;

        } else {

          coords.x -= distance;
          var oppositeLegLength = Math.tan(Math.PI - radians) * distance;
          coords.y += oppositeLegLength;
        }

      }
    } else {

      if (radians < (3 * Math.PI / 2)) {

        if (radians < (diagonal + Math.PI)) {

          coords.x -= distance;
          var oppositeLegLength = Math.tan(radians - Math.PI) * distance;
          coords.y -= oppositeLegLength;

        } else {

          coords.y -= distance;
          var adjacentLegLength = distance / Math.tan(radians - Math.PI);
          coords.x -= adjacentLegLength;

        }

      } else {

        if (radians < (2 * Math.PI - diagonal)) {

          coords.y -= distance;
          var adjacentLegLength = distance / Math.tan(2 * Math.PI - radians);
          coords.x += adjacentLegLength;

        } else {

          coords.x += distance;
          var oppositeLegLength = Math.tan(2 * Math.PI - radians) * distance;
          coords.y -= oppositeLegLength;

        }

      }
    }

  }
  else {

    coords.x += distance * Math.cos(radians)
    coords.y += distance * Math.sin(radians)

  }

  return coords;

}


//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Removes all non ASCII characters
//------------------------------------------------------------------------------
d3plus.utils.strip = function(str) {

  var removed = [ "!","@","#","$","%","^","&","*","(",")",
                  "[","]","{","}",".",",","/","\\","|",
                  "'","\"",";",":","<",">","?","=","+"]

  return str.replace(/[^A-Za-z0-9\-_]/g, function(chr) {

    if (" " == chr) {
      return "_"
    }
    else if (removed.indexOf(chr) >= 0) {
      return ""
    }

    var diacritics = [
        [/[\300-\306]/g, "A"],
        [/[\340-\346]/g, "a"],
        [/[\310-\313]/g, "E"],
        [/[\350-\353]/g, "e"],
        [/[\314-\317]/g, "I"],
        [/[\354-\357]/g, "i"],
        [/[\322-\330]/g, "O"],
        [/[\362-\370]/g, "o"],
        [/[\331-\334]/g, "U"],
        [/[\371-\374]/g, "u"],
        [/[\321]/g, "N"],
        [/[\361]/g, "n"],
        [/[\307]/g, "C"],
        [/[\347]/g, "c"],
    ];

    var ret = ""

    for (d in diacritics) {

      if (diacritics[d][0].test(chr)) {
        ret = diacritics[d][1]
        break;
      }

    }

    return ret;

  });

}

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Returns list of unique values
//------------------------------------------------------------------------------
d3plus.utils.uniques = function(data,value) {
  var type = null
  return d3.nest().key(function(d) {
      if (typeof value == "string") {
        if (!type && typeof d[value] !== "undefined") type = typeof d[value]
        return d[value]
      }
      else if (typeof value == "function") {
        if (!type && typeof value(d) !== "undefined") type = typeof value(d)
        return value(d)
      }
      else {
        return d
      }
    })
    .entries(data)
    .reduce(function(a,b){
      if (type) {
        var val = b.key
        if (type == "number") val = parseFloat(val)
        return a.concat(val)
      }
      return a
    },[]).sort(function(a,b){
      return a - b
    })
}
