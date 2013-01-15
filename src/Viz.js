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

var Viz = {};

(function() {

    var gridster_debug = false;
    var bitergiaColor = "#ffa500";

    Viz.displayTop = displayTop;
    Viz.displayBasicHTML = displayBasicHTML;
    Viz.displayBasicMetricHTML = displayBasicMetricHTML;
    Viz.displayBasicLinesFile = displayBasicLinesFile;
    Viz.displayBasicLines = displayBasicLines;
    Viz.displayBubbles = displayBubbles;
    Viz.displayDemographics = displayDemographics;
    Viz.displayEvoSummary = displayEvoSummary;
    Viz.displayRadarActivity = displayRadarActivity;
    Viz.displayRadarCommunity = displayRadarCommunity;
    Viz.displayTreeMap = displayTreeMap;
    Viz.drawMetric = drawMetric;
    Viz.getEnvisionDefaultsGraph = getEnvisionDefaultsGraph;
    Viz.getEnvisionOptions = getEnvisionOptions;
    Viz.checkBasicConfig = checkBasicConfig;
    Viz.mergeConfig = mergeConfig;
    Viz.displayGridMetric = displayGridMetric;
    Viz.displayGridMetricSelector = displayGridMetricSelector;
    Viz.displayGridMetricAll = displayGridMetricAll;
    // Working fixing gridster issue: redmine issue 991
    Viz.gridster_debug = gridster_debug;

    function mergeConfig(config1, config2) {
        var new_config = {};
        $.each(config1, function(entry, value) {
            new_config[entry] = value;
        });
        $.each(config2, function(entry, value) {
            new_config[entry] = value;
        });
        return new_config;
    }

    function findMetricDoer(history, metric) {
        for ( var field in history) {
            if (field != metric)
                return field;
        }
    }

    function hideEmail(email) {
        var clean = email;
        if (email.indexOf("@") > -1) {
            clean = email.split('@')[0];
        }
        return clean;
    }

    function drawMetric(metric_id, divid) {
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
        var drawn = false;

        $.each(Report.getDataSources(), function(index, DS) {
            if (drawn) return false;
            var list_metrics = DS.getMetrics();
            $.each(list_metrics, function(metric, value) {
                if (value.column === metric_id) {
                    DS.displayBasicMetricHTML(value.column, divid,
                            config_metric);
                    drawn = true;
                    return false;
                }
            });
        });
    }

    function displayTopMetric(div_id, metric, metric_period, history, graph) {
        var top_metric_id = metric.column;
        var metric_id = metric.action;
        var doer = findMetricDoer(history, metric_id);
        var div_graph = '';
        var new_div = '';
        new_div += "<div class='info-pill'>";
        new_div += "<h1>Top " + top_metric_id + " " + metric_period + " </h1>";
        if (graph) {
            div_graph = "top-" + graph + "-" + metric_id + "-" + metric_period;
            new_div += "<div id='" + div_graph
                    + "' class='graph' style='float:right'></div>";
        }
        new_div += "<table><tbody>";
        // new_div += "<tr><th>"+doer+"</th><th>"+metric_id+"</th></tr>";
        new_div += "<tr><th></th><th>" + metric_id + "</th></tr>";
        if (history[metric_id] === undefined) return;
        for ( var i = 0; i < history[metric_id].length; i++) {
            var metric_value = history[metric_id][i];
            var doer_value = history[doer][i];
            new_div += "<tr><td>" + hideEmail(doer_value) + "</td><td>"
                    + metric_value + "</td></tr>";
        }
        new_div += "</tbody></table>";
        new_div += "</div>";

        var div = $("#" + div_id);
        div.append(new_div);
        if (graph)
            displayBasicChart(div_graph, history[doer], history[metric_id],
                    graph);
    }

    function displayBasicLinesFile(div_id, json_file, column, labels, title, projects) {
        $.getJSON(json_file, null, function(history) {
            displayBasicLines(div_id, history, column, labels, title, projects);
        });
    }

    function displayBasicLines(div_id, history, column, labels, title, projects) {
        var lines_data = [];
        var data = [];
        var full_history_id = [], dates = [];
        container = document.getElementById(div_id);
        
        if (history instanceof Array) data = history;
        else data = [history];
                
        $.each(data, function(i, serie) {
            if (serie.id && serie.id.length > full_history_id.length) {
                full_history_id = serie.id;
                dates = serie.date;                
            }
        });

        for ( var j = 0; j < data.length; j++) {
            lines_data[j] = [];
            for ( var i = 0; i < data[j][column].length; i++) {
                lines_data[j][i] = [ data[j].id[i], parseInt(data[j][column][i], 10) ];
            }           
            if (projects) 
                lines_data[j] = {label:projects[j], 
                    data:fillHistoryLines(full_history_id, lines_data[j])};
            else
                lines_data[j] = {data:fillHistoryLines(full_history_id, lines_data[j])};
        }

        // TODO: Hack to have lines_data visible in track/tickFormatter
        (function() {var x = lines_data;})();
        
        var config = {
            title : title,
            xaxis : {
                minorTickFreq : 4,
                tickFormatter : function(x) {
                    var index = null;
                    for ( var i = 0; i < full_history_id.length; i++) {
                        if (parseInt(x)===full_history_id[i]) {
                            index = i; break;}
                    }
                    return dates[index];
                }
            },
            yaxis : {
                minorTickFreq : 1000,
                tickFormatter : function(y) {
                    return parseInt(y, 10) + "";
                }
            },

            grid : {
                show : false
            },
            mouse : {
                track : true,
                trackY : false,
                trackFormatter : function(o) {
                    var label = dates[parseInt(o.index, 10)] + "<br>";

                    for (var i=0; i<lines_data.length; i++) {
                        if (lines_data.length > 1)
                            label += lines_data[i].label +":";
                        label += lines_data[i].data[o.index][1]+"<br>";
                    }
                    return label;
                }
            }
        };

        if (!labels || labels === 0) {
            config.xaxis.showLabels = false;
            config.yaxis.showLabels = false;
        }
        if (projects && projects.length === 1) config.legend = {show:false};
            
        graph = Flotr.draw(container, lines_data, config);
    }

    function displayBasicChart(divid, labels, data, graph, rotate, fixColor) {

        var horizontal = false;
        if (rotate)
            horizontal = true;

        var container = document.getElementById(divid);
        var chart_data = [], i;

        if (!horizontal) {
            for (i = 0; i < labels.length; i++) {
                chart_data.push({
                    data : [ [ i, data[i] ] ],
                    label : hideEmail(labels[i])
                });
            }
        } else {
            for (i = 0; i < labels.length; i++) {
                chart_data.push({
                    data : [ [ data[i], i ] ],
                    label : hideEmail(labels[i])
                });
            }
        }

        var config = {
            grid : {
                verticalLines : false,
                horizontalLines : false,
                outlineWidth : 0
            },
            xaxis : {
                showLabels : false,
                min : 0
                
            },
            yaxis : {
                showLabels : false,
                min : 0
            },
            mouse : {
                track : true,
                trackFormatter : function(o) {
                    var i = 'x';
                    if (horizontal)
                        i = 'y';
                    return hideEmail(labels[parseInt(o[i], 10)]) + ": "
                            + data[parseInt(o[i], 10)];
                }
            },
            legend : {
                show : false,
                position : 'se',
                backgroundColor : '#D2E8FF'
            // container: container_legend
            }
        };

        if (graph === "bars") {
            config.bars = {
                show : true, 
                horizontal : horizontal
            };
            if (fixColor) {
                config.bars.color = fixColor;
                config.bars.fillColor = fixColor;
            }
            
            // TODO: Color management should be defined
            var defaults_colors = [ '#ffa500', '#ffff00', '#00ff00', '#4DA74D',
                                    '#9440ED' ];
            config.colors = defaults_colors,
            config.grid.horizontalLines = true;
            config.yaxis = {
                showLabels : true, min:0
            };
            config.xaxis = {
                    showLabels : true, min:0
            };
        }
        if (graph === "pie")
            config.pie = {
                show : true
            };

        graph = Flotr.draw(container, chart_data, config);
    }

    function getDSMetric(metric_id) {
        var ds = null;
        $.each(Report.getDataSources(), function(index, DS) {
            $.each(DS.getMetrics(), function(i, metric) {
                if (i === metric_id)
                    ds = DS;
            });
        });
        return ds;
    }
    
    // The two metrics should be from the same data source
    function displayBubbles(divid, metric1, metric2) {

        var container = document.getElementById(divid);

        var DS = getDSMetric(metric1);
        var DS1 = getDSMetric(metric2);

        var bdata = [];

        if (DS != DS1) {
            alert("Metrics for bubbles have different data sources");
            return;
        }
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds.getName() ===  DS.getName()) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           }
        });
        
        // [ids, values] Complete timeline for all the data
        var dates = [[],[]];
        
        // Healthy initial value
        dates = [full_data[0].id, full_data[0].date];
        
        for (var i=0; i<full_data.length; i++) {
            dates = fillDates(dates, [full_data[i].id, full_data[i].date]);
        }

        for ( var j = 0; j < full_data.length; j++) {
            var serie = [];
            var data = full_data[j];
            var data1 = fillHistory(dates[0], [data.id, data[metric1]]);
            var data2 = fillHistory(dates[0], [data.id, data[metric2]]);
            for ( var i = 0; i < dates[0].length; i++) {
                serie.push( [ dates[0][i], data1[1][i], data2[1][i] ]);
            }
            bdata.push({label:projects[j],data:serie});
        }

        var config = {
            bubbles : {
                show : true,
                baseRadius : 5
            },
            mouse : {
                track : true,
                trackFormatter : function(o) {
                    var value = full_data[0].date[o.index] + ": ";
                    value += o.series.label + " ";
                    value += o.series.data[o.index][1] + " " + metric1 + ",";
                    value += o.series.data[o.index][2] + " " + metric2;
                    return value;
                }
            },
            xaxis : {
                tickFormatter : function(o) {
                    return full_data[0].date[parseInt(o, 10) - full_data[0].id[0]];
                }
            }
        };

        if (DS.getName() === "its")
            $.extend(config.bubbles, {
                baseRadius : 1.0
            });

        // Flotr.draw(container, [ {legend:"Test", data:bdata} ], config);
        Flotr.draw(container, bdata, config);
    }

    function displayDemographics(divid, ds, file) {
        if (!file) {
            var data = ds.getDemographicsData();
            displayDemographicsChart(divid, ds, data);
        } else {
            $.when($.getJSON(file)).done(function(history) {
                displayDemographicsChart(divid, ds, history);
            }).fail(function() {
                alert("Can't load JSON file: " + file);
            });
        }
    }

    function displayDemographicsChart(divid, ds, data) {
        if (!data) return; 

        var quarter = 365 / 4;
        // var data = ds.getDemographicsData();
        var quarter_data = [];
        var labels = [], i;

        for (i = 0; i < data.persons.age.length; i++) {
            var age = data.persons.age[i];
            var index = parseInt(age / quarter, 10);
            if (!quarter_data[index])
                quarter_data[index] = 0;
            quarter_data[index] += 1;
        }

        for (i = 0; i < quarter_data.length; i++) {
            labels[i] = "Q" + parseInt(i, 10);
        }

        if (data)
            displayBasicChart(divid, labels, quarter_data, "bars", true, bitergiaColor);
    }

    function displayRadarChart(div_id, ticks, data) {
        var container = document.getElementById(div_id);
        var max = $("#" + div_id).data('max');
        
        for (var i=0; i<data[0].data.length; i++) {
            var value =  data[0].data[i][1];
            if (value>max) max = value;            
        }
        
        // TODO: Hack to have vars visible in track/tickFormatter
        (function() {var x = [data, ticks];})();

        graph = Flotr.draw(container, data, {
            radar : {
                show : true
            },
            mouse : {
                track : true,
                trackFormatter : function(o) {
                    var value = "";
                    for (var i=0; i<data.length; i++) {
                        value += data[i].label + " ";
                        value += data[i].data[o.index][1] + " ";
                        value += ticks[o.index][1] + "<br>";
                    }
                    return value;
                }
            },
            grid : {
                circular : true,
                minorHorizontalLines : true
            },
            yaxis : {
                min : 0,
                max : max,
                minorTickFreq : 1
            },
            xaxis : {
                ticks : ticks
            }
        });
    }

    function displayRadar(div_id, metrics) {
        var data = [], ticks = [];
        var radar_data = [];
        var projects = [];

        for ( var i = 0; i < metrics.length; i++) {
            var DS = Report.getMetricDS(metrics[i]);
            for (var j=0; j<DS.length; j++) {
                if (!data[j]) {
                    data[j] = [];
                    projects[j] = DS[j].getProject();
                }
                data[j].push([ i, parseInt(DS[j].getGlobalData()[metrics[i]], 10) ]);
            }
            ticks.push([ i, DS[0].getMetrics()[metrics[i]].name ]);
        }

        for (var j=0; j<data.length; j++) {            
            radar_data.push({
                label : projects[j],
                data : data[j]
            });
        }

        displayRadarChart(div_id, ticks, radar_data);
    }

    function displayRadarCommunity(div_id) {
        var metrics = [ 'committers', 'authors', 'openers', 'closers',
                'changers', 'senders' ];
        displayRadar(div_id, metrics);
    }

    function displayRadarActivity(div_id) {
        var metrics = [ 'commits', 'files', 'opened', 'closed', 'changed',
                'sent' ];
        displayRadar(div_id, metrics);
    }
    
    function displayTimeToFix(div_id, json_file, column, labels, title) {
        $.getJSON(json_file, function(history) {            
            Viz.displayBasicLines(div_id, history, column, labels, title);
        });
    }

    // Each metric can have several top: metric.period
    // For example: "committers.all":{"commits":[5310, ...],"name":["Brion
    // Vibber",..]}
    function displayTop(div, top_file, basic_metrics, all, graph) {
        if (all === undefined)
            all = true;
        $.getJSON(top_file, function(history) {
            $.each(history, function(key, value) {
                // ex: commits.all
                var data = key.split(".");
                var top_metric = data[0];
                var top_period = data[1];
                for ( var id in basic_metrics) {
                    var metric = basic_metrics[id];
                    if (metric.column == top_metric) {
                        displayTopMetric(div, metric, top_period, history[key],
                                graph);
                        if (!all) return false;
                        break;
                    }
                }
            });
        });
    }
    
    // D3
    function displayTreeMap(divid, data_file) {
        $.getJSON(data_file, function(root) {
            var color = d3.scale.category20c();

            var div = d3.select("#"+divid);

            var width = $("#treemap").width(), 
                height = $("#treemap").height();

            var treemap = d3.layout.treemap()
                .size([ width, height ])
                .sticky(true)
                .value(function(d) {return d.size;}
            );

            var position = function() {
                this.style("left", function(d) {
                    return d.x + "px";
                }).style("top", function(d) {
                    return d.y + "px";
                }).style("width", function(d) {
                    return Math.max(0, d.dx - 1) + "px";
                }).style("height", function(d) {
                    return Math.max(0, d.dy - 1) + "px";
                });
            };

            var node = div.datum(root).selectAll(".node")
                    .data(treemap.nodes)
                .enter().append("div")
                    .attr("class", "treemap-node")
                    .call(position)
                    .style("background", function(d) {
                        return d.children ? color(d.name) : null;})
                    .text(function(d) {
                        return d.children ? null : d.name;
                    });

            d3.selectAll("input").on("change", function change() {
                var value = this.value === "count" 
                    ? function() {return 1;}
                    : function(d) {return d.size;};

                node
                        .data(treemap.value(value).nodes)
                    .transition()
                        .duration(1500)
                        .call(position);
           });
        });
    }

    function getDefaultsMarkers(option, markers, dates) {
        var mark = "";
        if (!markers || markers.length === 0) return mark;
        for ( var i = 0; i < markers.date.length; i++) {
            if (markers.date[i] == dates[option.index]) {
                mark = markers.marks[i];
            }
        }
        return mark;
    }

    function getEnvisionDefaultsGraph(name, gconfig) {
        var graph = {
            name : name,
            config : {
                colors : gconfig.colors,
                grid: {verticalLines:false, horizontalLines:false},
                mouse : {
                    track : true,
                    trackY : false,
                    position : 'ne'
                },
                yaxis : {
                    autoscale : true
                },
                legend : {
                    backgroundColor : '#FFFFFF', // A light blue background
                    // color
                    backgroundOpacity : 0
                }
            }
        };

        if (gconfig.gtype === "whiskers")
            graph.config.whiskers = {
                show : true,
                lineWidth : 2
            };
        else
            graph.config['lite-lines'] = {
                lineWidth : 1,
                show : true,
                fill : true,
                fillOpacity : 0.5
            };

        if (gconfig.y_labels)
            graph.config.yaxis = {
                showLabels : true
            };

        if (gconfig.show_markers)
            graph.config.markers = {
                show : true,
                position : 'ct',
                labelFormatter : function(o) {
                    return getDefaultsMarkers(o, gconfig.markers, gconfig.dates);
                }
            };
        
        return graph;
    }
    
    function fillDates (dates_orig, more_dates) {
        // [ids, values]
        var new_dates = [[],[]];
        
        // Insert older dates
        if (dates_orig[0][0]>= more_dates[0][0]) {
            for (var i=0; i< more_dates[0].length; i++) {
                new_dates[0][i] = more_dates[0][i];
                new_dates[1][i] = more_dates[1][i];
            }
        }

        // Push already existing dates
        for (var i=0; i< dates_orig[0].length; i++) {
            pos = new_dates[0].indexOf(dates_orig[0][i]);
            if (pos === -1) {
                new_dates[0].push(dates_orig[0][i]);
                new_dates[1].push(dates_orig[1][i]);
            }
        }
        
        // Push newer dates
        if (dates_orig[0][dates_orig-1]<= more_dates[0][more_dates-1]) {
            for (var i=0; i< more_dates.length; i++) {
                pos = new_dates[0].indexOf(more_dates[0][i]);
                if (pos === -1) {
                    new_dates[0].push(more_dates[i][0]);
                    new_dates[1].push(more_dates[i][1]);
                }
            }
        }
        
        return new_dates;

    }
    
    function fillHistory(hist_complete_id, hist_partial) {
        // [ids, values]
        var new_history = [ [], [] ];
        for ( var i = 0; i < hist_complete_id.length; i++) {
            pos = hist_partial[0].indexOf(hist_complete_id[i]);
            new_history[0][i] = hist_complete_id[i];
            if (pos != -1) {
                new_history[1][i] = hist_partial[1][pos];
            } else {
                new_history[1][i] = 0;
            }
        }
        return new_history;
    }
    
    // Envision and Flotr2 formats are different.
    function fillHistoryLines(hist_complete_id, hist_partial) {        
        // [ids, values]
        var old_history = [ [], [] ];
        var new_history = [ [], [] ];
        var lines_history = [];
        
        for ( var i = 0; i < hist_partial.length; i++) {
            // ids
            old_history[0].push(hist_partial[i][0]);
            // values
            old_history[1].push(hist_partial[i][1]);
        }
        
        new_history = fillHistory(hist_complete_id, old_history);
        
        for ( var i = 0; i < hist_complete_id.length; i++) {
            lines_history.push([new_history[0][i],new_history[1][i]]);
        }
        return lines_history;
    }

    function getEnvisionOptions(div_id, history, ds, hide, projects) {

        var basic_metrics, main_metric="", summary_data = [];
        if (ds) {
            basic_metrics = ds.getMetrics();
            main_metric = ds.getMainMetric();
            summary_data = DS.getData()[main_metric];
        } else {
            basic_metrics = Report.getAllMetrics();
            $.each(Report.getDataSources(), function(i, DS) {
                main_metric = DS.getMainMetric();
                summary_data = DS.getData()[main_metric];
                if (DS.getName() === "scm") return false;
            });
        }
        
        // [ids, values] Complete timeline for all the data
        var dates = [[],[]];
        var data;
        
        if (history instanceof Array) data = history;
        else data = [history];
        
        // Healthy initial value
        dates = [data[0].id, data[0].date];
        
        for (var i=0; i<data.length; i++) {
            dates = fillDates(dates, [data[i].id, data[i].date]);
        }
        
        var firstMonth = dates[0][0], 
                container = document.getElementById(div_id), options;
        var markers = Report.getMarkers();

        options = {
            container : container,
            xTickFormatter : function(index) {
                var label = dates[1][index - firstMonth];
                if (label === "0")
                    label = "";
                return label;
            },
            yTickFormatter : function(n) {
                return n + '';
            },
            // Initial selection
            selection : {
                data : {
                    x : {
                        min : dates[0][0],
                        max : dates[0][dates[0].length - 1]
                    }
                }
            }
        };        
        
        options.data = {
            summary : fillHistory(dates[0], [data[0].id, summary_data]),
            markers : markers,
            dates : dates[1],
            envision_hide : hide,
            main_metric : main_metric
        };
        
        for (var metric in basic_metrics) {
            options.data[metric] = [];
            // Monoproject
            if (data.length === 1) {
                options.data[metric] = 
                    fillHistory(dates[0], [data[0].id, data[0][metric]]);
                continue;
            }
            // Multiproject
            for (var i = 0; i < data.length; i++) {
                var full_data =  
                    fillHistory(dates[0], [data[i].id, data[i][metric]]);
                if (metric === main_metric)
                    options.data[metric].push(
                            {label:projects[i], data:full_data});
                else options.data[metric].push({label:"", data:full_data});
            }
        }

        options.trackFormatter = function(o) {
            var sdata = o.series.data, index = sdata[o.index][0] - firstMonth, value;

            value = dates[1][index] + ":<br>";
            
            var i = 0;
            for ( var id in basic_metrics) {
                // Single project
                if (options.data[id][0] instanceof Array) { 
                    value += options.data[id][1][index] + " " + id + ", ";
                    if (++i % 3 === 0)
                        value += "<br>";
                } 
                // Multiproject
                else {
                    for (var j=0;j<options.data[id].length; j++) {
                        var project = options.data[id][j].label;
                        var pdata = options.data[id][j].data;
                        value += project + " " + pdata[1][index] + " " + id + ", ";
                        if (++i % 2 === 0)
                            value += "<br>";
                    }
                }                    
            }

            return value;
        };

        return options;
    }

    function checkBasicConfig(config) {
        if (config === undefined)
            config = {};
        if (config.show_desc === undefined)
            config.show_desc = true;
        if (config.show_title === undefined)
            config.show_title = true;
        if (config.show_labels === undefined)
            config.show_labels = true;
        return config;
    }

    function displayBasicHTML(data, div_target, title, basic_metrics, hide,
            config, projs) {
        config = checkBasicConfig(config);
        var new_div = '<div class="info-pill">';
        new_div += '<h1>' + title + '</h1></div>';
        $("#" + div_target).append(new_div);
        for ( var id in basic_metrics) {
            var metric = basic_metrics[id];
            if ($.inArray(metric.column, Report.getConfig()[hide]) > -1)
                continue;
            displayBasicMetricHTML(metric, data, div_target, config, projs);
        }
    }

    function displayBasicMetricHTML(metric, data, div_target, config, projs) {
        config = checkBasicConfig(config);
        var title = metric.name;
        if (!config.show_title)
            title = '';

        var new_div = '<div class="info-pill">';
        $("#" + div_target).append(new_div);
        new_div = '<div id="flotr2_' + metric.column
                + '" class="info-pill m0-box-div">';
        new_div += '<h1>' + metric.name + '</h1>';
        new_div += '<div style="height:100px" id="' + metric.divid;
        new_div += '"></div>';
        if (config.show_desc === true)
            new_div += '<p>' + metric.desc + '</p>';
        new_div += '</div>';
        $("#" + div_target).append(new_div);
        if (config.realtime)
            displayBasicLinesFile(metric.divid, config.json_ds, 
                    metric.column, config.show_labels, title, projs);
        else
            displayBasicLines(metric.divid, data, metric.column,
                    config.show_labels, title, projs);
    }

    function displayGridMetric(metric_id, config) {
        var gridster = Report.getGridster();
        var metric = Report.getAllMetrics()[metric_id];
        var size_x = 1, size_y = 1, col = 2, row = 1;
        var silent = true;

        if (config) {
            size_x = config.size_x, size_y = config.size_y, col = config.col,
                    row = config.row;
        }

        var divid = metric.divid + "_grid";
        if ($("#" + metric_id + "_check").is(':checked')) {
            if ($("#" + divid).length === 0) {
                gridster.add_widget("<div id='" + divid + "'></div>", size_x,
                        size_y, col, row);
                // gridster.add_widget( "<div id='"+divid+"'></div>", size_x,
                // size_y);
                drawMetric(metric_id, divid);
            }
        } else {
            if ($("#" + divid).length > 0) {
                if (Viz.gridster_debug)
                    silent = false;
                gridster.remove_widget($("#" + divid), silent);
            }
        }
    }

    function displayGridMetricAll(state) {
        var columns = 3;
        var form = document.getElementById('form_metric_selector');
        var config = {
            size_x : 1,
            size_y : 1,
            col : 2,
            row : 0
        };
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox") {
                form.elements[i].checked = state;
                if (i % columns === 0) {
                    config.row++;
                    config.col = 2;
                }
                displayGridMetric(form.elements[i].value, config);
                config.col++;
            }
        }
    }

    function displayGridMetricDefault() {
    }

    function displayGridMetricSelector(div_id) {
        var metrics = {};
        $.each(Report.getDataSources(), function(i, DS) {
            if (DS.getData().length === 0) return;
            metrics = $.extend(metrics, DS.getMetrics());
        });

        var html = "Metrics Selector:";
        html += "<form id='form_metric_selector'>";

        $.each(metrics, function(metric_id, value) {
            html += '<input type=checkbox name="check_list" value="'
                    + metric_id + '" ';
            html += 'onClick="';
            html += 'Viz.displayGridMetric(\'' + metric_id + '\');';
            html += '" ';
            html += 'id="' + metric_id + '_check" ';
            // if ($.inArray(l, user_lists)>-1) html += 'checked ';
            html += '>';
            html += metric_id;
            html += '<br>';
        });
        html += '<input type=button value="All" ';
        html += 'onClick="Viz.displayGridMetricAll(' + true + ')">';
        html += '<input type=button value="None" ';
        html += 'onClick="Viz.displayGridMetricAll(' + false + ')">';
        // html += '<input type=button value="Default" ';
        // html += 'onClick="Viz.displayGridMetricDefault()">';
        html += "</form>";
        $("#" + div_id).html(html);
    }

    function displayEvoSummary(div_id) {        
        var projects_data = {};
        var full_data = [];
        var projects = [];
        
        var dates = [[],[]];
        
        $.each(Report.getDataSources(), function (index, ds) {
            var data = ds.getData();
            if (dates[0].length === 0) dates = [data.id, data.date];
            dates = fillDates(dates, [data.id, data.date]);
        });
                
        $.each(Report.getDataSources(), function (index, ds) {
           if ($.inArray(ds.getProject(), projects) === -1) {
               projects.push(ds.getProject());
               projects_data[ds.getProject()] = {};
           }
           var data = ds.getData();
           var new_data = {};
           $.each(data, function (metric, values) {
               new_data[metric] = 
                   fillHistory(dates[0], [data.id, data[metric]])[1];
           });           
           $.extend(projects_data[ds.getProject()], new_data);
        });
        
        for (var i=0; i<projects.length; i++) {
            full_data[i] = (projects_data[projects[i]]);
        }
                
        config = Report.getConfig();
        var options = Viz.getEnvisionOptions(div_id, full_data, null,
                config.summary_hide, projects);
        new envision.templates.Envision_Report(options);
    }
})();
