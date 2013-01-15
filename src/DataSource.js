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
    
    this.top_data_file = this.data_dir + '/'+this.name+'-top-milestone0.json';
    
    this.basic_metrics = basic_metrics;
    this.getMetrics = function() {
        return this.basic_metrics;
    };
    
    this.data_file = this.data_dir + '/'+this.name+'-milestone0.json';
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
        this.data_file = dataDir + '/'+this.name+'-milestone0.json';
        this.demographics_file = dataDir + '/'+this.name+'-demographics-2012.json';
        this.global_data_file = dataDir + '/'+this.name+'-info-milestone0.json';
        this.top_data_file = dataDir + '/'+this.name+'-top-milestone0.json';
    };
    

    this.global_data_file = this.data_dir + '/'+this.name+'-info-milestone0.json';
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
    
    this.name = name;    
    this.getName = function() {
        return this.name;
    };
    
    this.project = null;
    this.getProject = function() {
        return this.project;
    };
    this.setProject = function(project) {
        this.project = project;
    };
    
    this.displayBasicHTMLMix = function(div_target, config, title) {
        var full_data = [];
        var projects = [];
        var ds_name = this.getName();

        $.each(Report.getDataSources(), function (index, ds) {
           if (ds.getName() === ds_name) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        Viz.displayBasicHTML(full_data, div_target, title, 
                this.basic_metrics, this.name+'_hide', config, projects);
    };

        
    // Create HTML code to show the metrics
    this.displayBasicHTML = function(div_target, config) {
        var title = "";
        Viz.displayBasicHTML(this.getData(), div_target, title, 
                this.basic_metrics, this.name+'_hide', config);
    };

    this.displayBasicMetricHTML = function(metric_id, div_target, config) {
        var projects = [];
        var full_data = [];
        var ds_name = this.getName();
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds.getName() === ds_name) {
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

    this.displayDemographics = function(divid, file) {
        Viz.displayDemographics(divid, this, file);
    };
        
    this.displayTimeToFix = function(div_id, json_file, column, labels, title) {
        Viz.displayTimeToFix(div_id, json_file, column, labels, title);
    };
    
    this.displayTop = function(div, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, this.top_data_file, this.basic_metrics, all,graph);
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
}