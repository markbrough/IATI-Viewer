
define(function(require) {
	'use strict';

	var template = _.template( $('#reportTemplate').html() );

	function formatCurrency(n) {
		return (
			String(n).split('').reverse().join('')
			.replace(/\d{3}(?!$)/g, '$&,')
			.split('').reverse().join('')
		);
	}

	function getTransactionYear(t) {
		// Grab 2003 from e.g. "2003-07-01"
		return +t['transaction-date']['iso-date'].substring(0, 4);
	}

	return Backbone.View.extend({

		initialize: function() {
			console.log('Activity -->', this.options.activity);
			this.activity = this.options.activity;
			this.render();
		},

		render: function() {
			this.$el.html( template({
				title: this.activity.title ? this.activity.title.content : '[no title]',
				description: this.activity.description ? this.activity.description.content : '[no description]',
				iati_identifier: this.activity["iati-identifier"],
				participatingOrgs: this.activity['participating-org'],
				stats: [
					{
						name: 'Transactions total', 
						value: formatCurrency( this.getTransactionTotal() ) + ' ' + this.getCurrency() 
					},
					{
						name: 'Disbursement total', 
						value: formatCurrency(this.getTransactionTotal(function(t) {
							return t['transaction-type'].code === 'D'
						})) + ' ' + this.getCurrency() 
					},
					{
						name: 'Commitment total', 
						value: formatCurrency(this.getTransactionTotal(function(t) {
							return t['transaction-type'].code === 'C'
						})) + ' ' + this.getCurrency() 
					}
				],
                results: this.getResults()
			}) );
			this.doTransactionChart();
		},

		getTransactionTotal: function(filter) {
			var sum = 0;
			_.each(this.activity.transaction, function(t) {
				// if (t.value.currency !== 'USD') return;
				if (filter && !filter(t)) return;
				sum += +t.value.content;
			});
			return sum;
		},

		getCurrency: function() {
			// TODO: Ensure it's safe to assume all transactions are same currency!
			var transactions = this.activity.transaction;
			for (var i = 0, l = transactions.length; i < l; ++i) {
				if (transactions[i].value.currency) {
					return transactions[i].value.currency;
				}
			}
			return 'UNKNOWN';
		},
        getResults: function(){
            var out = new Array();
            var bar_width = 100;
            var results = this.activity.result;
            $.each(results, function(key, result){
                var actual_val = result.indicator.period.actual.value.replace(",","");
                var target_val = result.indicator.period.target.value.replace(",","");
                var percentage = actual_val/target_val;
                if (percentage > 1) {
                    percentage = 1;
                }
                var num_pixels = percentage * bar_width;
                if (parseInt(num_pixels)){                     
                    out.push({
                    'title': result.indicator.title,
                    'value': num_pixels
                    })
                }

            });
            console.warn(out);
            return out;
        },

		doTransactionChart: function() {

			var transactions = this.activity.transaction;

			var years = _.unique(
				_.map(transactions, getTransactionYear)
			);
			years.sort(function(a,b) { return a == b ? 0 : a > b ? 1 : -1; });

			var totals = [];
			var commitmentTransactions = [];
			var disbursementTransactions = [];

			_.each(transactions, function(t) {
				// ]if (t.value.currency !== 'USD') return;
				var year = getTransactionYear(t);
				var yearIndex = years.indexOf(year);
				totals[yearIndex] = (totals[yearIndex] || 0) + +t.value.content;
				if (t['transaction-type'].code === 'D') {
					disbursementTransactions[yearIndex] = (disbursementTransactions[yearIndex] || 0) + +t.value.content;
				}
				if (t['transaction-type'].code === 'C') {
					commitmentTransactions[yearIndex] = (commitmentTransactions[yearIndex] || 0) + +t.value.content;
				}
			});

			$('<div>').appendTo(this.$el).highcharts({
				title: {
					text: 'Transactions'
				},
				xAxis: {
					categories: years
				},
				series: [
                /*{
					data: totals,
					step: 'tt',
					name: 'Total transactions'
				}, {
					data: commitmentTransactions,
					step: 'ct',
					name: 'Commitment transactions'
				}, */
                {
					data: disbursementTransactions,
					step: 'dt',
					name: 'Disbursements'
				}]

			});
		}

	});
});
