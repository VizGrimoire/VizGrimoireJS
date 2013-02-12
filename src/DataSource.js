/* 
 * Copyright (C) 2012 Bitergia
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * This file is a part of the VizGrimoireJS package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 */

// TODO: Use attributes for getters and setters

function DataSource(name, basic_metrics) {
    
    this.top_data_file = this.data_dir + '/'+this.name+'-top.json';
    this.getTopDataFile = function() {
        return this.top_data_file;
    };
    
    this.basic_metrics = basic_metrics;
    this.getMetrics = function() {
        return this.basic_metrics;
    };
    
    this.data_file = this.data_dir + '/'+this.name+'-evolutionary.json';
    this.getDataFile = function() {
        return this.data_file;
    };
    this.setDataFile = function(file) {
        this.data_file = file;
    };
    
    this.data = null;
    this.getData = function() {
        return this.data;
    };
    this.setData = function(load_data, self) {
        if (self === undefined) self = this;
        self.data = load_data;
    };
    
    
    this.demographics_file = this.data_dir + '/'+this.name+'-demographics-2012.json';
    this.getDemographicsFile = function() {
        return this.demographics_file;
    };
    
    this.demographics_data = null;
    this.getDemographicsData = function() {
        return this.demographics_data;
    };
    this.setDemographicsData = function(data, self) {
        if (self === undefined) self = this;
        self.demographics_data = data;
    };
    
    this.data_dir = 'data/json';
    this.getDataDir = function() {
        return this.data_dir;
    };
    this.setDataDir = function(dataDir) {
        this.data_dir = dataDir;
        this.data_file = dataDir + '/'+this.name+'-evolutionary.json';
        this.demographics_file = dataDir + '/'+this.name+'-demographics-2012.json';
        this.global_data_file = dataDir + '/'+this.name+'-static.json';
        this.top_data_file = dataDir + '/'+this.name+'-top.json';
        this.companies_data_file = dataDir+'/'+ this.name +'-companies.json';
        this.repositories_data_file = dataDir+'/'+ this.name +'-repos.json';
    };
    

    this.global_data_file = this.data_dir + '/'+this.name+'-static.json';
    this.getGlobalDataFile = function() {
        return this.global_data_file;
    };
    
    this.global_data = null;
    this.getGlobalData = function() {
        return this.global_data;
    };
    this.setGlobalData = function(data, self) {
        if (self === undefined) self = this;
        self.global_data = data;
    };
    
    this.global_top_data = null;
    this.getGlobalTopData = function() {
        return this.global_top_data;
    };
    this.setGlobalTopData = function(data, self) {
        if (self === undefined) self = this;
        self.global_top_data = data;
    };
    this.addGlobalTopData = function(data, self, metric, period) {
        if (period === undefined) period = "all";
        if (self === undefined) self = this;
        if (self.global_top_data === null)
            self.global_top_data = {};
        if (self.global_top_data[metric] === undefined)
            self.global_top_data[metric] = {};
        self.global_top_data[metric][period] = data;
    };

    this.name = name;    
    this.getName = function() {
        return this.name;
    };

    this.people_data_file = this.data_dir + '/'+this.name+'-people.json';
    this.getPeopleDataFile = function() {
        return this.people_data_file;
    };

    this.people = null;
    this.getPeopleData = function() {
        return this.people;
    };
    this.setPeopleData = function(people, self) {
        if (self === undefined) self = this;
        self.people = people;
    };
    
    this.project = null;
    this.getProject = function() {
        return this.project;
    };
    this.setProject = function(project) {
        this.project = project;
    };
    
    // Companies data
    this.companies_data_file = this.data_dir+'/'+ this.name +'-companies.json';
    this.getCompaniesDataFile = function() {
        return this.companies_data_file;
    };

    this.companies = null;
    this.getCompaniesData = function() {
        return this.companies;
    };
    this.setCompaniesData = function(companies, self) {
        if (self === undefined) self = this;
        self.companies = companies;
    };

    this.companies_metrics_data = {};
    this.addCompanyMetricsData = function(company, data, self) {
        if (self === undefined) self = this;
        self.companies_metrics_data[company] = data;
    };
    this.getCompaniesMetricsData = function() {
        return this.companies_metrics_data;
    };

    this.companies_global_data = {};
    this.addCompanyGlobalData = function(company, data, self) {
        if (self === undefined) self = this;
        self.companies_global_data[company] = data;
    };
    this.getCompaniesGlobalData = function() {
        return this.companies_global_data;
    };

    this.companies_top_data = {};
    this.addCompanyTopData = function(company, data, self, period) {
        if (period === undefined) period = "all";
        if (self === undefined) self = this;
        if (self.companies_top_data[company] === undefined)
            self.companies_top_data[company] = {};
        self.companies_top_data[company][period] = data;
    };
    this.getCompaniesTopData = function() {
        return this.companies_top_data;
    };
    this.setCompaniesTopData = function(data, self) {
        if (self === undefined) self = this;
        self.companies_top_data = data;
    };

    // Repositories data
    this.repositories_data_file = 
        this.data_dir+'/'+ this.name +'-repos.json';
    this.getRepositoriesDataFile = function() {
        return this.repositories_data_file;
    };

    this.repositories = null;
    this.getRepositoriesData = function() {
        return this.repositories;
    };
    this.setRepositoriesData = function(repositories, self) {
        if (self === undefined) self = this;
        self.repositories = repositories;
    };

    this.repositories_metrics_data = {};
    this.addRepositoryMetricsData = function(repository, data, self) {
        if (self === undefined) self = this;
        self.repositories_metrics_data[repository] = data;
    };
    this.getRepositoriesMetricsData = function() {
        return this.repositories_metrics_data;
    };

    this.repositories_global_data = {};
    this.addRepositoryGlobalData = function(repository, data, self) {
        if (self === undefined) self = this;
        self.repositories_global_data[repository] = data;
    };
    this.getRepositoriesGlobalData = function() {
        return this.repositories_global_data;
    };

    // TODO: Move this login to Report
    this.getCompanyQuery = function () {
        var company = null;
        var querystr = window.location.search.substr(1);
        if (querystr  &&
                querystr.split("&")[0].split("=")[0] === "company")
            company = querystr.split("&")[0].split("=")[1];
        return company;
    };

    // TODO: data and projects should be in the same dictionary
    this.displayBasicHTML = function(div_target, config, title) {
        var full_data = [];
        var projects = [];
        var ds_name = this.getName();

        $.each(Report.getDataSources(), function (index, ds) {
           if (ds.getName() === ds_name) {
               if (ds.getData() instanceof Array) return;
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        Viz.displayBasicHTML(full_data, div_target, this.getTitle(), 
                this.basic_metrics, this.name+'_hide', config, projects);
    };

    this.displayBasicMetricCompanies = function(metric_id,
            div_target, config, limit, order_by) {
        if (order_by === undefined) order_by = metric_id;
        var companies_data = this.getCompaniesMetricsData();
        if (limit) {
            var sorted_companies = this.sortCompanies(order_by);
            if (limit > sorted_companies.length) 
                limit = sorted_companies.length; 
            var companies_data_limit = {};
            for (var i=0; i<limit; i++) {
                var company = sorted_companies[i];
                companies_data_limit[company] = companies_data[company];
            }
            companies_data = companies_data_limit;
        }
        Viz.displayBasicMetricCompaniesHTML(metric_id, companies_data,
                div_target, config, limit);
    };

    this.displayBasicMetricCompaniesStatic = function (metric_id,
            div_target, config, limit, order_by, show_others) {
        
        this.displayBasicMetricReportStatic ("companies",metric_id,
                div_target, config, limit, order_by, show_others);
    };
    
    this.displayBasicMetricReposStatic = function (metric_id,
            div_target, config, limit, order_by, show_others) {
        
        this.displayBasicMetricReportStatic ("repos", metric_id,
                div_target, config, limit, order_by, show_others);
    };
    
    this.displayBasicMetricReportStatic = function (report, metric_id,
            div_target, config, limit, order_by, show_others) {
        if (order_by === undefined) order_by = metric_id;
        var data = null;
        if (report=="companies")
            data = this.getCompaniesGlobalData();
        else if (report=="repos")
            data = this.getRepositoriesGlobalData();
        else return;
        if (limit) {
            var sorted = null;
            if (report=="companies")
                sorted = this.sortCompanies(order_by);
            else if (report=="repos")
                sorted = this.getRepositoriesData();
            if (limit > sorted.length) limit = sorted.length; 
            var data_limit = {};
            for (var i=0; i<limit; i++) {
                var item = sorted[i];
                data_limit[item] = data[item];
            }

            // Add a final companies_data for the sum of other values
            if (show_others) {
                var others = 0;
                for (var i=limit; i<sorted.length; i++) {
                    var item = sorted[i];
                    others += data[item][metric_id];
                }
                data_limit.others = {};
                data_limit.others[metric_id] = others;
            }
            data = data_limit;
        }
        
        Viz.displayBasicMetricReportStatic(metric_id, data,
            div_target, config, limit);
    };    

    this.displayBasicMetricsCompany = function (
            company, metrics, div_id, config) {
        Viz.displayBasicMetricsCompany(company, metrics,
                this.getCompaniesMetricsData()[company], div_id, config);
    };

    this.displayBasicMetrics = function(metric_ids, div_target, config) {
        Viz.displayBasicMetricsHTML(metric_ids, this.getData(),
                div_target, config);
    };

    this.displayBasicMetricHTML = function(metric_id, div_target, config) {
        var projects = [];
        var full_data = [];
        var ds_name = this.getName();
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds.getName() === ds_name) {
               if (ds.getData() instanceof Array) return;
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });

        Viz.displayBasicMetricHTML(this.basic_metrics[metric_id], full_data,
                div_target, config, projects);
    };
    
    this.displayBasic = function() {
        this.basicEvo(this.getData());
    };

    this.sortCompanies = function(metric_id) {
        if (metric_id === undefined) metric_id = "commits";
        var metric = [];
        var sorted_companies = [];
        var companies = this.getCompaniesGlobalData();
        if (companies[this.getCompaniesData()[0]][metric_id] === undefined)
            metric_id = "commits";
        $.each(companies, function(company, data) {
           metric.push(data[metric_id]);
        });
        metric.sort(function(a, b) {return b - a;});
        $.each(metric, function(id, value) {
            $.each(companies, function(company, data) {
                if (data[metric_id] === value) {
                    sorted_companies.push(company);
                    return false;
                }
             });
        });
        return sorted_companies;
    };

    // TODO: We need the sort metric
    this.displayCompaniesNav = function (div_nav, sort_metric) {
        var nav = "<span id='nav'></span>";
        var sorted_companies = this.sortCompanies(sort_metric);
        $.each(sorted_companies, function(id, company) {
            nav += "<a href='#"+company+"-nav'>"+company + "</a> ";
        });
        $("#"+div_nav).append(nav);
    };

    this.displayCompaniesList = function (metrics,div_id, config_metric, sort_metric) {
        var list = "";
        var companies_data = this.getCompaniesMetricsData();
        var sorted_companies = this.sortCompanies(sort_metric);

        // Preserve order when float right
        metrics.reverse();

        $.each(sorted_companies, function(id, company) {
            list += "<div class='companies-list' id='"+company+"-nav'>";
            list += "<div style='float:left;'>";
            list += "<a href='company.html?company="+company+"'>";
            list += "<strong>"+company+"</strong> +info</a>";
            list += "<br><a href='#nav'>^</a>";
            list += "</div>";
            $.each(metrics, function(id, metric) {
                list += "<div id='"+company+"-"+metric+"'";
                list +=" class='companies-list-item'></div>";
            });
            list += "</div>";
        });
        $("#"+div_id).append(list);
        // Draw the graphs
        $.each(sorted_companies, function(id, company) {
            var data = companies_data[company];
            $.each(metrics, function(id, metric) {
                var div_id = company+"-"+metric;
                var companies = {};
                companies[company] = data;
                var title = metric;
                Viz.displayMetricCompaniesLines(div_id, metric, companies, title);
            });
        });
    };

    this.displayCompanySummary = function(divid, company, ds) {
        var html = "<h1>"+company+"</h1>";
        var id_label = {
                commits:'Total commits',
                authors:'Total authors',
                first_date:'Initial activity',
                last_date:'Last activity',
                files:'Total files',
                actions:'Total files actions',
                avg_commits_month:'Commits per month',
                avg_files_month:'Files per month',
                avg_commits_author:'Commits per author',
                avg_authors_month:'Authors per month',
                avg_reviewers_month:'Reviewers per moth',
                avg_files_author:'Files per author'
        };
        $.each(ds.getCompaniesGlobalData()[company],function(id,value) {
            html += id_label[id] + ": " + value + "<br>";
        });
        $("#"+divid).append(html);
    };

    this.displayCompaniesSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();

        html += "Total companies: " + data.companies +"<br>";
        html += "Companies in 2006: " + data.companies_2006+"<br>";
        html += "Companies in 2009: " + data.companies_2009+"<br>";
        html += "Companies in 2012: " + data.companies_2012+"<br>";

        $("#"+divid).append(html);
    };
    
    
    this.displayRepositoriesSummary = function(divid, ds) {
        var html = "";
        var data = ds.getGlobalData();
        html += "Total repositories: " + data.repositories +"<br>";
        $("#"+divid).append(html);
    };
    

    this.displayDemographics = function(divid, file) {
        Viz.displayDemographics(divid, this, file);
    };

    this.displayTimeToFix = function(div_id, json_file, column, labels, title) {
        Viz.displayTimeToFix(div_id, json_file, column, labels, title);
    };
    
    this.displayTop = function(div, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, this, all, graph);
    };

    this.displayTopCompany = function(company, div, metric, period, titles) {
        Viz.displayTopCompany(company, div, this, metric, period, titles);
    };

    this.displayTopGlobal = function(div, metric, period, titles) {
        Viz.displayTopGlobal(div, this, metric, period, titles);
    };

    this.basicEvo = function(history) {
        for (var id in this.basic_metrics) {
            var metric = this.basic_metrics[id];
            if ($.inArray(metric.column, Report.getConfig()[this.getName()+"_hide"]) > -1)
                continue;
            if ($('#' + metric.divid).length)
                Viz.displayBasicLines(metric.divid, history, metric.column,
                        true, metric.name);
        }
    };
    
    this.envisionEvo = function(div_id, history, relative) {
        config = Report.getConfig();
        var options = Viz.getEnvisionOptions(div_id, history, this.getName(),
                Report.getConfig()[this.getName()+"_hide"]);
        
        if (relative)
            Viz.addRelativeValues(options.data, this.getMainMetric());
        
        new envision.templates.Envision_Report(options, [ this ]);
    };
    
    this.displayEvo = function(divid, relative) {
        var projects_full_data = Report.getProjectsDataSources();
        
        this.envisionEvo(divid, projects_full_data, relative);
    };    
}
