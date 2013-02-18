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

var Loader = {};

(function() {
    
    var data_callbacks = [];
    var check_companies = false, check_repos = false;
    
    Loader.data_ready = function(callback) {
        data_callbacks.push(callback);
    };
    
    Loader.data_load = function () {
        data_load_file(Report.getProjectFile(), 
                function(data, self) {Report.setProjectData(data);});
        data_load_file(Report.getConfigFile(), 
                function(data, self) {Report.setConfig(data);});
        data_load_file(Report.getMarkersFile(), 
                function(data, self) {Report.setMarkers(data);});
        var projects_dirs = Report.getProjectsDirs();
        for (var i=0;  i<projects_dirs.length; i++) {
            var data_dir = projects_dirs[i];
            var prj_file = Report.getDataDir() + "/project-info.json";
            data_load_file(prj_file, function(data, dir) {
                if (data.project_name === undefined) {
                    data.project_name = dir.replace("data/json","")
                        .replace(/\.\.\//g,"");
                }
                var projects_data = Report.getProjectsData();
                projects_data[data.project_name] = {dir:dir,url:data.project_url};
            }, data_dir);
        }
        data_load_companies();
        data_load_repos();
        data_load_metrics();
        data_load_people();
        data_load_tops('authors');
    };
    
    function data_load_companies() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getCompaniesDataFile(), 
                    DS.setCompaniesData, DS);
        });
    }
    
    function data_load_file(file, fn_data_set, self) {
        $.when($.getJSON(file)).done(function(history) {
            fn_data_set(history, self);
            end_data_load();
        }).fail(function() {
            fn_data_set([], self);
            end_data_load();
        });
    };
    
    function data_load_repos() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getReposDataFile(), DS.setReposData, DS);
        });
    };

    // TODO: It is better to have all the tops in the same file
    function data_load_tops(metric) {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            // TODO: Support for SCM only in Webkit
            if (DS.getName() !== "scm") {
                DS.setGlobalTopData([], DS);
                return;
            }
            var file_static = DS.getDataDir() + "/"+ DS.getName()+"-top-"+metric;
            var file_all = file_static + ".json";
            var file_2006 = file_static + "_2006.json";
            var file_2009 = file_static + "_2009.json";
            var file_2012 = file_static + "_2012.json";
            $.when($.getJSON(file_all),
                    $.getJSON(file_2006),
                    $.getJSON(file_2009),
                    $.getJSON(file_2012)
                ).done(function(history, hist2006, hist2009, hist2012) {
                    DS.addGlobalTopData(history[0], DS, metric, "all");
                    DS.addGlobalTopData(hist2006[0], DS, metric, "2006");
                    DS.addGlobalTopData(hist2009[0], DS, metric, "2009");
                    DS.addGlobalTopData(hist2012[0], DS, metric, "2012");
                    end_data_load();
            }).fail(function() {
                DS.setGlobalTopData([], DS);
                end_data_load();
            });
        });
    };
    
    function data_load_companies_metrics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            var companies = DS.getCompaniesData();
            $.each(companies, function(i, company) {
                var file = DS.getDataDir()+"/"+company+"-";
                file_evo = file + DS.getName()+"-evolutionary.json";
                $.when($.getJSON(file_evo)).done(function(history) {
                    DS.addCompanyMetricsData(company, history, DS);
                    end_data_load();
                });
                file_static = file + DS.getName()+"-static.json";
                $.when($.getJSON(file_static)).done(function(history) {
                    DS.addCompanyGlobalData(company, history, DS);
                    end_data_load();
                });
                // TODO: all Tops in one file. Improve logic.
                // Unify with data_load_tops
                file_static = file + DS.getName()+"-top-authors";
                var file_all = file_static + ".json";
                var file_2006 = file_static + "_2006.json";
                var file_2009 = file_static + "_2009.json";
                var file_2012 = file_static + "_2012.json";
                $.when($.getJSON(file_all),
                        $.getJSON(file_2006),
                        $.getJSON(file_2009),
                        $.getJSON(file_2012)
                    ).done(function(history, hist2006, hist2009, hist2012) {
                        DS.addCompanyTopData(company, history[0], DS, "all");
                        DS.addCompanyTopData(company, hist2006[0], DS, "2006");
                        DS.addCompanyTopData(company, hist2009[0], DS, "2009");
                        DS.addCompanyTopData(company, hist2012[0], DS, "2012");
                        end_data_load();
                }).fail(function() {
                    DS.setCompaniesTopData([], self);
                    end_data_load();
                });
            });
        });
    }
    
    function data_load_repos_metrics() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            var repos = DS.getReposData();
            $.each(repos, function(i, repo) {
                var file = DS.getDataDir()+"/"+repo+"-";
                file_evo = file + DS.getName()+"-evolutionary.json";
                $.when($.getJSON(file_evo)).done(function(history) {
                    DS.addRepoMetricsData(repo, history, DS);
                    end_data_load();
                });
                file_static = file + DS.getName()+"-static.json";
                $.when($.getJSON(file_static)).done(function(history) {
                    DS.addRepoGlobalData(repo, history, DS);
                    end_data_load();
                });
            });
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
    
    function data_load_people() {
        var data_sources = Report.getDataSources();
        $.each(data_sources, function(i, DS) {
            data_load_file(DS.getPeopleDataFile(), DS.setPeopleData, DS);
        });
    }
    
    // TODO: Make more modular. Move companies and repos code and tops!
    function check_data_loaded() {
        var check = true;
        if (Report.getProjectData() === null || 
                Report.getConfig() === null || Report.getMarkers() === null) 
            return false;

        var projects_loaded = 0;
        var projects_data = Report.getProjectsData();
        var projects_dirs = Report.getProjectsDirs();
        for (var key in projects_data) {projects_loaded++;}
        if (projects_loaded < projects_dirs.length ) return false;
        
        var data_sources = Report.getDataSources();        
        $.each(data_sources, function(index, DS) {
            if (DS.getData() === null) {check = false; return false;}
            if (DS.getGlobalData() === null) {check = false; return false;}
            if (DS.getPeopleData() === null) {check = false; return false;}
            if (DS.getGlobalTopData() === null) {check = false; return false;}
            // Companies data loading
            if (DS.getCompaniesData() === null) {check = false; return false;}
            else {
                if (DS.getCompaniesData().length>0 && !check_companies) {
                    check_companies = true;
                    data_load_companies_metrics();
                    check = false; return false;
                }
            }
            if (check_companies && DS.getCompaniesData().length>0) {
                var companies_loaded = 0;
                for (var key in DS.getCompaniesMetricsData()) {companies_loaded++;}
                if (companies_loaded !== DS.getCompaniesData().length)
                    {check = false; return false;}
                companies_loaded = 0;
                for (var key in DS.getCompaniesGlobalData()) {companies_loaded++;}
                if (companies_loaded !== DS.getCompaniesData().length)
                    {check = false; return false;}
                if (DS.getCompaniesTopData() === null) {check = false; return false;}
                companies_loaded = 0;
                for (var key in DS.getCompaniesTopData()) {companies_loaded++;}
                if (companies_loaded !== DS.getCompaniesData().length)
                    {check = false; return false;}
            }
            // Repos data loading
            if (DS.getReposData() === null) {check = false; return false;}
            else {
                if (DS.getReposData().length>0 && !check_repos) {
                    check_repos = true;
                    data_load_repos_metrics();
                    check = false; return false;
                }
            }
            if (check_repos && DS.getReposData().length>0) {
                var repos_loaded = 0;
                for (var key in DS.getReposMetricsData()) {repos_loaded++;}
                if (repos_loaded !== DS.getReposData().length)
                    {check = false; return false;}
                repos_loaded = 0;
                for (var key in DS.getReposGlobalData()) {repos_loaded++;}
                if (repos_loaded !== DS.getReposData().length)
                    {check = false; return false;}
            }
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

    function end_data_load()  {        
        if (check_data_loaded()) {
            // Invoke callbacks informing all data needed has been loaded
            for ( var i = 0; i < data_callbacks.length; i++) {
                data_callbacks[i]();
            }
        }
    };
})();