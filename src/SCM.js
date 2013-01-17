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

function SCM() {

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
    
    this.getMetrics = function() {return basic_metrics;};
    
    this.getMainMetric = function() {
        return "commits";
    };
    
    this.displayData = function() {
        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $('.source_info').hide();
            return;
        }
        $('#scm_type').text(this.global_data.type);
        var url = this.global_data.url;
        if (this.global_data.type === "git")
            url = url.replace("git://","http://");
        $('#scm_url').attr("href", url);
        $('#scm_name').text("SCM " + this.global_data.type);        
        $("#scmFirst").text(this.global_data.first_date);
        $("#scmLast").text(this.global_data.last_date);
        $("#scmCommits").text(this.global_data.commits);
        $("#scmAuthors").text(this.global_data.authors);
        $("#scmCommitters").text(this.global_data.committers);
    };
    
    this.displayBasicHTMLMix = function(div_target, config) {
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds instanceof SCM) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        var title = "Change sets Mix (commits to source code)";
        Viz.displayBasicHTML(full_data, div_target, title, 
                this.basic_metrics, this.name+'_hide', config, projects);
    };
    
    this.displayBasicHTML = function(div_target, config) {
        var title = "Change sets (commits to source code)";
        Viz.displayBasicHTML(this.getData(), div_target, title, 
                this.basic_metrics, this.name+'_hide', config, [this.getProject()]);
    };
    
    this.displayBubbles = function(divid) {
        Viz.displayBubbles(divid, "commits", "committers");
    };
    
    this.displayEvoMix = function(divid) {
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds instanceof SCM) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        this.envisionEvo(divid, full_data, projects);
    };

    
    this.displayEvo = function(divid) {
        this.envisionEvo(divid, this.getData());
    };
    
    this.envisionEvo = function(div_id, history, projects) {
        config = Report.getConfig();
        var options = Viz.getEnvisionOptions(div_id, history, this,
                config.scm_hide, projects);
        new envision.templates.Envision_Report(options, [ this ]);
    }; 
}
var aux = new SCM();
SCM.prototype = new DataSource("scm", aux.getMetrics());