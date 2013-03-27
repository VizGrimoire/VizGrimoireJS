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

    var dashboard_divs = {
        "filter_projects": {
            convert: function() {
                var div = $('#filter_projects');
                var div_ds = div.data('ds');
                var limit = div.data('limit');
                var order = div.data('order');
                div.append("PROJECTS<br>");
                $.each(getAllProjects(limit, order), function(ds, projects) {
                    if (div_ds && div_ds !== ds) return;
                    div.append(ds + "<ul>");
                    $.each(projects, function(index, project) {
                        var aux = project.split("_");
                        label = aux.pop();
                        if (label === "") label = aux.pop(); 
                        div.append("<li>"+label+"</li>");
                    });
                    div.append("</ul>");
                });
            }
        },
        "filter_metrics": {
            convert: function() {
                var div = $('#filter_metrics');
                var div_ds = div.data('ds');
                var limit = div.data('limit');
                div.append('METRICS<br>');
                $.each(getAllMetrics(limit), function(ds, metrics) {
                    if (div_ds && div_ds !== ds) return;
                    div.append(ds + "<ul>");
                    $.each(metrics, function(index, metric) {
                        div.append("<li>"+metric+"</li>");
                    });
                    div.append("</ul>");
                });
            }
        },
        "filter_companies": {
            convert: function() {
                var div = $('#filter_companies');
                var div_ds = div.data('ds');
                var limit = div.data('limit');
                var order = div.data('order');
                div.append('COMPANIES<br>');
                $.each(getAllCompanies(limit,order), function(ds, companies) {
                    if (div_ds && div_ds !== ds) return;
                    div.append(ds + "<ul>");
                    $.each(companies, function(index, company) {
                        div.append("<li>"+company+"</li>");
                    });
                });
                div.append("</ul>");
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

