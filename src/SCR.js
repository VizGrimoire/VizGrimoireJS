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

function SCR() {
    
    var self = this;
    
    var basic_metrics = {
        'opened' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'closed' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'merged' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'new' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'abandoned' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'verified' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'approved' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'codereview' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'WaitingForReviewer' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },        
        'WaitingForSubmitter' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        /* TODO: Fix submitted duplicate metric */
        'submitted.x' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        },
        'submitted.y' : {
            'divid' : "scr-",
            'column' : "",
            'name' : "",
            'desc' : ""
        }
    };
        
    this.getMainMetric = function() {
        return "merged";
    };
    this.getMetrics = function() {return basic_metrics;};
    
    this.displaySubReportSummary = function(report, divid, item, ds) {
        var label = item;
        if (item.lastIndexOf("http") === 0) {
            var aux = item.split("_");
            label = aux.pop();
            if (label === '') label = aux.pop();
        }
        var html = "<h4>" + label + "</h4>";
        
        // TODO: No label translation yet
        var id_label = {};
        
        var id_label1 = {
            "submitted.x": "",
            opened:"",
            "new":"",
            closed:"",
            merged:"",
            abandoned:"",
            verified:"",
            approved:"",
            codereview:"",
            "submitted.y":"",
            WaitingForReviewer:"",
            WaitingForSubmitter:""
        };
        
        var global_data = null;
        if (report === "companies")
            global_data = ds.getCompaniesGlobalData();
        if (report === "countries")
            global_data = ds.getCountriesGlobalData();
        else if (report === "repositories")
            global_data = ds.getReposGlobalData();
        else return;
        
        $.each(global_data[item],function(id,value) {
            if (id_label[id]) 
                html += id_label[id] + ": " + value + "<br>";
            else
                html += id + ": " + value + "<br>";
        });
        $("#"+divid).append(html);
    };


    this.displayData = function(divid) {
        var div_id = "#" + divid;

        var str = this.global_data.url;
        if (!str || str.length === 0) {
            $(div_id + ' .scr_info').hide();
            return;
        }
        
        var url = '';
        if (this.global_data.repositories === 1) {
            url = this.global_data.url;
        } else {
            url = Report.getProjectData().mls_url;
        }

        if (this.global_data.type)
            $(div_id + ' #scr_type').text(this.global_data.type);
        if (this.global_data.url && this.global_data.url !== "." && this.global_data.type !== undefined)  {
            $(div_id + ' #scr_url').attr("href", url);
            $(div_id + ' #scr_name').text("SCR " + this.global_data.type);
        } else {
            $(div_id + ' #scr_url').attr("href", Report.getProjectData().mls_url);
            $(div_id + ' #scr_name').text(Report.getProjectData().mls_name);            
            $(div_id + ' #scr_type').text(Report.getProjectData().mls_type);
        }

        var company = this.getCompanyQuery();
        var data = this.getGlobalData();
        if (company) {
            data = this.getCompaniesGlobalData()[company];
        }

        $(div_id + ' #scrFirst').text(data.first_date);
        $(div_id + ' #scrLast').text(data.last_date);
        $(div_id + ' #scrReviews').text(data.opened);
    };

    this.displayBubbles = function(divid, radius) {
        // TODO: we don't have people metrics data
        Viz.displayBubbles(divid, "opened", "openers", radius);
    };
        
    // http:__lists.webkit.org_pipermail_squirrelfish-dev_
    // <allura-dev.incubator.apache.org>
    SCR.displaySCRListName = function (listinfo) {
        var list_name_tokens = listinfo.split("_");
        var list_name = ''; 
        if (list_name_tokens.length > 1) {
            list_name = list_name_tokens[list_name_tokens.length - 1];
            if (list_name === "")
                list_name = list_name_tokens[list_name_tokens.length - 2];
        } else {
            list_name = listinfo.replace("<", "");
            list_name = list_name.replace(">", "");
            list_name_tokens = list_name.split(".");
            list_name = list_name_tokens[0];
        }
        return list_name;
    };

    this.getTitle = function() {return "Source Code Review";};    
}
var aux = new SCR();
SCR.prototype = new DataSource("scr", aux.getMetrics());
