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

function ITS() {

    var basic_metrics = {
        'opened' : {
            'divid' : 'its-opened',
            'column' : "opened",
            'name' : "Opened",
            'desc' : "Number of opened tickets",
            'envision' : {
                y_labels : true,
                show_markers : true
            }
        },
        'openers' : {
            'divid' : 'its-openers',
            'column' : "openers",
            'name' : "Openers",
            'desc' : "Unique identities opening tickets",
            'action' : "opened",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'closed' : {
            'divid' : 'its-closed',
            'column' : "closed",
            'name' : "Closed",
            'desc' : "Number of closed tickets"
        },
        'closers' : {
            'divid' : 'its-closers',
            'column' : "closers",
            'name' : "Closers",
            'desc' : "Number of identities closing tickets",
            'action' : "closed",
            'envision' : {
                gtype : 'whiskers'
            }
        },
        'changed' : {
            'divid' : 'its-changed',
            'column' : "changed",
            'name' : "Changed",
            'desc' : "Number of changes to the state of tickets"
        },
        'changers' : {
            'divid' : 'its-changers',
            'column' : "changers",
            'name' : "Changers",
            'desc' : "Number of identities changing the state of tickets",
            'action' : "changed",
            'envision' : {
                gtype : 'whiskers'
            }
        }
    };       
    
    this.getMetrics = function() {return basic_metrics;};
    
    this.getMainMetric = function() {
        return "opened";
    };
    
    this.displayData = function() {
        $('#its_type').text(this.global_data.type);
        var url = this.global_data.url;
        if (this.global_data.type === "allura")
            url = url.replace("rest/","");
        else if (this.global_data.type === "github") {
            url = url.replace("api.","");
            url = url.replace("repos/","");
        }
        $('#its_url').attr("href", url);
        $('#its_name').text("Tickets " + this.global_data.type);
        $("#itsFirst").text(this.global_data.first_date);
        $("#itsLast").text(this.global_data.last_date);
        $("#itsTickets").text(this.global_data.tickets);
        $("#itsOpeners").text(this.global_data.openers);
    };
    
    this.displayBasicHTMLMix = function(div_target, config) {
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds instanceof ITS) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        var title = "Tickets Mix";
        Viz.displayBasicHTML(full_data, div_target, title, 
                this.basic_metrics, this.name+'_hide', config, projects);
    };
       
    this.displayBasicHTML = function(div_target, config) {
        var title = "Tickets";
        Viz.displayBasicHTML(this.getData(), div_target, title, 
                this.basic_metrics, this.name+'_hide', config, [this.getProject()]);
    };
    
    this.displayBubbles = function(divid) {
        Viz.displayBubbles(divid, "opened", "openers");
    };
    
    this.displayEvoMix = function(divid) {
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds instanceof ITS) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        this.envisionEvo(divid, full_data, projects);
    };
    
    this.displayEvo = function(id) {
        this.envisionEvo(id, this.getData());
    };
    
    this.envisionEvo = function(div_id, history, projects) {
        config = Report.getConfig();
        var options = Viz.getEnvisionOptions(div_id, history, this,
                config.its_hide, projects);
        new envision.templates.Envision_Report(options, [ this ]);
    };

    
}
var aux = new ITS();
ITS.prototype = new DataSource("its", aux.getMetrics());