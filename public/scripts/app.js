
$(document).ready(function() {

    var h = 800, 
        w = $('.map').width(), 
        initialScale = 1100;

    var svg = d3.select('.map')
        .append('svg')
        .attr('width', w)
        .attr('height', h);

    var g = svg.append('g').attr('transform', 'translate(0,0) scale(1)');

    var projection = d3.geo.mercator()
        .translate([1700, 110])
        .scale(initialScale);

    var zoom = d3.behavior.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    var tooltip = d3.select('.map').append('div')
            .attr('class', 'hidden tooltip');

    //Define path generator
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