require.config({
	baseUrl: 'js/'
});
require(['app'], function(app) {
    var args = new Array();
    args = {
        offset: 0
    }
	app.init(args);
    $("#next").click(function(){
        updateBrowser('next');
    });
    $("#reporting-org").change(function(){
        updateBrowser('reporting-org');
    });
    $("#recipient-country").change(function(){
        updateBrowser('recipient-country');
    });
    function updateBrowser(source) {
        if (source == 'next') {
            var offset = parseInt($("#next").attr('data-page'))+1;
        } else {
            var offset = 0;
        }
        var reporting_org = $("#reporting-org").val();
        var recipient_country = $("#recipient-country").val();
        var args = new Array();
        args = {
        offset: offset,
        reporting_org: reporting_org,
        recipient_country: recipient_country
        }
        $("#next").attr('data-page', offset);
        app.update(args);
    }
});


