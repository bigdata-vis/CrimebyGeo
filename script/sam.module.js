/**
 * Created by simba on 05/11/2016.
 */
var sam = {};

sam.vis = function module() {
    //var exports = {}

    function exports(_selection) {
        return _selection;
    }

    exports.removePanel = function () {
        d3.select("body").selectAll("#panelContainer").remove();
    };

    exports.closePanel = function () {
        $(document).on('click', '.panel-heading span.clickable', function (e) {
            var $this = $(this);
            if (!$this.hasClass('panel-collapsed')) {
                $this.parents('.panel').find('.panel-body').slideUp();
                $this.addClass('panel-collapsed');
                $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            } else {
                $this.parents('.panel').find('.panel-body').slideDown();
                $this.removeClass('panel-collapsed');
                $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            }
        });
    };

    exports.brushxAxis = function (container, newWidth, newHeight) {
        var data = d3.range(800).map(Math.random);

        //var margin = {top: 1, right: 50, bottom: 214, left: 50},
        var width = newWidth - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        var centering = false,
            center,
            alpha = .2;

        //change to time scale calculation
        //var x = d3.scaleTime()
        //    .domain([new Date(2013, 7, 1), new Date(2013, 7, 15) - 1])
        //    .rangeRound([0, width]);

        var x = d3.scale.linear()
            .domain([0, 30])
            .range([0, width]);

        var y = d3.random.normal(height / 2, height / 8);

        var brush = d3.svg.brush()
            .x(x)
            .extent([.3, .5])
            .on("brush", brushmove);

        var arc = d3.svg.arc()
            .outerRadius(height / 2)
            .startAngle(0)
            .endAngle(function (d, i) {
                return i ? -Math.PI : Math.PI;
            });

        var svg = sliderDiv.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 20)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            //.attr("x", 0)
            //.attr("y", height + margin.top + margin.bottom - 200)
            .call(d3.svg.axis()
                .scale(x)
                .orient("bottom"));

        var dot = svg.append("g")
            .attr("class", "dots")
            //.selectAll("circle")
            .selectAll(".slider_dots")
            .data(data)
            .enter().append("circle").attr("class","slider_dots")
            .attr("transform", function (d) {
                return "translate(" + x(d) + "," + y() + ")";
            })
            .attr("r", 3.5);

        var gBrush = svg.append("g")
            .attr("class", "brush")
            .call(brush);

        gBrush.selectAll(".resize").append("path")
            .attr("transform", "translate(0," + height / 2 + ")")
            .attr("d", arc);

        gBrush.selectAll("rect")
            .attr("height", height);

        gBrush.select(".background")
            .on("mousedown.brush", brushcenter)
            .on("touchstart.brush", brushcenter);

        gBrush.call(brush.event);

        function brushmove() {
            var extent = brush.extent();
            dot.classed("selected", function (d) {
                return extent[0] <= d && d <= extent[1];
            });
        }

        function brushcenter() {
            var self = d3.select(window),
                target = d3.event.target,
                extent = brush.extent(),
                size = extent[1] - extent[0],
                domain = x.domain(),
                x0 = domain[0] + size / 2,
                x1 = domain[1] - size / 2;

            recenter(true);
            brushmove();

            if (d3.event.changedTouches) {
                self.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
            } else {
                self.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
            }

            function brushmove() {
                d3.event.stopPropagation();
                center = Math.max(x0, Math.min(x1, x.invert(d3.mouse(target)[0])));
                recenter(false);
            }

            function brushend() {
                brushmove();
                self.on(".brush", null);
            }
        }

        function recenter(smooth) {
            if (centering) return; // timer is active and already tweening
            if (!smooth) return void tween(1); // instantaneous jump
            centering = true;

            function tween(alpha) {
                var extent = brush.extent(),
                    size = extent[1] - extent[0],
                    center1 = center * alpha + (extent[0] + extent[1]) / 2 * (1 - alpha);

                gBrush
                    .call(brush.extent([center1 - size / 2, center1 + size / 2]))
                    .call(brush.event);

                return !(centering = Math.abs(center1 - center) > 1e-3);
            }

            d3.timer(function () {
                return tween(alpha);
            });
        }
    };

    exports.snappingBrush = function(svg, newwidth, newheight){

    };

    exports.monthScale = function (svg, newwidth, newheight) {
        width = newwidth - margin.left - margin.right;
        height = newheight - margin.top - margin.bottom;

        var x = d3.time.scale()
            .domain([new Date(2012, 0, 1), new Date(2012, 11, 31)])
            .range([0, width]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.months)
            .tickSize(16, 0)
            .tickFormat(d3.time.format("%B"));

        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bottomScale = svg.append("g");

        bottomScale.append("rect")
            .attr("width", width + margin.left + margin.right)
            .attr("height", 112)
            .attr("class", "scale")
            .attr("fill", "#31708f")
            .attr("x", 0)
            .attr("y", height + margin.top + margin.bottom - 112);

        bottomScale.append("text")
            .attr("x", margin.left)
            .attr("y", height + margin.top + margin.bottom - 90)
            .attr("fill", "white")
            .attr("class", "axis")
            .text("Staffordshire Police Crime Report (Jan 2016)");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll(".tick text")
            .style("text-anchor", "start")
            .attr("x", 6)
            .attr("y", 6)
            .attr("fill", "white");
    };

    return exports
};