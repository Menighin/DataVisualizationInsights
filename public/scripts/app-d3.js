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
        .on('zoom', zoomed);

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
        
        var pie = d3.layout.pie();
        var pieData = [5, 10, 15, 20];
        var outerRadius = 20;
        var innerRadius = 0;
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var color = d3.scale.category10();

        d3.csv('../csv/ConservationFlow.csv', function(data) {

            var processedData = [];

            for (var i = 0; i < data.length; i++) {
                var d = data[i];

                if (d.Week != 1) continue;

                d.x = projection([d.Longitude, d.Latitude])[0];
                d.y = projection([d.Longitude, d.Latitude])[1];

                var minDist = 10000000;
                var minDistId = -1;
                for (var j = 0; j < processedData.length; j++) {

                    var d2 = processedData[j];

                    if (d2.OriginCenter == d.OriginCenter) continue;

                    var dist = Math.sqrt(Math.pow(d.x - d2.x, 2) + Math.pow(d.y - d2.y, 2));
                    // console.log('Distance between ' + d.OriginCenter + ' and ' + d2.OriginCenter + ': ' + dist);
                    if (dist < minDist) {
                        minDist = dist;
                        minDistId = j;
                    }
                }
                // console.log('------------');
                // console.log(processedData);
                // console.log('------------');
                

                if (minDistId != -1) {
                    d.closer = minDistId;
                    d.closerDistance = minDist;
                    if (typeof processedData[minDistId].closerDistance == 'undefined' || processedData[minDistId].closerDistance > minDist) {
                        processedData[minDistId].closer = processedData.length - 1;
                        processedData[minDistId].closerDistance = minDist;
                    }
                }

                processedData.push(d);
            }            

            for (var i = 0; i < processedData.length; i++) {

                var d = processedData[i];

                console.log('Closest to ' + d.OriginCenter + ' is ' + processedData[d.closer].OriginCenter + ' by ' + d.closerDistance);
                
                var pieData = pie([d.Production, d.Sales, d.Transfer]);
                var pieLat = d.Latitude, 
                    pieLon = d.Longitude;
                var pieName = d.OriginCenter.replace(' ', '-');

                for (var j = 0; j < pieData.length; j++) {
                    pieData[j].name = pieName;
                }

                var pieGroup = g.append('g')
                    .attr('class', 'pie-chart')
                    .attr('id', pieName)
                    .data(pieData);

                var arcs = pieGroup.selectAll('g.arc')
                    .data(pieData)
                    .enter()
                    .append('g')
                    .attr('class', 'arc')
                    .attr('transform', 'translate(' + d.x + ', ' + d.y + ')');
                
                arcs.append('path')
                    .attr('fill', function(d, i) {
                        return color(i);
                    })
                    .attr('d', arc)
                    .transition().delay(function(d, i) { return i * 0; }).duration(500)
                    .attrTween('d', function(d) {
                        var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
                        return function(t) {
                            d.endAngle = i(t);
                            return arc(d);
                        }
                    });

                arcs.append('text')
                    .attr('transform', function(d) {
                        return 'translate(' + arc.centroid(d) + ')';
                    })
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '6px')
                    .text(function(d) {
                        if (d.value != 0)
                            return d.name;
                        return '';
                    });
            }
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