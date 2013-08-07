
define(function(require) {
	'use strict';

	var template = _.template( $('#reportTemplate').html() );

	function formatCurrency(n) {
        if (typeof n=='undefined') return;
        n = n.toString();
        var pattern = /(-?\d+)(\d{3})/;
        while (pattern.test(n))
            n = n.replace(pattern, "$1,$2");
        return n;
	}

    function cleanValue(value){
        if (typeof(value!='undefined')) {
            value = String(value);
            return Number(value.replace(",",""));
        }
    }

	function getTransactionYear(t) {
		// Grab 2003 from e.g. "2003-07-01"
		return +t['transaction-date']['iso-date'].substring(0, 4);
	}

    function getDocumentData(out, the_document) {
        console.warn(the_document);
        var category = the_document.category.content ? the_document.category : '[Unknown]';
        var category_code = the_document.category.code ? the_document.category : '[Unknown]';
        var format = the_document.format ? the_document.format : '[Unknown]';
        var title = the_document.title.content ? the_document.title.content : the_document.title;
        var url = the_document.url ? the_document.url: '';

        out.push({
        'category': category,
        'category_code': category_code,
        'format': format,
        'title': title,
        'url': url
        })
        return out
    }

	return Backbone.View.extend({

		initialize: function() {
			console.log('Activity -->', this.options.activity);
			this.activity = this.options.activity;
			this.render();
		},

		render: function() {
            if (!this.activity.title) {
                var the_title = "Untitled activity";
            } else if (this.activity.title.content) {
                var the_title = this.activity.title.content;
            } else if (typeof this.activity.title == 'string') {
                var the_title = this.activity.title;
            } else {
                var the_title = this.activity.title[0].content;
            }
            if (!this.activity.description) {
                var the_description = "";
            } else if (this.activity.description.content) {
                var the_description = this.activity.description.content;
            } else {
                var the_description = this.activity.description;
            }
			this.$el.html( template({
				title: the_title,
				description: the_description,
				iati_identifier: this.activity["iati-identifier"],
				participatingOrgs: this.activity['participating-org'],
				stats: [
					/*{
						name: 'Transactions total', 
						value: formatCurrency( this.getTransactionTotal() ) + ' ' + this.getCurrency() 
					},*/
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
                results: this.getResults(),
                documents: this.getDocuments()
			}) );
			//this.doTransactionChart();
		},

		getTransactionTotal: function(filter) {
			var sum = 0;
            if (typeof this.activity.transaction =='undefined') return;

            if (this.activity.transaction.value) {
                sum += cleanValue(this.activity.transaction.value.content);
            } else {
			    _.each(this.activity.transaction, function(t) {
				    // if (t.value.currency !== 'USD') return;
				    if (filter && !filter(t)) return;
                    if (typeof t.value == 'undefined') return;
                        sum += cleanValue(+t.value.content);
			    });
            }
			return sum;
		},

		getCurrency: function() {
			// TODO: Ensure it's safe to assume all transactions are same currency!
			var transactions = this.activity.transaction;
            if (transactions) {
			    for (var i = 0, l = transactions.length; i < l; ++i) {
				    if (transactions[i].value.currency) {
					    return transactions[i].value.currency;
				    }
			    }
            }
			return '';
		},
        getResults: function(){
            var out = new Array();
            var bar_width = 100;
            var results = this.activity.result;
            if (results) {
                $.each(results, function(key, result){
                    if (result.indicator.period.actual) {
                        var actual_val = cleanValue(result.indicator.period.actual.value);
                    }
                    if (result.indicator.period.target) {
                        var target_val = cleanValue(result.indicator.period.target.value);
                    }
                    var percentage = actual_val/target_val;
                    if (percentage > 1) {
                        percentage = 1;
                    }
                    var num_pixels = percentage * bar_width;
                    if (parseInt(num_pixels)){                     
                        out.push({
                        'title': result.indicator.title,
                        'target': target_val,
                        'actual': actual_val,
                        'value': num_pixels
                        })
                    }

                });
            }
            return out;
        },
        getDocuments: function(){
            var out = new Array();
            var documents=this.activity["document-link"];
            if (documents) {
                if (documents.url) {
                    out = getDocumentData(out, documents);
                } else {
                    $.each(documents, function(key, document){
                        out = getDocumentData(out, document);
                    });
                }
            }
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
