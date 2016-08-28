
var h = 800;
var svg = d3.select('.map')
    .append('svg')
    .attr('width', 'auto')
    .attr('height', h);

var projection = d3.geo.mercator()
    .scale(1000)
    .translate([1700, 120]);

//Define path generator
var path = d3.geo.path().projection(projection);

d3.json('geo/mesorregiao.json', function(json) {

    svg.selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('stroke','#666')
        .attr('stroke-width', 1)
        .attr('fill', 'rgba(0,0,0,0)')

});