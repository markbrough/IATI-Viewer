define(function(require) {

	'use strict';

	var util = require('util');
	var ReportView = require('ReportView');

	var YQL_URI = 'http://query.yahooapis.com/v1/public/yql';
	var QUERY = util.genURLTemplate(
		'select * from xml where url = "$iatiUrl"'
	);

	return {
		init: function() {

			$.ajax({
				type: 'GET',
				url: YQL_URI,
				dataType: 'jsonp',
				data: {
					q: QUERY({
						iatiUrl: 'http://iati-datastore.herokuapp.com/api/1/access/activity.xml?reporting-org=47045&limit=2'
					}),
					format: 'json',
					diagnostics: true,
					callback: '?'
				}
			}).then(function(json) {

				console.warn(json);

				var rv = new ReportView({
					activity: json.query.results.result['iati-activities']['iati-activity'][0]
				});

				$('#report').html( rv.$el );
				$('#loading').slideUp();

			});

		}
	};

});
