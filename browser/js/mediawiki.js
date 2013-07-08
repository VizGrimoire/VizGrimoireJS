var Mediawiki = {};

(function() {
    
    function displayTopList(div, ds, limit) {
        var top_file = ds.getTopDataFile();
        var basic_metrics = ds.getMetrics();
            
        $.getJSON(top_file, function(history) {
            $.each(history, function(key, value) {
                // ex: commits.all
                var data = key.split(".");
                var top_metric = data[0];
                var top_period = data[1];
                // List only all period 
                if (top_period !== "") return false;
                for (var id in basic_metrics) {
                    var metric = basic_metrics[id];
                    var html = '';
                    if (metric.column == top_metric) {
                        html = "<h4>"+top_metric+"</h4><ul>";
                        var top_data = value[top_metric];
                        var top_id = value.id;
                        for (var i=0; i<top_data.length; i++) {
                            html += "<li><a href='people.html?id=";
                            html += top_id[i]+"&name="+top_data[i]+"'>";
                            html += top_data[i]+"</a></li>";
                        }
                        html += "</ul>";
                        $("#"+div).append(html);
                        return false;
                    }
                }
            });
        });

        
    }
    
    function convertTop() {
        $.each(Report.getDataSources(), function(index, ds) {
            if (ds.getData().length === 0) return;
    
            var div_id_top = ds.getName()+"-top-mw";
            
            if ($("#"+div_id_top).length > 0) {
                if ($("#"+div_id_top).data('show_all')) show_all = true;
                var limit = $("#"+div_id_top).data('limit');
                displayTopList(div_id_top, ds, limit);
            }
        });
    }
    
    Mediawiki.build = function() {
        convertTop();
    };    
})();

Loader.data_ready(function() {
    Mediawiki.build();
});
