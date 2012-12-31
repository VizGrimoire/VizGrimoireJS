/*
 * *
 * Copyright (C) 2012, Bitergia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * DataSource.js: Library for visualizing Bitergia SCM data
 */


// TODO: Use attributes for getters and setters 
function DataSource(name, basic_metrics, displayData) {

    this.name = name;
    this.data_file = 'data/json/'+this.name+'-milestone0.json';
    this.demographics_file = 'data/json/'+this.name+'-demographics-2012.json';
    this.global_data_file = 'data/json/'+this.name+'-info-milestone0.json';
    this.top_data_file = 'data/json/'+this.name+'-top-milestone0.json';
    this.data = null;
    this.demographics_data = null;
    this.global_data = null;

    this.getMetrics = function() {
        return this.basic_metrics;
    };  
    this.getMainMetric = function() {
        return this.basic_metrics.main_metric;
    };
    
    this.getDataFile = function() {
        return this.data_file;
    };
    this.setDataFile = function(file) {
        this.data_file = file;
    };
    this.getData = function() {
        return this.data;
    };
    this.setData = function(load_data) {
        this.data = load_data;
    };
    this.getDemographicsFile = function() {
        return this.demographics_file;
    };
    this.getDemographicsData = function() {
        return this.demographics_data;
    };
    this.setDemographicsData = function(data) {
        this.demographics_data = data;
    };
    this.setDataDir = function(dataDir) {
        this.data_file = dataDir + '/'+this.name+'-milestone0.json';
        this.demographics_file = dataDir + '/'+this.name+'-demographics-2012.json';
        this.global_data_file = dataDir + '/'+this.name+'-info-milestone0.json';
        this.top_data_file = dataDir + '/'+this.name+'-top-milestone0.json';
    };
    this.getGlobalDataFile = function() {
        return this.global_data_file;
    };
    this.getGlobalData = function() {
        return this.global_data;
    };
    this.setGlobalData = function(data) {
        this.global_data = data;
    };
    this.getName = function() {
        return this.name;
    };

    this.basic_metrics = basic_metrics; 
        
    this.displayData = function() {
        if (getName() === "scm") {
            $("#scmFirst").text(global_data.first_date);
            $("#scmLast").text(global_data.last_date);
            $("#scmCommits").text(global_data.commits);
            $("#scmAuthors").text(global_data.authors);
            $("#scmCommitters").text(global_data.committers);
        }
    };

    // Create HTML code to show the metrics
    this.displayBasicHTML = function(div_target, config) {
        var title = "";
        if (getName() === "scm") {
            title = "Change sets (commits to source code)";
        }
        Viz.displayBasicHTML(this.getData(), div_target, title, 
                this.basic_metrics, this.name+'_hide', config);
    };

    this.displayBasicMetricHTML = function(metric_id, div_target, config) {
        Viz.displayBasicMetricHTML(this.basic_metrics[metric_id], this.getData(),
                div_target, config);
    };

    this.displayTop = function(div, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, this.top_data_file, this.basic_metrics, all,graph);
    };

    this.displayBubbles = function(divid) {
        if (getName() === "scm") {
            Viz.displayBubbles(divid, "commits", "committers");
        }
    };

    this.displayDemographics = function(divid, file) {
        Viz.displayDemographics(divid, this, file);
    };

    this.displayBasic = function() {
        basicEvo(this.getData());
    };

    this.basicEvo = function(history) {
        for (var id in basic_metrics) {
            var metric = this.basic_metrics[id];
            if ($.inArray(metric.column, Report.getConfig()[getName()+"_hide"]) > -1)
                continue;
            if ($('#' + metric.divid).length)
                Viz.displayBasicLines(metric.divid, history, metric.column,
                        true, metric.name);
        };
    };

    this.displayEvo = function(id) {
        envisionEvo(id, this.getData());
    };

    this.envisionEvo = function(div_id, history) {
        this.config = Report.getConfig();
        this.main_metric = getMainMetric(); // "commits";
        this.options = Viz.getEnvisionOptions(div_id, history, this.basic_metrics,
                main_metric, config.scm_hide);
        new envision.templates.Envision_Report(options, [ this ]);
    };
}