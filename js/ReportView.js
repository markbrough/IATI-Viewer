
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
				stats: [
					{
						name: 'Transactions total', 
						value: formatCurrency( this.getTransactionTotal() ) + ' USD' 
					}
				]
			}) );
		},

		getTransactionTotal: function() {
			var sum = 0;
			_.each(this.activity.transaction, function(t) {
				if (t.value.currency !== 'USD') return;
				sum += +t.value.content;
			});
			return sum;
		}

	});
});