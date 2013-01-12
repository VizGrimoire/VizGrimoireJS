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

var Report = {};

(function() {

    // Shared config
    var project_data = null, markers = null, config = null, 
        data_callbacks = [], gridster = {}, data_sources = [], html_dir="";
    var data_dir = "data/json";
    var default_data_dir = "data/json";
    var default_html_dir = "";
    var projects_dir = [];
    var projects_data = {};
    var project_file = data_dir + "/project-info-milestone0.json",
        config_file = data_dir + "/viz_cfg.json",
        markers_file = data_dir + "/markers.json";

    // Public API
    Report.check_data_loaded = check_data_loaded;
    Report.convertBasicDivs = convertBasicDivs;
    Report.convertEnvision = convertEnvision;
    Report.convertFlotr2 = convertFlotr2;
    Report.convertTop = convertTop;
    Report.convertBubbles = convertBubbles;
    Report.convertDemographics = convertDemographics;
    Report.convertSelectors = convertSelectors;
    Report.createDataSources = createDataSources;
    Report.data_load = data_load;
    Report.data_ready = data_ready;
    Report.getAllMetrics = getAllMetrics;
    Report.getMarkers = getMarkers;
    Report.getConfig = getConfig;
    Report.getMetricDS = getMetricDS;
    Report.getGridster = getGridster;
    Report.setGridster = setGridster;
    Report.getProjectData = getProjectData;
    Report.getBasicDivs = function() {
        return basic_divs;
    }; 
    Report.displayProjectData = displayProjectData;
    Report.report = report;
    Report.getDataSources = function() {
        // return data_sources.slice(0,3);
        return data_sources;
    };
    Report.registerDataSource = function(backend) {
        data_sources.push(backend);
    };
    
    Report.setHtmlDir = function (dir) {
        html_dir = dir;
    };

    Report.getDataDir = function() {
      return data_dir;
    };

    Report.setDataDir = function(dataDir) {
        data_dir = dataDir;
        project_file = dataDir + "/project-info-milestone0.json", 
        config_file = dataDir + "/viz_cfg.json", 
        markers_file = dataDir + "/markers.json";
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

    function getProjectData() {
        return project_data;
    }

    function getMetricDS(metric_id) {
        var ds = null;
        $.each(Report.getDataSources(), function(i, DS) {
            if (DS.getMetrics()[metric_id]) {
                ds = DS;
            }
        });
        return ds;
    }

    function data_ready(callback) {
        data_callbacks.push(callback);
    }

    function data_load() {
        data_load_file(project_file, function(data, self) {project_data = data;});
        data_load_file(config_file, function(data, self) {config = data;});
        data_load_file(markers_file, function(data, self) {markers = data;});        
        for (var i=0;  i<projects_dir.length; i++) {
            var data_dir = projects_dir[i];
            var prj_file = data_dir + "/project-info-milestone0.json";
            data_load_file(prj_file, function(data, dir) {
                projects_data[data.project_name] = dir;
            }, data_dir);
        }
        data_load_metrics();
    }

    function data_load_file(file, fn_data_set, self) {
        $.when($.getJSON(file)).done(function(history) {
            fn_data_set(history, self);
            end_data_load();
        }).fail(function() {
            fn_data_set([], self);
            end_data_load();
        });
    }

    function data_load_metrics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getDataFile(), DS.setData, DS);
            data_load_file(DS.getGlobalDataFile(), DS.setGlobalData, DS);
            // TODO: Demographics just for SCM yet!
            if (DS instanceof SCM) {
                data_load_file(DS.getDemographicsFile(), DS.setDemographicsData, DS);
            }
            if (DS instanceof MLS) {
                data_load_file(DS.getListsFile(), DS.setListsData, DS);
            }

        });
    }
    
    function check_data_loaded() {
        var check = true;
        if (project_data === null || config === null || markers === null) 
            return false;
        
        var projects_loaded = 0;        
        for (var key in projects_data) {projects_loaded++;}       
        if (projects_loaded < projects_dir.length ) return false;
        
        var data_sources = Report.getDataSources();        
        $.each(data_sources, function(index, DS) {
            if (DS.getData() === null) {check = false; return false;}
            if (DS.getGlobalData() === null) {check = false; return false;}
            // TODO: Demographics just for SCM yet!
            if (DS instanceof SCM) {
                if (DS.getDemographicsData() === null) {check = false; return false;} 
            }
            if (DS instanceof MLS) {
                if (DS.getListsData() === null) {check = false; return false;}
            }
        });         
        return check;
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
        var all = {};
        $.each(Report.getDataSources(), function(index, DS) {
            all = $.extend({}, all, DS.getMetrics());
        });
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
           
    function getReportDirs() {
        var data_sources = [];
        var dirs = {
            data: default_data_dir,
            html: default_html_dir,
            data_sources: data_sources            
        };
        
        var querystr = window.location.search.substr(1);        
        if (querystr) {
            var full_params = querystr.split ("&");
            var dirs_param = $.grep(full_params,function(item, index) {
                return (item.indexOf("data_dir=") === 0);
            });
            for (var i=0; i< dirs_param.length; i++) {                
                var data_dir = dirs_param[i].split("=")[1];
                dirs.data_sources.push(data_dir);
                // TODO: With different projects ... mix or don't show any?
                if (i>0) dirs.data = '';
                else dirs.data = data_dir; 
            } 
        }                
        else if ($("#report-config").length > 0) {
            var data = $("#report-config").data('global-data-dir');
            var html = $("#report-config").data('global-html-dir');
            if (data) dirs.data_sources.push(data);
            if (data) dirs.data = data;
            if (html) dirs.html = html;
        } else {
            data_sources.push(default_data_dir);
        }
        
        projects_dir = dirs.data_sources;

        return dirs;
    }
    
    function createDataSources() {
        var dirs = getReportDirs();
        
        // TODO: Move global config to a better method name
        Report.setHtmlDir(dirs.html);
        Report.setDataDir(dirs.data);
        
        for (var i=0; i<dirs.data_sources.length;i++) {
            var its = new ITS();
            Report.registerDataSource(its);
            var mls = new MLS();        
            Report.registerDataSource(mls);        
            var scm = new SCM();
            Report.registerDataSource(scm);
        
            its.setDataDir(dirs.data_sources[i]);
            mls.setDataDir(dirs.data_sources[i]);
            scm.setDataDir(dirs.data_sources[i]);            
        }
        
        return true;
    }
        
    var basic_divs = {
        "navigation": {
            convert: function() {
                $.get(html_dir+"navigation.html", function(navigation) {
                    $("#navigation").html(navigation);
                    var $links = $("#navigation a");
                    $.each($links, function(index, value){
                      if (value.href.indexOf("jasmine")>-1)
                        value.href += "?data_dir=../" + Report.getDataDir();
                      else 
                        value.href += "?data_dir=" + Report.getDataDir();
                    });
                });                
            }
        },
        "header": {
            convert: function() {
                $.get(html_dir+"header.html", function(header) {
                    $("#header").html(header);
                    displayProjectData();
                    var $links = $("#header a");
                    $.each($links, function(index, value){
                      value.href += "?data_dir=" + Report.getDataDir();
                    });

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
                        displayProjectData();
                    });
                });
            }
        },
        "radar-activity": {
            convert: function() {
                Viz.displayRadarActivity('radar-activity');
            }
        },
        "radar-community": {
            convert: function() {
                Viz.displayRadarCommunity('radar-community');
            }
        },
        "gridster": {
            convert: function() {
                var gridster = $("#gridster").gridster({
                    widget_margins : [ 10, 10 ],
                    widget_base_dimensions : [ 140, 140 ]
                }).data('gridster');
    
                Report.setGridster(gridster);
                gridster.add_widget("<div id='metric_selector'></div>", 1, 3);
                Viz.displayGridMetricSelector('metric_selector');
                Viz.displayGridMetricAll(true);
            }
        },
        "treemap": {
            convert: function() {
                var file = $('#treemap').data('file');
                Viz.displayTreeMap('treemap', file);
            }
        }
    };
    
    function convertFlotr2(config) {        
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
        
        var already_shown = [];
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getData().length === 0) return;
            
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
                if (DS instanceof MLS) {
                    DS.displayBasic(DS.getName()+'-flotr2', config_metric);
                } else if (DS instanceof SCM && $.inArray(SCM, already_shown) === -1) {
                    DS.displayBasicHTMLMix(DS.getName()+'-flotr2',config_metric); 
                    already_shown.push(SCM);
                } else if (DS instanceof ITS && $.inArray(ITS, already_shown) === -1) {
                    DS.displayBasicHTMLMix(DS.getName()+'-flotr2',config_metric); 
                    already_shown.push(ITS);
                }
            }
            
            if (DS instanceof MLS) {
                if ($("#"+DS.getName()+"-flotr2"+"-lists").length > 0) {
                    DS.displayBasic(DS.getName() + "-flotr2"+"-lists", config_metric);
                }
            }
        });        
    }
    
    function convertEnvision() {
        if ($("#all-envision").length > 0)
            Viz.displayEvoSummary('all-envision');
        
        var already_shown = [];
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getData().length === 0) return;
            var div_envision = DS.getName() + "-envision";
            if ($("#" + div_envision).length > 0) {
                if (DS instanceof MLS) {
                    DS.displayEvoAggregated(div_envision);
                    if ($("#" + DS.getName() + "-envision"+"-lists").length > 0)
                        DS.displayEvo(DS.getName() + "-envision"+"-lists");
                } else if (DS instanceof SCM && 
                        $.inArray(SCM, already_shown) === -1) {
                    DS.displayEvoMix(div_envision); 
                    already_shown.push(SCM);
                } else if (DS instanceof ITS && 
                        $.inArray(ITS, already_shown) === -1) {
                    DS.displayEvoMix(div_envision); 
                    already_shown.push(ITS);
                }
            }
        });
    }
    
    function convertTop() {
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getData().length === 0) return;

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
    }
    
    function convertBubbles() {
        $.each(Report.getDataSources(), function(index, DS) {
            if (DS.getData().length === 0) return;

            var div_time = DS.getName() + "-time-bubbles";
            if ($("#" + div_time).length > 0)
                DS.displayBubbles(div_time);
        });        
    }
    
    function convertDemographics() {
        $.each(Report.getDataSources(), function(index, DS) {
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
    }
    
    function convertSelectors() {       
        // Selectors
        $.each(Report.getDataSources(), function(index, DS) {
            var div_selector = DS.getName() + "-selector";
            var div_envision = DS.getName() + "-envision-lists";
            var div_flotr2 = DS.getName() + "-flotr2-lists";
            if ($("#" + div_selector).length > 0)
                // TODO: Only MLS supported 
                if (DS instanceof MLS) {
                    DS.displayEvoBasicListSelector(div_selector, div_envision,
                            div_flotr2);
                }
        });
    }
    
    function convertBasicDivs() {
        $.each (basic_divs, function(divid, value) {
            if ($("#"+divid).length > 0) value.convert(); 
        });
    }
    
    function configDataSources() {
        
        $.each(Report.getDataSources(), function (index, ds) {
            $.each(projects_data, function (name, dir) {
                if (dir === ds.getDataDir()) {
                    ds.setProject(name);
                    return false;
                }
            });            
        });
        
    }

    function report(config) {
        configDataSources();
        convertBasicDivs();        
        convertFlotr2(config);        
        convertTop();        
        convertEnvision();        
        convertBubbles();        
        convertDemographics();        
        convertSelectors();
        displayProjectData();
    }
})();

Report.data_ready(function() {
    Report.report();
});
$(document).ready(function() {
    Report.createDataSources();
    Report.data_load();
});