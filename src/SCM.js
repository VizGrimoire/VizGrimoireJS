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
 * SCM.js: Library for visualizing Bitergia SCM data
 */

var SCM = {};

(function() {

    var name = "scm";
    var data_file = 'data/json/scm-milestone0.json';
    var demographics_file = 'data/json/scm-demographics-2012.json';
    var global_data_file = 'data/json/scm-info-milestone0.json';
    var data = null;
    var demographics_data = null;
    var global_data = null;

    SCM.displayBasic = displayBasic;
    SCM.displayBasicHTML = displayBasicHTML;
    SCM.displayBasicMetricHTML = displayBasicMetricHTML;
    SCM.displayBubbles = displayBubbles;
    SCM.displayData = displayData;
    SCM.displayDemographics = displayDemographics;
    SCM.displayEvo = displayEvo;
    SCM.displayTop = displayTop;
    SCM.getMetrics = function() {
        return basic_metrics;
    };
    SCM.getDataFile = function() {
        return data_file;
    };
    SCM.setDataFile = function(file) {
        data_file = file;
    };
    SCM.setData = function(load_data) {
        data = load_data;
    };
    SCM.getDemographicsFile = function() {
        return demographics_file;
    };
    SCM.getDemographicsData = function() {
        return demographics_data;
    };
    SCM.setDemographicsData = function(data) {
        demographics_data = data;
    };
    SCM.getData = function() {
        return data;
    };
    SCM.setDataDir = function(dataDir) {
        data_file = dataDir + '/scm-milestone0.json';
        demographics_file = dataDir + '/scm-demographics-2012.json';
        global_data_file = dataDir + '/scm-info-milestone0.json';
    };
    SCM.getGlobalDataFile = function() {
        return global_data_file;
    };
    SCM.getGlobalData = function() {
        return global_data;
    };
    SCM.setGlobalData = function(data) {
        global_data = data;
    };
    SCM.getName = function() {
        return name;
    };

    var basic_metrics = {
        'commits' : {
            'divid' : "scm-commits",
            'column' : "commits",
            'name' : "Commits",
            'desc' : "Evolution of the number of commits (aggregating branches)",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'committers' : {
            'divid' : "scm-committers",
            'column' : "committers",
            'name' : "Committers",
            'desc' : "Unique committers making changes to the source code",
            'action' : "commits",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'authors' : {
            'divid' : "scm-authors",
            'column' : "authors",
            'name' : "Authors",
            'desc' : "Unique authors making changes to the source code",
            'action' : "commits",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'branches' : {
            'divid' : "scm-branches",
            'column' : "branches",
            'name' : "Branches",
            'desc' : "Evolution of the number of branches"
        },
        'files' : {
            'divid' : "scm-files",
            'column' : "files",
            'name' : "Files",
            'desc' : "Evolution of the number of unique files handled by the community"
        },
        'repositories' : {
            'divid' : "scm-repositories",
            'column' : "repositories",
            'name' : "Repositories",
            'desc' : "Evolution of the number of repositories",
            'envision' : {
                gtype : 'whiskers'
            }
        }
    };
    
    function displayData() {
        $("#scmFirst").text(global_data.first_date);
        $("#scmLast").text(global_data.last_date);
        $("#scmCommits").text(global_data.commits);
        $("#scmAuthors").text(global_data.authors);
        $("#scmCommitters").text(global_data.committers);
    }

    // Create HTML code to show the metrics
    function displayBasicHTML(div_target, config) {
        Viz.displayBasicHTML(SCM.getData(), div_target,
                'Change sets (commits to source code)', basic_metrics,
                'scm_hide', config);
    }

    function displayBasicMetricHTML(metric_id, div_target, config) {
        Viz.displayBasicMetricHTML(basic_metrics[metric_id], SCM.getData(),
                div_target, config);
    }

    function displayTop(div, top_file, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, top_file, basic_metrics, all, graph);
    }

    function displayBubbles(divid) {
        Viz.displayBubbles(divid, "commits", "committers");
    }

    function displayDemographics(divid, file) {
        Viz.displayDemographics(divid, SCM, file);
    }

    function displayBasic(scm_file) {
        basicEvo(SCM.getData());
    }

    function basicEvo(history) {
        for ( var id in basic_metrics) {
            var metric = basic_metrics[id];
            if ($.inArray(metric.column, Report.getConfig().scm_hide) > -1)
                continue;
            if ($('#' + metric.divid).length)
                Viz.displayBasicLines(metric.divid, history, metric.column,
                        true, metric.name);
        }
    }

    function displayEvo(id, scm_file) {
        envisionEvo(id, SCM.getData());
    }

    function envisionEvo(div_id, history) {
        var config = Report.getConfig();
        var main_metric = "commits";
        var options = Viz.getEnvisionOptions(div_id, history, basic_metrics,
                main_metric, config.scm_hide);
        new envision.templates.Envision_Report(options, [ SCM ]);
    }
})();

Report.registerDataSource(SCM);