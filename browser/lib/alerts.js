/*
 * Copyright (C) 2012-2015 Bitergia
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
 * This file is a part of the VizGrimoireJS-lib package
 *
 * Authors:
 *   Alvaro del Castillo San Felix <acs@bitergia.com>
 *
 */

var Alerts = {};

(function() {

    Alerts.alerts = {};

    Alerts.widget = function(){
        var divs = $(".Alerts");
        if (divs.length > 0){
            $.each(divs, function(id, div) {
                ds_name = $(this).data('data-source');
                alert = $(this).data('alert');
                /* this is a typical check, should be moved to a generic funct*/
                DS = Report.getDataSourceByName(ds_name);
                if (DS === null) return;
                if (DS.getData().length === 0) return; /* no data for data source*/

                loadAlertsData(ds_name,
                    function(){
                        displayAlerts(div, ds_name, alert);
                        });
            });
        }
    };

    function loadAlertsData (ds_name, cb) {
        suffix = ds_name.toLowerCase();
        var json_file = "data/json/" + suffix + "-alerts.json";
        $.when($.getJSON(json_file)
                ).done(function(json_data) {
                Alerts.alerts[suffix] = json_data;
                cb();
        }).fail(function() {
            console.log("Alerts widget disabled. Missing " + json_file);
        });
    }

    function displayAlerts (div, ds_name, alert) {
        var html = HTMLAlerts(ds_name, alert);
        if (!div.id) div.id = "Parsed" + getRandomId();
        $("#"+div.id).append(html);
    }

    function HTMLAlerts (ds_name, alert){
        var html = '<div class="row">';
        html += '<div class="col-md-12"><div class="well">';
        $.each(Alerts.alerts[ds_name][alert].uid, function(i, value) {
            // date, email, name, uid
            name = Alerts.alerts[ds_name][alert].name[i];
            first_date = Alerts.alerts[ds_name][alert].date[i];
            email = Alerts.alerts[ds_name][alert].email[i];
            html += "<div id =alert-uid-'"+value+"' class='alert alert-success'>";
            html += "New code developer: " + name + "<br>" + first_date;
            html += "</div>";
        });
        html += '</div></div></div>';
        return html;
    }

    function getRandomId() {
        return Math.floor(Math.random()*1000+1);
    }

})();

Loader.data_ready(function() {
    Alerts.widget();
});
