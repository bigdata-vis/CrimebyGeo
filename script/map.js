var width = 960,
    height = 1160;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//    d3.json("//martinjc.github.io/UK-GeoJSON/json/eng/msoa_by_lad/topo_E06000021.json", function (error, uk) {

d3.json("https://bost.ocks.org/mike/map/uk.json", function (error, uk) {
    if (error) return console.error(error);
    var subunits = topojson.feature(uk, uk.objects.subunits);

    var projection = d3.geo.albers()
        .center([0, 55.4])
        .rotate([4.4, 0])
        .parallels([50, 60])
        .scale(6000)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);


    //select individual subunits
    svg.append("path")
        .datum(subunits)
        .attr("d", path);

    //select individual sections
    svg.selectAll(".subunit")
        .data(subunits.features)
        .enter().append("path")
        .attr("class", function (d) {
            return "subunit " + d.id
        })
        .attr("d", path)
        .text(function (d) {
            console.log(d.properties.name);
            return d.properties.name
        });

    svg.append("path")
        .datum(topojson.mesh(uk, uk.objects.subunits, function (a, b) {
            return a !== b && a.id !== "IRL";
        }))
        .attr("d", path)
        .attr("class", "subunit-boundary");


    svg.append("path")
        .datum(topojson.feature(uk, uk.objects.places))
        .attr("d", path)
        .attr("class", "place");

});