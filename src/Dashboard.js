var Dashboard = {};

(function() {    
    function getAllProjects(limit, order) {
        var projects = {};
        $.each(Report.getDataSources(), function(index, ds) {
            var repos = ds.getReposData();
            if (order) repos = ds.sortRepos(order);
            if (limit) repos = repos.slice(0,limit-1);
            projects[ds.getName()] = repos;
        });
        return projects;
    }
    
    function getAllCompanies(limit, order) {
        var companies = {};
        $.each(Report.getDataSources(), function(index, ds) {
            var companies_ds = ds.getCompaniesData();
            if (order) companies_ds = ds.sortCompanies(order);
            if (limit) companies_ds = companies_ds.slice(0,limit-1);
            companies[ds.getName()] = companies_ds;
        });
        return companies;
    }
    
    function getAllMetrics(limit) {
        var metrics = {};
        $.each(Report.getDataSources(), function(index, ds) {
            var metrics_ds = ds.getMetrics();
            metrics[ds.getName()] = [];
            $.each(metrics_ds, function(name, metric) {
                metrics[ds.getName()].push(name);
            });                
        });
        return metrics;
    }
    
    function buildSelector(ds, name, options) {
        var html = name + "";
        html += "<form id='form_dashboard_'"+name+"'>";
        $.each(options, function(i,option) {
            html += '<input type=checkbox name="'+name+'_check_list" value="'
                + option + '" ';
//            html += 'onClick="';
//            html += 'Viz.displayGridMetric(\'' + metric_id + '\');';
//            html += '" ';
            html += 'id="' + option + '_check" ';
            // if ($.inArray(l, user_lists)>-1) html += 'checked ';
            html += '>';
            html += option;
            html += '<br>'; 
        });
        html += "</form>";
        return html;
    }
    
    function cleanName(name) {
        var aux = name.split("_");
        var label = aux.pop();
        if (label === "") label = aux.pop();
        return label;
    }

    var dashboard_divs = {
        "filter_projects": {
            convert: function() {
                var div = $('#filter_projects');
                var div_ds = div.data('ds');
                var limit = div.data('limit');
                var order = div.data('order');
                div.append("PROJECTS");
                if (limit) div.append(" (top "+limit+")");
                div.append("<br>");
                $.each(getAllProjects(limit, order), function(ds, projects) {
                    if (div_ds && div_ds !== ds) return;
                    var options = [];
                    $.each(projects, function(index, project) {
                        options.push(cleanName(project));
                    });
                    div.append(buildSelector(ds,"projects",options));
                });
            }
        },
        "filter_metrics": {
            convert: function() {
                var div = $('#filter_metrics');
                var div_ds = div.data('ds');
                var limit = div.data('limit');
                div.append('METRICS');
                if (limit) div.append(" (top "+limit+")");
                div.append("<br>");                
                $.each(getAllMetrics(limit), function(ds, metrics) {
                    if (div_ds && div_ds !== ds) return;
                    var options = [];
                    $.each(metrics, function(index, metric) {
                        options.push(metric);
                    });
                    div.append(buildSelector(ds,"metrics",options));
                });
            }
        },
        "filter_companies": {
            convert: function() {
                var div = $('#filter_companies');
                var div_ds = div.data('ds');
                var limit = div.data('limit');
                var order = div.data('order');
                div.append('COMPANIES');
                if (limit) div.append(" (top "+limit+")");
                div.append("<br>");
                $.each(getAllCompanies(limit,order), function(ds, companies) {
                    if (div_ds && div_ds !== ds) return;
                    var options = [];
                    $.each(companies, function(index, company) {
                        options.push(company);
                    });
                    div.append(buildSelector(ds,"companies",options));
                });

            }
        },
        "dashboard_viz": {
            convert: function() {
                var div = $('#dashboard_viz');
                $('#dashboard_viz').append('DASH VIZ');
            }
        },
    };
    
    Dashboard.build = function() {
        $.each (dashboard_divs, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert(); 
        });
    };    
})();

Loader.data_ready(function() {
    Dashboard.build();
});

