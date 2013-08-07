define(function(require) {

	'use strict';

	var util = require('util');
	var ReportView = require('ReportView');

	var YQL_URI = 'http://query.yahooapis.com/v1/public/yql';
	var QUERY = util.genURLTemplate(
		'select * from xml where url = "$iatiUrl"'
	);

	return {
		init: function(args) {
            if (args.offset >0) {
                var offset = '&offset='+args.offset;
            } else {
                var offset = '';
            }
            if ((typeof args.reporting_org != "undefined")&&(args.reporting_org!="")) {
                var reporting_org = '&reporting-org='+args.reporting_org;
            } else {
                var reporting_org = ''
            }
            if ((typeof args.recipient_country != "undefined")&&(args.recipient_country!="")) {
                var recipient_country = '&recipient-country='+args.recipient_country;
            } else {
                var recipient_country = ''
            }
			$.ajax({
				type: 'GET',
				url: YQL_URI,
				dataType: 'jsonp',
				data: {
					q: QUERY({
						iatiUrl: 'http://iati-datastore.herokuapp.com/api/1/access/activity.xml?limit=2'+reporting_org+recipient_country+offset
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

		},
        update: function (args){
            $('#report').empty();
            this.init(args);
        }
	};

});
