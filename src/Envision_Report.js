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

(function() {

    var V = envision, global_data = {};

    function getDefaultsMetrics(ds, viz, metrics, default_config) {
        $.each(metrics, function(metric, value) {
            config = default_config;
            if (value.envision)
                config = Viz.mergeConfig(default_config,
                        value.envision);
            if ($.inArray(metric, global_data.envision_hide) === -1) {
                // TODO ds[0] hack
                viz[metric] = Viz.getEnvisionDefaultsGraph
                    ('report-' + ds[0] + '-' + metric, config);
                viz[metric].config.subtitle = metric;
            }            
        });
    }

    function getDefaults(ds) {
        var defaults_colors = [ '#ffa500', '#ffff00', '#00ff00', '#4DA74D',
                '#9440ED' ];
        var default_config = {
            colors : defaults_colors,
            dates : global_data.dates,
            g_type : '',
            markers : global_data.markers,
            y_labels : false
        };
        
        var data_sources = Report.getDataSources();

        var viz = {};
        var metrics = {};
        if (!ds) {
            $.each(data_sources, function(i, DS) {
                metrics = DS.getMetrics();
                getDefaultsMetrics([ DS.getName() ], viz, metrics, default_config);
            });
        } else {
            $.each(data_sources, function(i, DS) {
                if ($.inArray(DS.getName(), ds) > -1) {
                    metrics = DS.getMetrics();
                    getDefaultsMetrics([ DS.getName() ], viz, metrics, default_config);
                }
            });
        }

        config = default_config;
        viz.summary = Viz.getEnvisionDefaultsGraph('report-summary', config);
        viz.summary.config.xaxis = {
            noTickets : 10,
            showLabels : true
        };
        viz.summary.config.handles = {
            show : true
        };
        viz.summary.config.selection = {
            mode : 'x'
        };
        viz.summary.config.mouse = {};

        viz.connection = {
            name : 'report-connection',
            adapterConstructor : V.components.QuadraticDrawing
        };
        return viz;
    }
    
    function getOrderedDataSources(ds_list, main_metric) {
        var ordered = [];
        var main_DS = null;
        $.each(ds_list, function(i, DS) {
           if (DS.getMetrics()[main_metric]) {
               main_DS = DS;
               return false;
           }
        });
        ordered.push(main_DS);
        $.each(ds_list, function(i, DS) {
            if (DS===main_DS) return;
            ordered.push(DS);
         });
        return ordered;
    }

    function Envision_Report(options, data_sources) {

        var main_metric = options.data.main_metric;
        global_data = options.data;

        if (!data_sources) data_sources = Report.getDataSources();
        
        data_sources = getOrderedDataSources(data_sources, main_metric);
        
        var ds = [];
        for ( var i = 0; i < data_sources.length; i++) {
            if (data_sources[i].getData().length === 0) continue;
            ds.push(data_sources[i].getName());
        }

        var data = options.data, defaults = getDefaults(ds), 
            vis = new V.Visualization(
                {
                    name : 'report-' + ds.join(",")
                }), selection = new V.Interaction(), hit = new V.Interaction();

        var metrics = {};

        $.each(data_sources, function(i, DS) {
            if (DS.getData().length === 0) return;
            metrics = $.extend(metrics, DS.getMetrics());
        });

        $.each(metrics, function(metric, value) {
            if ($.inArray(metric, data.envision_hide) === -1) {
                // One project
                if (data[metric][0] instanceof Array)
                    defaults[metric].data = 
                        [{label : metric,data : data[metric]}];
                // Multi project
                else          
                    defaults[metric].data = data[metric];

                if (Report.getMetricDS(metric).getName() === 'mls' &&
                        data.list_label)
                    defaults[metric].data = [ {
                        label : metric + " " + data.list_label,
                        data : data[metric]
                    } ];
            }
        });

        defaults.summary.data = data.summary;

        // SHOW LEGEND
        defaults[main_metric].config.mouse.trackFormatter = options.trackFormatter;
        if (options.xTickFormatter) {
            defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
        }
        defaults[main_metric].config.yaxis.tickFormatter = options.yTickFormatter ||
                function(n) {
                    return '$' + n;
                };

        // ENVISION COMPONENTS
        var components = {};
        $.each(metrics, function(metric, value) {
            if ($.inArray(metric, data.envision_hide) === -1) {
                components[metric] = new V.Component(defaults[metric]);
            }
        });
        connection = new V.Component(defaults.connection);
        summary = new V.Component(defaults.summary);

        // VISUALIZATION
        $.each(components, function(component, value) {
            vis.add(value);
        });
        vis.add(connection).add(summary).render(options.container);

        // ZOOMING
        $.each(components, function(component, value) {
            selection.follower(value);
        });
        selection.follower(connection).leader(summary).add(V.actions.selection,
                options.selectionCallback ? {
                    callback : options.selectionCallback
                } : null);

        // HIT
        var hit_group = [];
        $.each(components, function(component, value) {
            hit_group.push(value);
        });
        hit.group(hit_group).add(V.actions.hit);

        // INITIAL SELECTION
        if (options.selection) {
            summary.trigger('select', options.selection);
        }
    }

    V.templates.Envision_Report = Envision_Report;

})();