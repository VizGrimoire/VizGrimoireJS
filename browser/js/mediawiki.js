var Mediawiki = {};

(function() {

    var contribs_people = [];
    var contribs_companies = [];

    Mediawiki.getContribsPeople = function() {
        return contribs_people;
    };

    Mediawiki.getContribsCompanies = function() {
        return contribs_companies;
    };

    function getIdByName(item, type) {
        var id = 0;
        var data = null; 
        if (type === "companies")
            data = Mediawiki.getContribsCompanies();
        else if (type === "people")
            data = Mediawiki.getContribsPeople();
        else return id;

        for (var i = 0; i<data.id.length;i++) {
            if (data.name[i] === item) {
                id = data.id[i];
                break;
            }
        }
        return id;
    }

    function displayContribs(div, type) {
        var contribs_file = "";
        if (type === "companies")
            contribs_file = Report.getDataDir()+"/scr-companies-all.json";
        else if (type === "people") 
            contribs_file = Report.getDataDir()+"/scr-people-all.json";
        else return;

        var html = "", table = "";
        table += "<table class='table-hover'>";
        $.getJSON(contribs_file, function(contribs_data) {
            if (type === "people") contribs_people = contribs_data;
            if (type === "companies") contribs_companies = contribs_data;
            var id, name, total;
            for (var i = 0; i<contribs_data.id.length;i++) {
               name = contribs_data.name[i];
               total = contribs_data.total[i];
               id = contribs_data.id[i];
               table += "<tr><td>";
               if (type === "people")
                   table += "<a href='people.html?id="+id+"&name="+name+"'>";
               if (type === "companies")
                   table += "<a href='company.html?id="+id+"&name="+name+"'>";
               table += name;
               table += "</a></td><td>"+total;
               table += "</td></tr>";
            }
            table += "</table>";
            html +="<FORM>Search ";
            html +='<input type="text" class="typeahead">';
            html += "</FORM>";
            html += table;
            $("#"+div).append(html);
            var data_source = null, updater = null;
            
            if (type === "people") {
                data_source = contribs_people.name;
                updater = function(item) {
                    var id = getIdByName(item, type);
                    var url = "people.html?id="+id+"&name="+item;
                    window.open(url,"_self");
                    return item;                
                };
            }
            else if (type === "companies") {
                data_source = contribs_companies.name;
                updater = function(item) {
                    var id = getIdByName(item, type);
                    var url = "company.html?id="+id+"&name="+item;
                    window.open(url,"_self");
                    return item;                
                };
            }
            $('.typeahead').typeahead({
                source: data_source,
                updater: updater
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

    function convertContribs() {
        var mark = "Contribs";
        var divs = $("."+mark);
        if (divs.length > 0) {
            var unique = 0;
            $.each(divs, function(id, div) {
                div.id = mark + (unique++);
                // var metric = $(this).data('metric');
                var type = $(this).data('type');
                displayContribs(div.id, type);
            });
        }
    }

    Mediawiki.build = function() {
        convertContribs();
    };
})();

Loader.data_ready(function() {
    Mediawiki.build();
});
