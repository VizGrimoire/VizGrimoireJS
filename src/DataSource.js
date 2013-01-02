/*
 * *
 * Copyright (C) 2012, Bitergia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use self file except in compliance with the License.
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
// TODO: Try to remove specific scm, its, mls logic
function DataSource(name, basic_metrics) {
    
    // Work around: http://bit.ly/yP8tGP
    var self = this; 
    self.name = name;
    self.data_dir = 'data/json';
    self.data_file = self.data_dir + '/'+self.name+'-milestone0.json';
    self.demographics_file = self.data_dir + '/'+self.name+'-demographics-2012.json';
    self.global_data_file = self.data_dir + '/'+self.name+'-info-milestone0.json';
    self.top_data_file = self.data_dir + '/'+self.name+'-top-milestone0.json';
    self.data_lists_file = self.data_dir + '/mls-lists-milestone0.json';
    self.data = null;
    self.demographics_data = null;
    self.global_data = null;
    self.basic_metrics = basic_metrics;

    // TODO: define a better way for it
    self.getMetrics = function() {
        return self.basic_metrics;
    };  
    
    self.getMainMetric = function() {
        // TODO: Each new DS should provide its main metric
        var metric = "";
        if (self.getName() === "scm") metric = "commits";
        else if (self.getName() === "its") metric = "opened";
        else if (self.getName() === "mls") metric = "sent";
        return metric;
    };
    self.getDataFile = function() {
        return self.data_file;
    };
    self.setDataFile = function(file) {
        self.data_file = file;
    };
    self.getData = function() {
        return self.data;
    };
    self.setData = function(load_data) {
        self.data = load_data;
    };
    self.getDemographicsFile = function() {
        return self.demographics_file;
    };
    self.getDemographicsData = function() {
        return self.demographics_data;
    };
    self.setDemographicsData = function(data) {
        self.demographics_data = data;
    };
    self.getDataDir = function() {
        return self.data_dir;
    };
    self.setDataDir = function(dataDir) {
        self.data_dir = dataDir;
        self.data_file = dataDir + '/'+self.name+'-milestone0.json';
        self.demographics_file = dataDir + '/'+self.name+'-demographics-2012.json';
        self.global_data_file = dataDir + '/'+self.name+'-info-milestone0.json';
        self.top_data_file = dataDir + '/'+self.name+'-top-milestone0.json';
        self.data_lists_file = self.data_dir + '/mls-lists-milestone0.json';
    };
    self.getGlobalDataFile = function() {
        return self.global_data_file;
    };
    self.getGlobalData = function() {
        return self.global_data;
    };
    self.setGlobalData = function(data) {
        self.global_data = data;
    };
    self.getName = function() {
        return self.name;
    };
        
    self.displayData = function() {
        if (self.getName() === "scm") {
            $("#scmFirst").text(self.global_data.first_date);
            $("#scmLast").text(self.global_data.last_date);
            $("#scmCommits").text(self.global_data.commits);
            $("#scmAuthors").text(self.global_data.authors);
            $("#scmCommitters").text(self.global_data.committers);
        } else if (self.getName() === "its") {
            $("#itsFirst").text(self.global_data.first_date);
            $("#itsLast").text(self.global_data.last_date);
            $("#itsTickets").text(self.global_data.tickets);
            $("#itsOpeners").text(self.global_data.openers);
        } else if (self.getName() === "mls") {
            $("#mlsFirst").text(self.global_data.first_date);
            $("#mlsLast").text(self.global_data.last_date);
            $("#mlsMessages").text(self.global_data.sent);
            $("#mlsSenders").text(self.global_data.senders);
        }
    };

    // Create HTML code to show the metrics
    self.displayBasicHTML = function(div_target, config) {
        var title = "";
        if (self.getName() === "scm") {
            title = "Change sets (commits to source code)";
        } else if (self.getName() === "scm") {
            title = "Tickets";
        }
        Viz.displayBasicHTML(self.getData(), div_target, title, 
                self.basic_metrics, self.name+'_hide', config);
    };

    self.displayBasicMetricHTML = function(metric_id, div_target, config) {
        Viz.displayBasicMetricHTML(self.basic_metrics[metric_id], self.getData(),
                div_target, config);
    };
    
    self.displayBasic = function() {
        self.basicEvo(self.getData());
    };

    self.displayBubbles = function(divid) {
        if (self.getName() === "scm") {
            Viz.displayBubbles(divid, "commits", "committers");
        } else if (self.getName() === "its") {
            Viz.displayBubbles(divid, "opened", "openers");
        } else if (self.getName() === "mls") {
            Viz.displayBubbles(divid, "sent", "senders");
        }
    };

    self.displayDemographics = function(divid, file) {
        Viz.displayDemographics(divid, self, file);
    };
    
    self.displayEvo = function(id) {
        self.envisionEvo(id, self.getData());
    };
    
    self.displayTimeToFix = function(div_id, json_file, column, labels, title) {
        Viz.displayTimeToFix(div_id, json_file, column, labels, title);
    };
    
    self.displayTop = function(div, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, self.top_data_file, self.basic_metrics, all,graph);
    };

    self.basicEvo = function(history) {
        for (var id in self.basic_metrics) {
            var metric = self.basic_metrics[id];
            if ($.inArray(metric.column, Report.getConfig()[self.getName()+"_hide"]) > -1)
                continue;
            if ($('#' + metric.divid).length)
                Viz.displayBasicLines(metric.divid, history, metric.column,
                        true, metric.name);
        }
    };

    self.envisionEvo = function(div_id, history) {
        config = Report.getConfig();
        options = Viz.getEnvisionOptions(div_id, history, self.basic_metrics,
                self.getMainMetric(), config.scm_hide);
        new envision.templates.Envision_Report(options, [ self ]);
    };
}