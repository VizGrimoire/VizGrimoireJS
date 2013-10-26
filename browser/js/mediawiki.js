var Mediawiki = {};

(function() {

    var contribs_people = null, contribs_people_quarters = null;
    var contribs_companies = null, contribs_companies_quarters = null;
    
    Mediawiki.getContribsPeople = function() {
        return contribs_people;
    };

    Mediawiki.getContribsCompanies = function() {
        return contribs_companies;
    };

    Mediawiki.getContribs = function(type, quarters) {
        var contribs_data = null;
        
        if (type === "companies" && !quarters) 
            contribs_data = contribs_companies;
        else if (type === "companies" && quarters) 
            contribs_data = contribs_companies_quarters;
        else if (type === "people" && !quarters) 
            contribs_data = contribs_people;
        else if (type === "people" && quarters) 
            contribs_data = contribs_people_quarters;
        return contribs_data;
    };
    
    Mediawiki.getContribsFile = function(type, quarters) {
        var filename = null;
        if (type === "companies" && !quarters)
            filename = Report.getDataDir()+"/scr-companies-all.json";
        else if (type === "companies" && quarters)
            filename = Report.getDataDir()+"/scr-companies-quarters.json";
        else if (type === "people" && !quarters) 
            filename = Report.getDataDir()+"/scr-people-all.json";
        else if (type === "people" && quarters)
            filename = Report.getDataDir()+"/scr-people-quarters.json";
        return filename;    
    };
    
    Mediawiki.setContribs = function (type, quarters, data) {
        if (type === "people" && !quarters) contribs_people = data;
        if (type === "people" && quarters) contribs_people_quarters = data;
        if (type === "companies" && !quarters) contribs_companies = data;
        if (type === "companies" && quarters) contribs_companies_quarters = data;
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
    
    function showContribs(div, type, quarter, search) {
        var quarters = false;
        if (quarter) quarters = true;
        var contribs_data = Mediawiki.getContribs(type, quarters);
        if (quarter) contribs_data = contribs_data[quarter];
        var html = "", table = "";

        table += "<table class='table-hover'>";
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
        if (search) {
            html +="<FORM>Search ";
            html +='<input type="text" class="typeahead">';
            html += "</FORM>";
        }
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
    }
    
    function loadContribsShow (type, div, quarter, search) {
        var quarters = false;
        if (quarter) quarters = true;
        var contribs_file = Mediawiki.getContribsFile(type, quarters);
        if (contribs_file === null) return;

        $.getJSON(contribs_file, function(contribs_data) {
            Mediawiki.setContribs(type, quarters, contribs_data);
            showContribs(div, type, quarter, search);
        });
    }

    function displayContribs(div, type, quarter, search) {
        var quarters = false;
        if (quarter) quarters = true;
        if (!Mediawiki.getContribs(type, quarters)) {
            loadContribsShow (type, div, quarter, search);
        }
        else showContribs(div, type, quarter, search);
    }

    // All sample function
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
                var type = $(this).data('type');
                var quarter = $(this).data('quarter');
                var search = $(this).data('search');
                if (search === undefined) search = true;
                displayContribs(div.id, type, quarter, search);
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
