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

function MLS() {
    
    var basic_metrics = {
        'sent' : {
            'divid' : "mls-sent",
            'column' : "sent",
            'name' : "Sent",
            'desc' : "Number of messages"
        },
        'senders' : {
            'divid' : "mls-senders",
            'column' : "senders",
            'name' : "Senders",
            'desc' : "Number of unique message senders",
            'action' : "sent"
        }
    };
        
    // Work around: http://bit.ly/yP8tGP
    var self = this;
    
    this.data_lists_file = this.data_dir + '/mls-lists-milestone0.json';
    this.getListsFile = function() {return this.data_lists_file;};
    var data_lists = null;
    this.getListsData = function() {return data_lists;};
    this.setListsData = function(lists) {data_lists = lists;}; 
    
    this.setDataDir = function(dataDir) {
        this.data_lists_file = this.data_dir + '/mls-lists-milestone0.json';
        MLS.prototype.setDataDir.call(self, dataDir);
    };

    this.displayEvo = displayEvo;
    this.displayEvoAggregated = displayEvoAggregated;
    this.displayBasic = displayBasic;
    this.displayBasicMetricHTML = displayBasicMetricHTML;
    this.displayBasicListSelector = displayBasicListSelector;
    this.displayEvoListSelector = displayEvoListSelector;
    this.displayEvoBasicListSelector = displayEvoBasicListSelector;
    this.displayBasicUser = displayBasicUser;
    this.displayEvoUser = displayEvoUser;
    this.displayEvoUserAll = displayEvoUserAll;
    this.displayBasicUserAll = displayBasicUserAll;
    this.displayEvoDefault = displayEvoDefault;
    this.displayBasicDefault = displayBasicDefault;
    this.getMainMetric = function() {
        return "sent";
    };
    this.getMetrics = function() {return basic_metrics;};
    
    this.displayData = function() {
        $("#mlsFirst").text(this.global_data.first_date);
        $("#mlsLast").text(this.global_data.last_date);
        $("#mlsMessages").text(this.global_data.sent);
        $("#mlsSenders").text(this.global_data.senders);
    };
    
    
    this.displayBubbles = function(divid) {
        Viz.displayBubbles(divid, "sent", "senders");
    };
        
    // http:__lists.webkit.org_pipermail_squirrelfish-dev_
    // <allura-dev.incubator.apache.org>
    function displayMLSListName(listinfo) {
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
    }

    function getUserLists() {
        var form = document.getElementById('form_mls_selector');
        var lists = [];
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].checked)
                lists.push(form.elements[i].value);
        }

        if (localStorage) {
            localStorage.setItem(getMLSId(), JSON.stringify(lists));
        }
        return lists;
    }

    function displayBasicUserAll(id, all) {
        var form = document.getElementById('form_mls_selector');
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox")
                form.elements[i].checked = all;
        }
        displayBasicUser(id);
    }

    function displayBasicUser(div_id) {

        $("#" + div_id).empty();

        lists = getUserLists();

        for ( var i = 0; i < lists.length; i++) {
            var l = lists[i];
            file_messages = this.getDataDir()+"/mls-";
            file_messages += l;
            file_messages += "-milestone0.json";
            displayBasicList(div_id, l, file_messages);
        }
    }

    function displayBasic(div_id, config_metric) {
        var lists = this.getListsData();

        lists_hide = Report.getConfig().mls_hide_lists;
        lists = lists.mailing_list;
        var user_pref = false;

        if (typeof lists === 'string')
            lists = [ lists ];

        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                lists = JSON.parse(localStorage.getItem(getMLSId()));
                user_pref = true;
            }
        }

        for ( var i = 0; i < lists.length; i++) {
            var l = lists[i];
            if (!user_pref)
                if ($.inArray(l, lists_hide) > -1)
                    continue;
            file_messages = this.getDataDir()+ "/mls-";
            file_messages += l;
            file_messages += "-milestone0.json";
            displayBasicList(div_id, l, file_messages, config_metric);
        }

    }

    // TODO: similar to displayBasicHTML in ITS and SCM. Join.
    // TODO: use cache to store mls_file and check it!
    function displayBasicList(div_id, l, mls_file, config_metric) {
        var config = Viz.checkBasicConfig(config_metric);
        for ( var id in basic_metrics) {
            var metric = basic_metrics[id];
            var title = '';
            if (config.show_title)
                title = metric.name;
            if ($.inArray(metric.column, Report.getConfig().mls_hide) > -1)
                continue;
            var new_div = "<div class='info-pill m0-box-div flotr2-"
                    + metric.column + "'>";
            new_div += "<h1>" + metric.name + " " + displayMLSListName(l)
                    + "</h1>";
            new_div += "<div id='" + metric.divid + "_" + l
                    + "' class='m0-box flotr2-" + metric.column + "'></div>";
            if (config.show_desc)
                new_div += "<p>" + metric.desc + "</p>";
            new_div += "</div>";
            $("#" + div_id).append(new_div);
            Viz.displayBasicLinesFile(metric.divid + '_' + l, mls_file,
                    metric.column, config.show_labels, title);
        }

    }

    function getReportId() {
        var project_data = Report.getProjectData();
        return project_data.date + "_" + project_data.project_name;
    }

    function getMLSId() {
        return getReportId() + "_mls_lists";
    }

    function displayEvoAggregated(id) {
        envisionEvo("Aggregated", id, this.getData());
    }

    function displayBasicMetricHTML(metric_id, div_target, show_desc) {
        Viz.displayBasicMetricHTML(basic_metrics[metric_id], this.getData(),
                div_target, show_desc);
    }

    function displayEvo(id) {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                lists = JSON.parse(localStorage.getItem(getMLSId()));
                return displayEvoLists(id, lists);
            }
        }

        history = this.getListsData();
        lists = history.mailing_list;
        var config = Report.getConfig();
        lists_hide = config.mls_hide_lists;
        if (typeof lists === 'string') {
            lists = [ lists ];
        }

        var filtered_lists = [];
        for ( var i = 0; i < lists.length; i++) {
            if ($.inArray(lists[i], lists_hide) == -1)
                filtered_lists.push(lists[i]);
        }

        if (localStorage) {
            if (!localStorage.getItem(getMLSId())) {
                localStorage.setItem(getMLSId(), JSON
                        .stringify(filtered_lists));
            }
        }
        displayEvoLists(id, filtered_lists);
    }
    
    function cleanLocalStorage() {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                localStorage.removeItem(getMLSId());
            }
        }
    }
    
    function getDefaultLists() {
        var default_lists = [];        
        var hide_lists = Report.getConfig().mls_hide_lists;
        $.each(this.getListsData().mailing_list, function(index,list) {
            if ($.inArray(list, hide_lists) === -1) default_lists.push(list);
        });
        return default_lists;
    }
    
    function displaySelectorCheckDefault() {
        var default_lists = getDefaultLists();
        
        var form = document.getElementById('form_mls_selector');
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox") {
                var id = form.elements[i].id;
                l = id.split("_check")[0];
                if ($.inArray(l, default_lists) > -1)
                    form.elements[i].checked = true;
                else form.elements[i].checked = false;
            }
        }
    }
    
    function displayBasicDefault(div_id) {
        cleanLocalStorage();
        displaySelectorCheckDefault();
        $("#" + div_id).empty();
        this.displayBasic(div_id);
    }

    function displayEvoDefault(div_id) {
        cleanLocalStorage();
        if (document.getElementById('form_mls_selector'))
            displaySelectorCheckDefault();
        $("#" + div_id).empty();
        displayEvoLists(div_id, getDefaultLists());
    }

    function displayEvoUserAll(id, all) {
        var form = document.getElementById('form_mls_selector');
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox")
                form.elements[i].checked = all;
        }
        displayEvoUser(id);
    }

    function displayEvoUser(id) {
        $("#" + id).empty();
        displayEvoLists(id, getUserLists());
    }

    function displayEvoListSelector(div_id_sel, div_id_mls) {
        displayEvoBasicListSelector(div_id_sel, div_id_mls, null);
    }

    function displayBasicListSelector(div_id_sel, div_id_mls) {
        displayEvoBasicListSelector(div_id_sel, null, div_id_mls);
    }

    function displayEvoBasicListSelector(div_id_sel, div_id_evo, div_id_basic){
        var res1 = this.getListsData();
        var lists = res1.mailing_list;
        var user_lists = [];

        if (localStorage) {
            if (localStorage.length
                    && localStorage.getItem(getMLSId())) {
                user_lists = JSON.parse(localStorage
                        .getItem(getMLSId()));
            }
        }
        
        // TODO: Hack! Methods visible to HTML
        Report.displayBasicUser = this.displayBasicUser;
        Report.displayBasicUserAll = this.displayBasicUserAll;
        Report.displayBasicDefault = this.displayBasicDefault;
        Report.displayEvoDefault = this.displayEvoDefault;            
        Report.displayEvoUser = this.displayEvoUser;
        Report.displayEvoUserAll = this.displayEvoUserAll;

        var html = "Mailing list selector:";
        html += "<form id='form_mls_selector'>";

        if (typeof lists === 'string') {
            lists = [ lists ];
        }
        for ( var i = 0; i < lists.length; i++) {
            var l = lists[i];
            html += '<input type=checkbox name="check_list" value="'
                    + l + '" ';
            html += 'onClick="';
            if (div_id_evo)
                html += 'Report.displayEvoUser(\''
                        + div_id_evo + '\');';
            if (div_id_basic)
                html += 'Report.displayBasicUser(\''
                        + div_id_basic + '\')";';
            html += '" ';
            html += 'id="' + l + '_check" ';
            if ($.inArray(l, user_lists) > -1)
                html += 'checked ';
            html += '>';
            html += displayMLSListName(l);
            html += '<br>';
        }
        html += '<input type=button value="All" ';
        html += 'onClick="';
        if (div_id_evo)
            html += 'Report.displayEvoUserAll(\'' + div_id_evo
                    + '\',true);';
        if (div_id_basic)
            html += 'Report.displayBasicUserAll(\''
                    + div_id_basic + '\',true);';
        html += '">';
        html += '<input type=button value="None" ';
        html += 'onClick="';
        if (div_id_evo)
            html += 'Report.displayEvoUserAll(\'' + div_id_evo
                    + '\',false);';
        if (div_id_basic)
            html += 'Report.displayBasicUserAll(\''
                    + div_id_basic + '\',false);';
        html += '">';
        html += '<input type=button value="Default" ';
        html += 'onClick="';
        if (div_id_evo)
            html += 'Report.displayEvoDefault(\''+div_id_evo+'\');';
        if (div_id_basic)
            html += 'Report.displayBasicDefault(\''+div_id_basic+'\')';
        html += '">';
        html += "</form>";
        $("#" + div_id_sel).html(html);
    }

    // history values should be always arrays
    function filterHistory(history) {
        if (typeof (history.id) === "number") {
            $.each(history, function(key, value) {
                value = [ value ];
            });
        }
        return history;
    }

    function displayEvoLists(id, lists) {
        for ( var i = 0; i < lists.length; i++) {
            var l = lists[i];

            file_messages = this.getDataDir()+"/mls-";
            file_messages += l;
            file_messages += "-milestone0.json";
            displayEvoList(displayMLSListName(l), id, file_messages);
        }
    }

    function displayEvoList(list_label, id, mls_file) {
        $.getJSON(mls_file, function(history) {
            envisionEvo(list_label, id, history);
        });
    }

    function envisionEvo(list_label, div_id, history) {
        var config = Report.getConfig();

        var main_metric = "sent";
        var options = Viz.getEnvisionOptions(div_id, history, basic_metrics,
                main_metric, config.mls_hide);
        options.data.list_label = displayMLSListName(list_label);
        new envision.templates.Envision_Report(options, [ self ]);
    }
}
var aux = new MLS();
MLS.prototype = new DataSource("mls", aux.getMetrics());