var Mediawiki = {};

(function() {

    var top100 = [];
    var actor = "mergers";
    var action = "merged";

    Mediawiki.getTop100 = function() {
        return top100;
    };
    
    function getIdByName(item) {
        var id = 0;
        var data = Mediawiki.getTop100();
        for (var i = 0; i<data.id.length;i++) {
            if (data[actor][i] === item) {
                id = data.id[i];
                break;
            }
        }
        return id;
    }

    function displayTopLarge(div) {
        var top_file = Report.getDataDir()+"/scr-top-100.json";
        var html = "", table = "";
        table += "<table class='table-hover'>";
        $.getJSON(top_file, function(top_data) {
            top100 = top_data;
            var id, name, activity;
            for (var i = 0; i<top_data.id.length;i++) {
               name = top_data[actor][i];
               activity = top_data[action][i];
               id = top_data.id[i];
               table += "<tr><td>";
               table += "<a href='people.html?id="+id+"&name="+name+"'>";
               table += name;
               table += "</a></td><td>"+activity;
               table += "</td></tr>";
            }
            table += "</table>";
            html +="<FORM>Search ";
            html +='<input type="text" class="typeahead">';
            html += "</FORM>";
            html += table;
            $("#"+div).append(html);
            $('.typeahead').typeahead({
                source: top100[actor],
                updater: function (item) {
                    var id = getIdByName(item);
                    var url = "people.html?id="+id+"&name="+item;
                    window.open(url,"_self");
                    return item;
                }
            });
        });
    }

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
    
    function convertTopLarge() {
        var mark = "TopLarge";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                // var metric = $(this).data('metric');
                displayTopLarge(div.id);
            });
        }
    }

    Mediawiki.build = function() {
        convertTopLarge();
    };
})();

Loader.data_ready(function() {
    Mediawiki.build();
});
