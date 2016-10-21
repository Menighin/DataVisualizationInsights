$(document).ready(function() {

	Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, 'getCenter', function(p) {
		var centerOptions = this.options.center,
			centerLatLonOptions = this.options.centerLatLon,
			chart = this.chart,
			slicedOffset = this.options.slicedOffset,
			pos,
			lat,
			lon;

		if (centerLatLonOptions && chart.fromLatLonToPoint) {
			pos = chart.fromLatLonToPoint({
				lat: centerLatLonOptions[0],
				lon: centerLatLonOptions[1]
			});

			centerOptions[0] = chart.xAxis[0].toPixels(pos.x, true) - 2 * slicedOffset;
			centerOptions[1] = chart.yAxis[0].toPixels(pos.y, true) - 2 * slicedOffset;
		}

		return p.call(this);
	});

	$.ajax({url: "geo/mesorregiao.json", success: function(result){
		
		$.ajax({url: '../csv/ConservationFlow.csv', success: function(rawCsv){
			var csv = rawCsv.split(/\r\n|\n/);
			var headings = csv[0].split(',');
			var csvData = [];
			for (var i = 1; i < csv.length; i++) {
				csvItem = {};
				for (var j = 0; j < headings.length; j++) {
					csvItem[headings[j]] = csv[i].split(',')[j];
				}
				csvData.push(csvItem);
			}

			var pieData = [];
			var mappoints = [];
			for (var i = 0; i < csvData.length; i++) {
				var d = csvData[i];
				if (d.Week == 1) {
					pieData.push({
						type: 'pie',
						data: [parseFloat(d.Sales), parseFloat(d.Transfer), parseFloat(d.Production)],
						size: '5%',
						centerLatLon: [parseFloat(d.Latitude), parseFloat(d.Longitude)]
					});

					mappoints.push({
						name: d.OriginCenter,
						lat: d.Latitude,
						lon: d.Longitude
					});
				}
			}

			var series = [{
				mapData: result,
				name: 'Basemap',
				borderColor: '#A0A0A0',
				nullColor: 'rgba(200, 200, 200, 0.3)',
				showInLegend: false
			}, {
				// Specify points using lat/lon
				type: 'mappoint',
				name: 'Cities',
				color: Highcharts.getOptions().colors[1],
				data: mappoints
			}];

			pieData.forEach(function(d) {
				series.push(d);
			});
			
			// Initiate the chart
			var chart = Highcharts.Map({
				chart: {
					renderTo: 'map',
					events: {
						load: function() {
							this.centeringPies = false;
						},
						redraw: function() {
							if (!this.centeringPies) {
								this.centeringPies = true;

								this.series.forEach(function(serie) {
									if (serie.type === 'pie' && serie.options.centerLatLon) {
										serie.update({
											center: serie.getCenter()
										}, false);
									}
								});

								this.redraw(false);
								this.centeringPies = false;
							}
						},
					}
				},
				title: {
					text: 'Highmaps lat/lon demo'
				},
				mapNavigation: {
					enabled: true
				},
				tooltip: {
					headerFormat: '',
					pointFormat: '<b>{point.name}</b><br>Lat: {point.lat}, Lon: {point.lon}'
				},
				plotOptions: {
					pie: {
						dataLabels: {
						enabled: false
						}
					}
				},
				series: series
			});

		}});
	}});
});