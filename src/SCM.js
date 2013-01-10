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
    // Work around: http://bit.ly/yP8tGP
    var self = this;

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
    
    self.getMetrics = function() {return basic_metrics;};
    
    self.getMainMetric = function() {
        return "commits";
    };
    
    self.displayData = function() {
        $("#scmFirst").text(self.global_data.first_date);
        $("#scmLast").text(self.global_data.last_date);
        $("#scmCommits").text(self.global_data.commits);
        $("#scmAuthors").text(self.global_data.authors);
        $("#scmCommitters").text(self.global_data.committers);
    };
    
    self.displayBasicHTML = function(div_target, config) {
        var title = "Change sets (commits to source code)";
        Viz.displayBasicHTML(self.getData(), div_target, title, 
                self.basic_metrics, self.name+'_hide', config);
    };
    
    self.displayBubbles = function(divid) {
        Viz.displayBubbles(divid, "commits", "committers");
    };
    
    self.displayEvo = function(id) {
        self.envisionEvo(id, self.getData());
    };
    
    self.envisionEvo = function(div_id, history) {
        config = Report.getConfig();
        options = Viz.getEnvisionOptions(div_id, history, self.basic_metrics,
                self.getMainMetric(), config.scm_hide);
        new envision.templates.Envision_Report(options, [ self ]);
    };   
}
var aux = new SCM();
SCM.prototype = new DataSource("scm", aux.getMetrics());