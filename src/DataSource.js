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
    
    // Work around: http://bit.ly/yP8tGP
    var self = this; 
    self.name = name;
    self.data_dir = 'data/json';
    self.data_file = self.data_dir + '/'+self.name+'-milestone0.json';
    self.demographics_file = self.data_dir + '/'+self.name+'-demographics-2012.json';
    self.global_data_file = self.data_dir + '/'+self.name+'-info-milestone0.json';
    self.top_data_file = self.data_dir + '/'+self.name+'-top-milestone0.json';
    self.data = null;
    self.demographics_data = null;
    self.global_data = null;
    self.basic_metrics = basic_metrics;

    // TODO: define a better way for it
    self.getMetrics = function() {
        return self.basic_metrics;
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
        
    // Create HTML code to show the metrics
    self.displayBasicHTML = function(div_target, config) {
        var title = "";
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

    self.displayDemographics = function(divid, file) {
        Viz.displayDemographics(divid, self, file);
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
}