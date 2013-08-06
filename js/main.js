require.config({
	baseUrl: 'js/'
});
require(['app'], function(app) {
	app.init();
});