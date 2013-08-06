
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

	return Backbone.View.extend({

		initialize: function() {
			console.log('Activity -->', this.options.activity);
			this.activity = this.options.activity;
			this.render();
		},

		render: function() {
			this.$el.html( template({
				title: this.activity.title.content,
				description: this.activity.description.content,
				participatingOrgs: this.activity['participating-org'],
				stats: [
					{
						name: 'Transactions total', 
						value: formatCurrency( this.getTransactionTotal() ) + ' USD' 
					},
					{
						name: 'Disbursement total', 
						value: formatCurrency(this.getTransactionTotal(function(t) {
							return t['transaction-type'].code === 'D'
						})) + ' USD' 
					},
					{
						name: 'Commitment total', 
						value: formatCurrency(this.getTransactionTotal(function(t) {
							return t['transaction-type'].code === 'C'
						})) + ' USD' 
					}
				]
			}) );
		},

		getTransactionTotal: function(filter) {
			var sum = 0;
			_.each(this.activity.transaction, function(t) {
				if (t.value.currency !== 'USD') return;
				if (filter && !filter(t)) return;
				sum += +t.value.content;
			});
			return sum;
		}

	});
});