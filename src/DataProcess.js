/* 
 * Copyright (C) 2013 Bitergia
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

var DataProcess = {};

(function() {
    DataProcess.info = function() {};
    
    DataProcess.sortCompanies = function(ds, metric_id) {
        return sortGlobal(ds, metric_id, "companies");
    };
    
    DataProcess.sortCountries = function(ds, metric_id) {
        return sortGlobal(ds, metric_id, "countries");
    };
    
    DataProcess.sortRepos = function(ds, metric_id) {
        return sortGlobal(ds, metric_id, "repos");
    };
    
    sortGlobal = function (ds, metric_id, kind) {
        if (metric_id === undefined) metric_id = "commits";
        var metric = [];
        var sorted = [];
        var global = null;
        if (kind === "companies") {
            global = ds.getCompaniesGlobalData();
            if (ds.getCompaniesData().length === 0) return sorted;
            if (global[ds.getCompaniesData()[0]][metric_id] === undefined)
                metric_id = "commits";
        } 
        else if (kind === "repos") {
            global = ds.getReposGlobalData();
            if (ds.getReposData().length === 0) return sorted;
            if (global[ds.getReposData()[0]][metric_id] === undefined)
                metric_id = "commits";
        }
        else if (kind === "countries") {
            global = ds.getCountriesGlobalData();
            if (ds.getCountriesData().length === 0) return sorted;
            if (global[ds.getCountriesData()[0]][metric_id] === undefined)
                metric_id = "commits";
        }
        $.each(global, function(item, data) {
           metric.push([item, data[metric_id]]);
        });
        metric.sort(function(a, b) {return b[1] - a[1];});
        $.each(metric, function(id, value) {
            sorted.push(value[0]);
        });
        return sorted;
    };

})();