/* 
 * 
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
 * ITS.js: Library for visualizing Bitergia ITS data
 */

var ITS = {};

(function() {

    var name = "its";
    var data_file = 'data/json/its-milestone0.json';
    var data = null;
    var demographics_file = 'data/json/its-demographics-2012.json';
    var global_data_file = 'data/json/its-info-milestone0.json';
    var global_data = null;
    var top_data_file = 'data/json/its-top-milestone0.json';

    // Public API
    ITS.displayBasic = displayBasic;
    ITS.displayBasicHTML = displayBasicHTML;
    ITS.displayBasicMetricHTML = displayBasicMetricHTML;
    ITS.displayBubbles = displayBubbles;
    ITS.displayData = displayData;
    ITS.displayEvo = displayEvo;
    ITS.displayTop = displayTop;
    ITS.displayTimeToFix = displayTimeToFix;
    ITS.getMetrics = function() {
        return basic_metrics;
    };
    ITS.getDataFile = function() {
        return data_file;
    };
    ITS.setDataFile = function(file) {
        data_file = file;
    };
    ITS.setData = function(load_data) {
        data = load_data;
    };
    ITS.getData = function() {
        return data;
    };
    ITS.setDataDir = function(dataDir) {
        data_file = dataDir + '/its-milestone0.json';
        demographics_file = dataDir + '/its-demographics-2012.json';
        global_data_file = dataDir + '/its-info-milestone0.json';
        top_data_file = dataDir + '/its-top-milestone0.json';
    };
    ITS.getGlobalDataFile = function() {
        return global_data_file;
    };
    ITS.setGlobalData = function(data) {
        global_data = data;
    };
    ITS.getGlobalData = function() {
        return global_data;
    };
    ITS.getName = function() {
        return name;
    };    

    var basic_metrics = {
        'opened' : {
            'divid' : 'its-opened',
            'column' : "opened",
            'name' : "Opened",
            'desc' : "Number of opened tickets",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'openers' : {
            'divid' : 'its-openers',
            'column' : "openers",
            'name' : "Openers",
            'desc' : "Unique identities opening tickets",
            'action' : "opened",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'closed' : {
            'divid' : 'its-closed',
            'column' : "closed",
            'name' : "Closed",
            'desc' : "Number of closed tickets"
        },
        'closers' : {
            'divid' : 'its-closers',
            'column' : "closers",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets",
            'action' : "closed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'changed' : {
            'divid' : 'its-changed',
            'column' : "changed",
            'name' : "Changed",
            'desc' : "Number of changes to the state of tickets"
        },
        'changers' : {
            'divid' : 'its-changers',
            'column' : "changers",
            'name' : "Changers",
            'desc' : "Number of identities changing the state of tickets",
            'action' : "changed",
            'envision' : {
                gtype : 'whiskers'
            }
        }
    };

    function displayEvo(id, its_file) {
        envisionEvo(id, ITS.getData());
    }

    function displayData() {
        $("#itsFirst").text(global_data.first_date);
        $("#itsLast").text(global_data.last_date);
        $("#itsTickets").text(global_data.tickets);
        $("#itsOpeners").text(global_data.openers);
    }

    // Create HTML code to show the metrics
    function displayBasicHTML(div_target, config) {
        Viz.displayBasicHTML(ITS.getData(), div_target, 'Tickets',
                basic_metrics, 'its_hide', config);
    }

    function displayBasicMetricHTML(metric_id, div_target, config) {
        Viz.displayBasicMetricHTML(basic_metrics[metric_id], ITS.getData(),
                div_target, config);
    }

    function displayTop(div, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, top_data_file, basic_metrics, all, graph);
    }

    function displayBasic(its_file) {
        basicEvo(ITS.getData());
    }

    function displayBubbles(divid) {
        Viz.displayBubbles(divid, "opened", "openers");
    }

    function basicEvo(history) {
        for ( var id in basic_metrics) {
            var metric = basic_metrics[id];
            if ($.inArray(metric.column, Report.getConfig().its_hide) > -1)
                continue;
            if ($('#' + metric.divid).length)
                Viz.displayBasicLines(metric.divid, history, metric.column,
                        true, metric.name);
        }
    }

    function envisionEvo(div_id, history) {
        var main_metric = "opened";
        var config = Report.getConfig();
        var options = Viz.getEnvisionOptions(div_id, history, basic_metrics,
                main_metric, config.its_hide);
        new envision.templates.Envision_Report(options, [ ITS ]);

    }

    // TODO: Clean and share this method - acs
    function displayTimeToFix(div_id, json_file, column, labels, title) {
        $.getJSON(json_file, function(history) {
            var line_data = [];
            container = document.getElementById(div_id);

            for ( var i = 0; i < history.data[column].length; i++) {
                line_data[i] = [i, parseInt(history.data[column][i],10)];
            }

            Flotr.draw(container, [ line_data ], {
                title : title,
                xaxis : {
                    minorTickFreq : 4,
                    tickFormatter : function(x) {
                        if (history.data.date) {
                            x = history.data.date[parseInt(x,10)];
                        }
                        return x;
                    }
                },
                yaxis : {
                    minorTickFreq : 5,
                    tickFormatter : function(y) {
                        return parseInt(y / (24),10) + 'd';
                    }
                },

                grid : {
                    show : false
                // minorVerticalLines: true
                },
                mouse : {
                    track : true,
                    trackY : false,
                    trackFormatter : function(o) {
                        var text = history.data.date[parseInt(o.x,10)] + ": " + 
                            parseInt(o.y,10) + " h";
                        text += " ( " + parseInt(o.y / (24),10) + " days)";
                        return text;
                    }
                }
            });
        });
    }
})();

Report.registerDataSource(ITS);