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
				name: 'Random data'				
			}, {
				type: 'mapbubble',
                dataLabels: {
                    enabled: true
                },
                name: 'Cities',
                data: [{
					lat: -21.194476, 
					lon: -43.794456,
					y: 100,
					name: 'Barbacena'
				}, {
					lat: -21.194476, 
					lon: -43.794456,
					y: 50,
					name: 'Barbacena'
				}],
                maxSize: '12%'
			}],
			legend: {
				layout: 'vertical',
				align: 'left',
				verticalAlign: 'bottom'
			},
		});
	}});
});