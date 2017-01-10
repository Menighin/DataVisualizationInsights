$(document).ready(function() {

    var h = 800, 
        w = $('.map').width(), 
        initialScale = 1100;

    var colors = d3.scale.category10();

    var svg = d3.select('.map')
        .append('svg')
        .attr('width', w)
        .attr('height', h);

    var g = svg.append('g');
    // .attr('transform', 'translate(0,0) scale(1)');

    var projection = d3.geo.mercator()
        .translate([1700, 110])
        .scale(initialScale);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);

    var tooltip = d3.select('.map').append('div')
            .attr('class', 'hidden tooltip');

    // Define path generator
    var path = d3.geo.path().projection(projection);

    svg.call(zoom).call(zoom.event);

    d3.json('geo/mesorregiao.json', function(json) {

        g.selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr({
                d: path,
                stroke: '#666',
                class: 'region'
            }).on('mousemove', function(d) {
                var mouse = d3.mouse(svg.node()).map(function(d) {
                    return parseInt(d);
                });
                tooltip.classed('hidden', false)
                    .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] + 25) + 'px')
                    .html(d.properties.MESO.capitalize(true));
            }).on('mouseout', function() {
                tooltip.classed('hidden', true);
            });

        var nodeIds = {};
        var lastId = 0;
        var nodes = [];
        var edges = [];
        var dataset = {nodes: nodes, edges: edges};

        d3.csv('../csv/GraphData.csv', function(data) {

            var processedData = [];

            for (var i = 0; i < data.length; i++) {
                var d = data[i];

                d.x1 = projection([d.LongitudeOrigin, d.LatitudeOrigin])[0];
                d.y1 = projection([d.LongitudeOrigin, d.LatitudeOrigin])[1];

                d.x2 = projection([d.LongitudeDestination, d.LatitudeDestination])[0];
                d.y2 = projection([d.LongitudeDestination, d.LatitudeDestination])[1];

                if (typeof nodeIds[d.OriginCenter] === 'undefined') {
                    nodeIds[d.OriginCenter] = lastId;
                    lastId++;
                    nodes.push({name: d.OriginCenter, x: d.x1, y: d.y1, fixed: true});
                }

                if (typeof nodeIds[d.DestinationCenter] === 'undefined') {
                    nodeIds[d.DestinationCenter] = lastId;
                    lastId++;
                    nodes.push({name: d.DestinationCenter, x: d.x2, y: d.y2, fixed: true});
                }
            }

            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                edges.push({source: nodeIds[d.OriginCenter], target: nodeIds[d.DestinationCenter]});
            }

            console.log(dataset);

            var force = d3.layout.force()
                     .nodes(dataset.nodes)
                     .links(dataset.edges)
                     .linkDistance([50])
                     .charge([-100])  
                     .size([w, h])
                     .start();

            var forceGroup = g.append('g')
                    .attr('class', 'force-graph');

            // build the arrow.
            forceGroup.append("svg:defs").selectAll("marker")
                .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -1.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
            .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            var edgesSvg = forceGroup.selectAll("line")
                .data(dataset.edges)
                .enter()
                .append("line")
                .style("stroke", "#ccc")
                .style("stroke-width", 1);

            var nodesSvg = forceGroup.selectAll("circle")
                .data(dataset.nodes)
                .enter()
                .append("circle")
                .attr("r", 10)
                .style("fill", function(d, i) {
                        return colors(i);
                })
                .call(force.drag);

            force.on("tick", function() {
                edgesSvg
                    .attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

                nodesSvg
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });

                });

        });
    });

    function zoomed() {
        var strokeWidth = -0.1242*d3.event.scale + 1.1242;
        g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
        g.selectAll('path').attr('stroke-width', strokeWidth);
    }

});

String.prototype.capitalize=function(all){
    var str = this.toLowerCase();
    if(all){
       return str.split(' ').map(function(e){return e.capitalize();}).join(' ');
    }else{
         return str.charAt(0).toUpperCase() + str.slice(1);
    }
}