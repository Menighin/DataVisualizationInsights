$(document).ready(function() {
	$.ajax({url: "geo/mesorregiao.json", success: function(result){

		data = [];
		$.each(result.features, function (index, feature) {
			data.push({
				key: feature.properties['MESO'],
				value: index
			});
		});


		$('.map').slideDown().highcharts('Map', {
			title: {
				text: null
			},
			mapNavigation: {
				enabled: true
			},
			series: [{
				mapData: result,
				data: data,
				name: 'Random data',				
				joinBy: ['MESO', 'key'],
				dataLabels: {
					enabled: true,
					borderWidth: 1,
					padding: 20,
					formatter: function () {
						return this.point.MESO;
					}
				}
			}],
			colorAxis: {
				min: 0,
				stops: [
					[0, '#EFEFFF'],
					[0.5, Highcharts.getOptions().colors[0]],
					[1, Highcharts.Color(Highcharts.getOptions().colors[0]).brighten(-0.5).get()]
				]
			},

			legend: {
				layout: 'vertical',
				align: 'left',
				verticalAlign: 'bottom'
			},
		});
	}});
});