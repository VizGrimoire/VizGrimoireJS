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
 * Report.js: Library for visualizing Bitergia Reports
 */

var Report = {};

(function() {

    // Shared config
    var project_data = null, markers = null, config = null, 
        data_callbacks = [], gridster = {}, data_sources = [], html_dir="";

    // Public API
    Report.check_data_loaded = check_data_loaded;
    Report.data_load = data_load;
    Report.data_ready = data_ready;
    Report.getAllMetrics = getAllMetrics;
    Report.getMarkers = getMarkers;
    Report.getConfig = getConfig;
    Report.getMetricDS = getMetricDS;
    Report.getGridster = getGridster;
    Report.setGridster = setGridster;
    Report.getProjectData = getProjectData;
    Report.getSupportedDivs = function() {
        return supported_divs;
    }; 
    Report.displayProjectData = displayProjectData;
    Report.report = report;
    Report.setConfig = setConfig;
    Report.getDataSources = function() {
        return data_sources;
    };
    Report.registerDataSource = function(backend) {
        data_sources.push(backend);
    };

    function getMarkers() {
        return markers;
    }

    function getConfig() {
        return config;
    }

    function getGridster() {
        return gridster;
    }

    function setGridster(grid) {
        gridster = grid;
    }

    Report.setHtmlDir = function (dir) {
        html_dir = dir;
    };
    
    function getProjectData() {
        return project_data;
    }

    function getMetricDS(metric_id) {
        if (SCM.getMetrics()[metric_id]) {
            return SCM;
        }
        if (ITS.getMetrics()[metric_id]) {
            return ITS;
        }
        if (MLS.getMetrics()[metric_id]) {
            return MLS;
        }
    }

    function data_ready(callback) {
        data_callbacks.push(callback);
    }

    function data_load() {
        var project_file = "data/json/project-info-milestone0.json", 
            config_file = "data/json/viz_cfg.json", 
            markers_file = "data/json/markers.json";
        
        data_load_file(project_file, function(data) {project_data = data;});
        data_load_file(config_file, function(data) {config = data;});
        data_load_file(markers_file, function(data) {markers = data;});
        data_load_metrics();
    }

    function data_load_file(file, fn_data_set) {
        $.when($.getJSON(file)).done(function(history) {
            fn_data_set(history);
            end_data_load();
        }).fail(function() {
            fn_data_set([]);
            end_data_load();
        });
    }

    function data_load_metrics() {
        // TODO: support for adding and removing data sources in Report
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDataFile(), DS.setData);
            data_load_file(DS.getGlobalDataFile(), DS.setGlobalData);
        });
        // TODO: Demographics just for SCM yet!
        data_load_file(SCM.getDemographicsFile(), SCM.setDemographicsData);
    }
    
    function check_data_loaded() {
        if (project_data === null || config === null || markers === null) 
            return false;
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(index, DS) {
            if (DS.getData() === null) return false;
            if (DS.getGlobalData() === null) return false;
        });
        // TODO: Demographics just for SCM yet!
        if (SCM.getDemographicsData() === null) return false;
        return true;
    }

    function end_data_load() {        
        if (check_data_loaded()) {
            // Invoke callbacks informing all data needed has been loaded
            for ( var i = 0; i < data_callbacks.length; i++) {
                data_callbacks[i]();
            }
        }
    }

    function getAllMetrics() {
        var all = $.extend({}, SCM.getMetrics(), ITS.getMetrics());
        all = $.extend(all, MLS.getMetrics());
        return all;
    }

    function displayProjectData() {
        data = project_data;
        document.title = data.project_name + ' Report by Bitergia';
        $(".report_date").text(data.date);
        $(".project_name").text(data.project_name);
        $("#project_url").attr("href", data.project_url);
        $('#scm_type').text('git');
        $('#scm_url').attr("href", data.scm_url);
        $('#scm_name').text(data.scm_name);
        $('#its_type').text(data.its_type);
        $('#its_url').attr("href", data.its_url);
        $('#its_name').text(data.its_name);
        $('#mls_type').text(data.mls_type);
        $('#mls_url').attr("href", data.mls_url);
        $('#mls_name').text(data.mls_name);
        var str = data.scm_url;
        if (!str || str.length === 0) {
            $('.source_info').hide();
        }
        str = data.its_url;
        if (!str || str.length === 0) {
            $('.tickets_info').hide();
        }
        str = data.mls_url;
        if (!str || str.length === 0) {
            $('.mls_info').hide();
        }
        str = data.blog_url;
        if (str && str.length > 0) {
            $('#blogEntry').html(
                    "<br><a href='" + str
                            + "'>Blog post with some more details</a>");
            $('.blog_url').attr("href", data.blog_url);
        } else {
            $('#more_info').hide();
        }
        str = data.producer;
        if (str && str.length > 0) {
            $('#producer').html(str);
        } else {
            $('#producer').html("<a href='http://bitergia.com'>Bitergia</a>");
        }
    }
    
    function setConfig() {
        var data_sources = Report.getDataSources();
        if ($("#report-config").length > 0) {
            $.each(data_sources, function(index, DS) {
                var ds = DS.getName();
                if ($("#report-config").data(ds+'-data-file')) {
                    var data_file = $("#report-config").data(ds+'-data-file');
                    DS.setDataFile(data_file);
                }
            });
            if ($("#report-config").data('global-data-dir')) {
                $.each(data_sources, function(index, DS) {
                    DS.setDataDir($("#report-config").data('global-data-dir'));
                });
            }
            if ($("#report-config").data('global-html-dir')) {
                Report.setHtmlDir($("#report-config").data('global-html-dir'));
            }
        }
    }
    
    var supported_divs = {
        "navigation": {
            convert: function() {
                $.get(html_dir+"navigation.html", function(navigation) {
                    $("#navigation").html(navigation);
                });                
            }
        },
        "header": {
            convert: function() {
                $.get(html_dir+"header.html", function(header) {
                    $("#header").html(header);
                });
            }
        },
        "footer": {
            convert: function() {
                $.get(html_dir+"footer.html", function(footer) {
                    $("#footer").html(footer);
                });
            }
        },
        // Reference card with info from all data sources
        "refcard": {
            convert: function() {
                $.get(html_dir+"refcard.html", function(refcard) {
                    $("#refcard").html(refcard);
                    $.each(data_sources, function(i, DS) {
                        DS.displayData();
                        displayProjectData('data/json/project-info-milestone0.json');
                    });
                });
            }
        }
    };

    function report(config) {
        var data_sources = Report.getDataSources();
        
        // General config for metrics viz
        var config_metric = {};
                
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;

        if (config) {
            $.each(config, function(key, value) {
                config_metric[key] = value;
            });
        }

        $.each (supported_divs, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert(); 
        });
        
        displayProjectData('data/json/project-info-milestone0.json');
        
        // flotr2        
        $.each(data_sources, function(index, DS) {
            $.each(DS.getMetrics(), function(i, metric) {
                var div_flotr2 = metric.divid+"-flotr2";
                if ($("#"+div_flotr2).length > 0)
                    DS.displayBasicMetricHTML(i,div_flotr2, config_metric);
                // Getting data real time
                var div_flotr2_rt = metric.divid+"-flotr2-rt";
                if ($("#"+div_flotr2_rt).length > 0) {
                    config_metric.realtime = true;
                    config_metric.json_ds = "http://localhost:1337/?callback=?";
                    DS.displayBasicMetricHTML(i,div_flotr2_rt, config_metric);
                }
            });
            
            if ($("#"+DS.getName()+"-flotr2").length > 0) {
                if (DS === MLS) {
                    DS.displayBasic(DS.getName()+'-flotr2', 'data/json/mls-lists-milestone0.json', config_metric);
                } else {
                    DS.displayBasicHTML(DS.getName()+'-flotr2',config_metric);
                }
            }
        });
        
        // top
        $.each(data_sources, function(index, DS) {
            var div_id_top = DS.getName()+"-top";
            var show_all = false;
            
            if ($("#"+div_id_top).length > 0) {
                if ($("#"+div_id_top).data('show_all')) show_all = true;
                // DS.displayTop(div_id_top,'data/json/'+DS.getName()+'-top-milestone0.json',show_all);
                DS.displayTop(div_id_top, show_all);
            }           
            $.each(['pie','bars'], function (index, chart) {
                var div_id_top = DS.getName()+"-top-"+chart;
                if ($("#"+div_id_top).length > 0) {
                    if ($("#"+div_id_top).data('show_all')) show_all = true;
                    DS.displayTop(DS.getName()+'-top-'+ chart, show_all, chart);
                }
            });
        });

        // Envision
        if ($("#all-envision").length > 0)
            Viz.displayEvoSummary('all-envision');
        $.each(data_sources, function(index, DS) {
            var div_envision = DS.getName() + "-envision";
            if ($("#" + div_envision).length > 0)
                if (DS === MLS) {
                    DS.displayEvoAggregated(div_envision);
                    DS.displayEvo(div_envision + "-lists", 'data/json/'
                            + DS.getName() + '-lists-milestone0.json');
                } else
                    DS.displayEvo(div_envision, 'data/json/' + DS.getName()
                            + '-milestone0.json');
        });

        // Bubbles for time evolution
        $.each(data_sources, function(index, DS) {
            var div_time = DS.getName() + "-time-bubbles";
            if ($("#" + div_time).length > 0)
                DS.displayBubbles(div_time);
        });

        // Radar summaries
        if ($("#radar-activity").length > 0) {
            Viz.displayRadarActivity('radar-activity');
        }

        if ($("#radar-community").length > 0) {
            Viz.displayRadarCommunity('radar-community');
        }

        // Demographics studies: DS-demographics
        $.each(data_sources, function(index, DS) {
            var div_demog = DS.getName() + "-demographics";
            if ($("#" + div_demog).length > 0)
                DS.displayDemographics(div_demog);
            // Specific demographics loaded from files
            var divs = $('[id^="' + DS.getName() + '-demographics"]');
            for ( var i = 0; i < divs.length; i++) {
                var file = $(divs[i]).data('file');
                DS.displayDemographics(divs[i].id, file);
            }
        });

        // Gridster
        if ($("#gridster").length > 0) {
            var gridster = $("#gridster").gridster({
                widget_margins : [ 10, 10 ],
                widget_base_dimensions : [ 140, 140 ]
            }).data('gridster');

            Report.setGridster(gridster);
            gridster.add_widget("<div id='metric_selector'></div>", 1, 3);
            Viz.displayGridMetricSelector('metric_selector');
            Viz.displayGridMetricAll(true);
        }

        // Selectors
        $.each(data_sources, function(index, DS) {
            var div_selector = DS.getName() + "-selector";
            var div_envision = DS.getName() + "-envision";
            var div_flotr2 = DS.getName() + "-flotr2";
            if ($("#" + div_selector).length > 0)
                // TODO: Only MLS supported 
                if (DS === MLS) {
                    div_envision = DS.getName() + "-envision-lists";
                    DS.displayEvoBasicListSelector(div_selector, div_envision,
                            div_flotr2, 'data/json/mls-lists-milestone0.json');
                }
        });
    }
})();

Report.data_ready(function() {
    Report.report();
});
$(document).ready(function() {
    Report.setConfig();
    Report.data_load();
});