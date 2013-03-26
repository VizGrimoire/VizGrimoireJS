var Dashboard = {};

(function() {
    
    function getAllProjects() {
        var projects = {};
        $.each(Report.getDataSources(), function(index, ds) {
            var repos = ds.getReposData();
            projects[ds.getName()] = repos;
        });
        return projects;
    }
    
    function getAllCompanies() {
        var companies = {};
        $.each(Report.getDataSources(), function(index, ds) {
            var companies_ds = ds.getCompaniesData();
            companies[ds.getName()] = companies_ds;
        });
        return companies;
    }
    
    function getAllMetrics() {
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
                $('#filter_projects').append("PROJECTS<br>");
                $.each(getAllProjects(), function(ds, projects) {
                    $('#filter_projects').append(ds + "<ul>");
                    $.each(projects, function(index, project) {
                        var aux = project.split("_");
                        label = aux.pop();
                        if (label === "") label = aux.pop(); 
                        $('#filter_projects').append("<li>"+label+"</li>");
                    });
                    $('#filter_projects').append("</ul>");
                });
            }
        },
        "filter_metrics": {
            convert: function() {
                $('#filter_metrics').append('METRICS<br>');
                $.each(getAllMetrics(), function(ds, metrics) {
                    $('#filter_metrics').append(ds + "<ul>");
                    $.each(metrics, function(index, metric) {
                        $('#filter_metrics').append("<li>"+metric+"</li>");
                    });                    
                });
            }
        },
        "filter_companies": {
            convert: function() {
                $('#filter_companies').append('COMPANIES<br>');
                $.each(getAllCompanies(), function(ds, companies) {
                    $('#filter_companies').append(ds + "<ul>");
                    $.each(companies, function(index, company) {
                        $('#filter_companies').append("<li>"+company+"</li>");
                    });
                });
            }
        },
        "dashboard_viz": {
            convert: function() {
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

