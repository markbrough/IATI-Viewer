
(function() {

	'use strict';

	var YQL_URI = 'http://query.yahooapis.com/v1/public/yql';
	var QUERY = genURLTemplate(
		'select * from json where url = "$iatiUrl"'
	);


	$.ajax({
		type: 'GET',
		url: YQL_URI,
		dataType: 'jsonp',
		data: {
			q: QUERY({
				iatiUrl: 'http://iati-datastore.herokuapp.com/api/1/access/activity?reporting-org=GB-1&recipient-country=CD'
			}),
			format: 'json',
			diagnostics: true,
			callback: '?'
		}
	}).then(function(json) {
		console.warn(json.query.results.json);
	});

}());