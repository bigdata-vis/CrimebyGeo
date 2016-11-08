var width = Math.max(960, window.innerWidth),
    height = Math.max(500, window.innerHeight),
    prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

var margin = {top: 10, right: 10, bottom: 10, left: 10};

//    d3.csv("coffee.csv", function (error, dataset) {
//        createMap(dataset)
//    });

// data entry
d3.json("http://localhost:5000/api/v1/crime_data", function (error, data) {
    if (error) throw error;

    //console.log(data.meta)

    //monthly status nodes
    sam.vis().monthlyStatusBar(data.meta);

    //create screen dots
    createDots(data.data);

    //draw bottom scale
    sam.vis().monthScale(axisscale, width, height, data.meta);

    //new brush scale
    //sam.vis().brushxAxis(points, width);

    //open and close panel
    sam.vis().closePanel();
});

var tile = d3.geo.tile()
    .size([width, height]);

var projection = d3.geo.mercator()
    .scale((1 << 23) / 2 / Math.PI)
    .translate([-width / 2, -height / 2]); // just temporary

var tileProjection = d3.geo.mercator();

var tilePath = d3.geo.path()
    .projection(tileProjection);

var zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1 << 9, 1 << 25])
    .translate(projection([-2.1833, 53.0]).map(function (x) {
        return -x;
    }))
    .on("zoom", zoomed);

var container = d3.select("body").append("div")
    .attr("id", "container")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom);

var map = container.append("g")
    .attr("id", "map");

var points = container.append("svg")
    .attr("id", "points");

var legend2 = points.append("g")
    .attr("id", "legendPanel");

var layer = map.append("div")
    .attr("class", "layer");

var axisscale = points;

//var sliderDiv = d3.select("body").append("div").attr("id", "brushSlider");

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(function (d) {
        return '<span>' + "Crime Type : " + d.type + '</span>'
    })
    .offset([-12, 0]);


points.call(tip);

zoomed();

function createDots(data) {

    d3.select('#points').selectAll(".screen_dots")
        .data(data)
        .enter()
        //.append("circle")
        .append("circle")
        .attr("class", "screen_dots")
        .attr("r", 0.5)
        .attr("cx", function (d) {
            return projection([d.long, d.latitude])[0]
        })
        .attr("cy", function (d) {
            return projection([d.long, d.latitude])[1]
        })
        //.attr("transform", function (d) {
        //    return "translate(" + projection([d.long, d.latitude]) + ")";
        //})
        .attr("fill", "red")
        .attr("fill-opacity", function (d) {
            return d.uncert
        })

        //.attr("fill", "#002240")
        .on('mouseover', tip.show)

        //use bootstrap panel component
        .on('click', function (d) {
            //remove old panel
            sam.vis().removePanel();


            //create panel
            bootPanel(d)
        })
        .on('mouseout', tip.hide);
    zoomed();
}

function createMap(dataset) {
    d3.select("#points").selectAll("circle").data(dataset) //plotted 	locations on map
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection([d.y, d.x])[0]
        })
        .attr("cy", function (d) {
            return projection([d.y, d.x])[1]
        })
        .attr("class", "coffee")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    zoomed();
}

function zoomed() {
    var tiles = tile
        .scale(zoom.scale())
        .translate(zoom.translate())
    ();

    projection
        .scale(zoom.scale() / 2 / Math.PI)
        .translate(zoom.translate());

    //only zoom dots circles
    //var circles = d3.selectAll("circle")
    var circles = d3.selectAll(".screen_dots")
        .attr("cx", function (d) {
            return projection([d.long, d.latitude])[0]
        })
        .attr("cy", function (d) {
            return projection([d.long, d.latitude])[1]
        })
        //.attr("transform", function (d) {
        //    return "translate(" + projection([d.long, d.latitude]) + ")";
        //})
        .attr("r", .0000012 * zoom.scale());

    var image = layer
        .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
        .selectAll(".tile")
        .data(tiles, function (d) {
            return d;
        });

    image.exit()
        .remove();

    image.enter().append("img")
        .attr("class", "tile")
        .attr("src", function (d) {
            return "http://" + ["a", "b", "c"][Math.random() * 3 | 0] + ".tile.openstreetmap.se/hydda/full/" + d[2] + "/" + d[0] + "/" + d[1] + ".png";
        })
        .style("left", function (d) {
            return (d[0] << 8) + "px";
        })
        .style("top", function (d) {
            return (d[1] << 8) + "px";
        });
}

function matrix3d(scale, translate) {
    var k = scale / 256, r = scale % 1 ? Number : Math.round;
    return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1] + ")";
}

function prefixMatch(p) {
    var i = -1, n = p.length, s = document.body.style;
    while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
    return "";
}

function formatLocation(p, k) {
    var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
    return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " "
        + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
}

function legendPanel(data) {
    //data enter
    legend2.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var legend = legend2.append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("width", 380)
        .attr("height", 130)
        .attr("fill", "#002240")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 1.2);

    legend.append("text")
        .attr("class", ".legend_text")
        .attr("x", margin.left)
        .attr("y", margin.top + 20)
        .attr("fill", "white")
        .text("Date: " + data.date);

    legend.append("text")
        .attr("class", ".legend_text")
        .attr("x", margin.left)
        .attr("y", margin.top + 40)
        .attr("fill", "white")
        .text("Crime Type :" + data.type);

    legend.append("text")
        .attr("class", ".legend_text")
        .attr("x", margin.left)
        .attr("y", margin.top + 60)
        .attr("fill", "white")
        .text("Reported By: " + data.reported_by);

    legend.append("text")
        .attr("class", ".legend_text")
        .attr("x", margin.left)
        .attr("y", margin.top + 80)
        .attr("fill", "white")
        .text("Outcome: " + data.outcome);

}

function bootPanel(d) {
    d3.select("body").append("div")
        .attr("id", "panelContainer")
        .html("<div class='panel panel-info'>" +
        "<div class='panel-heading'>" +
        "<h3 class='panel-title'>" + d.type + "</h3>" +
        "<span class='pull-right clickable'><i class='glyphicon glyphicon-chevron-up'></i></span>" +
        "</div>" +
        "<div class='panel-body'>" +
        d.date + "<br>" +"Outcome: "+ d.outcome + "<br>" + "Reported By: " + d.reported_by +
        "</div>" +
        "</div>");
}

function uncertGauge(d) {
    console.log(d);
    if (d > 0.5) {
        return "High"
    } else {
        return "Low"
    }
}
