function initialize() {
  // 位置情報データ取得
  var sparqlQueryURI = 'http://lod.ac/sabae/sparql?query=SELECT+*%0A++WHERE+%7B%0A++++%3Furi+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23lat%3E+%3Flatitude+.%0A+++++%3Furi+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23long%3E+%3Flongitude+.+FILTER+regex(str(%3Furi)%2C+%22toilet%22)%0A++%7D&format=json';
  d3.json(sparqlQueryURI, function(pointsJson){

    // 位置情報データから母点の座標情報に
    var sitePointsCoordinates = [];
    pointsJson.results.bindings.forEach(function(point){
      sitePointsCoordinates.push([point.longitude.value, point.latitude.value]);
    });

    drawMap(sitePointsCoordinates);
  });
}

function drawMap(sitePointsCoordinates) {
  var mapOptions = {
    center : new google.maps.LatLng(35.964, 136.18447420000007),
    zoom   : 14,
  };

  var map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
  var overlay = new google.maps.OverlayView();

  overlay.onAdd = function () {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
                                                       .classed("svg_container", true);
    var svg = layer.append("svg");
    var voronoiVertexContainer = svg.append("g")
                                    .classed("voronoi_vertex_container", true)
                                    .attr("opacity", "0.6");

    overlay.draw = function () {
      // 緯度・経度データをピクセル情報に変換
      var projection = this.getProjection();
      var googleMapProjection = function (coordinates) {
          var googleCoordinates = new google.maps.LatLng(coordinates[1], coordinates[0]);
          var coordinatesPx = projection.fromLatLngToDivPixel(googleCoordinates);
          return [coordinatesPx.x + 4000, coordinatesPx.y + 4000];
      };
      var sitePointsCoordinatesPx = [];
      sitePointsCoordinates.forEach(function(coordinates) {
        sitePointsCoordinatesPx.push(googleMapProjection(coordinates));
      });

      // 母点が存在する座標の範囲を求める
      var maxXPx, maxYPx, minXPx, minYPx;
      sitePointsCoordinatesPx.forEach(function(sp){
        if(sp[0]>maxXPx || maxXPx == null) {
          maxXPx = sp[0];
        } else if(sp[0]<minXPx || minXPx == null) {
          minXPx = sp[0];
        }
        if(sp[1]>maxYPx || maxYPx == null) {
          maxYPx = sp[1];
        } else if(sp[1]<minYPx || minYPx == null) {
          minYPx = sp[1];
        }
      });

      // 母点の座標(px)からボロノイ点の座標(px)と各ボロノイ点について最も近い母点との距離(px)を求める
      var getDistance = function (point1, point2) {
        xDiff = point1[0]-point2[0];
        yDiff = point1[1]-point2[1];
        return Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
      };
      var polygons = d3.geom.voronoi(sitePointsCoordinatesPx);
      var voronoiPoints = [];
      for (var polyKey = 0; polyKey < polygons.length; polyKey++) {
        polygons[polyKey].forEach(function(polygon){
          var voronoiPoint = {
            coordinatesPx : [ polygon[0],
                              polygon[1] ],
            distancePx    : getDistance(polygon,sitePointsCoordinatesPx[polyKey])
          };

          // 同座標の点は、最も近い母点との距離を採用する
          var isValid = true;
          if(voronoiPoint.coordinatesPx[0]<=maxXPx && voronoiPoint.coordinatesPx[0]>=minXPx &&
             voronoiPoint.coordinatesPx[1]<=maxYPx && voronoiPoint.coordinatesPx[1]>=minYPx){
            for(var vorKey = 0; vorKey < voronoiPoints.length; vorKey++){
              if(voronoiPoints[vorKey].coordinatesPx.toString() == voronoiPoint.coordinatesPx.toString()){
                if(voronoiPoints[vorKey].distance <= voronoiPoint.distance) {
                  isValid = false;
                } else {
                  voronoiPoints.splice(vorKey,1);
                  break;
                }
              }
            }
          } else {
            isValid = false;
          }
          if(isValid) voronoiPoints.push(voronoiPoint);
        });
      }

      // 母点との距離の平均を求める
      var sumDistancePx = 0;
      voronoiPoints.forEach(function(vp){
        sumDistancePx += vp.distancePx;
      });
      var aveDistancePx = sumDistancePx/voronoiPoints.length;

      // 母点描画
      var toiletMarkSize = map.getZoom()*4;
      var sitePointsAttributes = {
        "x" : function(d, i) { return sitePointsCoordinatesPx[i][0]-toiletMarkSize/2; },
        "y" : function(d, i) { return sitePointsCoordinatesPx[i][1]-toiletMarkSize/2; },
        "xlink:href"  : "toilet.svg",
        "height" : toiletMarkSize+"px",
        "width"  : toiletMarkSize+"px"
      };
      svg.selectAll("image.site_points")
        .data(sitePointsCoordinatesPx)
        .classed("site_points", true)
        .attr(sitePointsAttributes)
        .enter()
        .append("svg:image")
        .classed("site_points", true)
        .attr(sitePointsAttributes);

      // ボロノイ点描画
      var voronoiPointsAttributes = {
        "cx":function(d, i) { return voronoiPoints[i].coordinatesPx[0]; },
        "cy":function(d, i) { return voronoiPoints[i].coordinatesPx[1]; },
        "r" :function(d, i) {
          var radius = voronoiPoints[i].distancePx - aveDistancePx/2;
          if(radius>0){
            return radius;
          } else {
            return 0;
          }
        },
        "fill":"#e74c3c"
      }
      voronoiVertexContainer.selectAll("circle.voronoi_points")
        .data(voronoiPoints)
        .classed("voronoi_points", true)
        .attr(voronoiPointsAttributes)
        .enter()
        .append("svg:circle")
        .classed("voronoi_points", true)
        .attr(voronoiPointsAttributes);
    };
  };
  overlay.setMap(map);
}
google.maps.event.addDomListener(window, 'load', initialize);
