
(function() {

	'use strict';

	var YQL_URI = 'http://query.yahooapis.com/v1/public/yql';
	var QUERY = genURLTemplate(
		'select * from json where url = "$iatiUrl"'
	);

	var app = {

	};

	$.ajax({
		type: 'GET',
		url: YQL_URI,
		dataType: 'jsonp',
		data: {
			q: QUERY({
				iatiUrl: 'http://iati-datastore.herokuapp.com/api/1/access/activity?reporting-org=47045&limit=2'
			}),
			format: 'json',
			diagnostics: true,
			callback: '?'
		}
	}).then(function(json) {
		console.warn(json.query.results.json);
	});

}());