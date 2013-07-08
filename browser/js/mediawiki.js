var Mediawiki = {};

(function() {
    
    function convertTop() {
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getData().length === 0) return;
    
            var div_id_top = DS.getName()+"-top-mw";
            
            if ($("#"+div_id_top).length > 0) {
                if ($("#"+div_id_top).data('show_all')) show_all = true;
                var top_metric = $("#"+div_id_top).data('metric');
                var limit = $("#"+div_id_top).data('limit');
                var show_all = false;
                var graph = null;
                Viz.displayTop(div_id_top, DS, show_all, top_metric, graph, limit);
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
