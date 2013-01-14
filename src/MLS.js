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
    
    var self = this;
    
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
        
    this.data_lists_file = this.data_dir + '/mls-lists-milestone0.json';
    this.getListsFile = function() {return this.data_lists_file;};
    this.data_lists = null;
    this.getListsData = function() {return this.data_lists;};
    this.setListsData = function(lists, self) {
        if (self === undefined) self = this;
        self.data_lists = lists;
    }; 
    
    this.setDataDir = function(dataDir) {
        this.data_lists_file = this.data_dir + '/mls-lists-milestone0.json';
        MLS.prototype.setDataDir.call(this, dataDir);
    };

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

    this.displayBasicUserAll = function (id, all) {
        var form = document.getElementById('form_mls_selector');
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox")
                form.elements[i].checked = all;
        }
        this.displayBasicUser(id);
    };

    this.displayBasicUser = function(div_id) {

        $("#" + div_id).empty();

        lists = getUserLists();

        for ( var i = 0; i < lists.length; i++) {
            var l = lists[i];
            file_messages = this.getDataDir()+"/mls-";
            file_messages += l;
            file_messages += "-milestone0.json";
            displayBasicList(div_id, l, file_messages);
        }
    };

    this.displayBasic = function (div_id, config_metric) {
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

    };

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

    this.displayEvoAggregated = function (divid) {
        this.envisionEvo("Aggregated", divid, this.getData());
    };
    
    this.displayEvoAggregatedMix = function (divid) {
        var full_data = [];
        var projects = [];
        $.each(Report.getDataSources(), function (index, ds) {
           if (ds instanceof MLS) {
               full_data.push(ds.getData());
               projects.push(ds.getProject());
           } 
        });
        this.envisionEvo("Aggregated", divid, full_data, projects);
    };


    this.displayBasicMetricHTML = function(metric_id, div_target, show_desc) {
        Viz.displayBasicMetricHTML(basic_metrics[metric_id], this.getData(),
                div_target, show_desc);
    };

    this.displayEvo = function (id) {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                lists = JSON.parse(localStorage.getItem(getMLSId()));
                return this.displayEvoLists(id, lists);
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
        this.displayEvoLists(id, filtered_lists);
    };
    
    function cleanLocalStorage() {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                localStorage.removeItem(getMLSId());
            }
        }
    }
    
    this.getDefaultLists = function () {
        var default_lists = [];        
        var hide_lists = Report.getConfig().mls_hide_lists;
        $.each(this.getListsData().mailing_list, function(index,list) {
            if ($.inArray(list, hide_lists) === -1) default_lists.push(list);
        });
        return default_lists;
    };
    
    this.displaySelectorCheckDefault = function () {
        var default_lists = this.getDefaultLists();
        
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
    };
    
    this.displayBasicDefault = function (div_id) {
        
        var obj = self;
        if (this instanceof MLS) obj = this;

        cleanLocalStorage();
        obj.displaySelectorCheckDefault();
        $("#" + div_id).empty();
        obj.displayBasic(div_id);
    };

    this.displayEvoDefault = function (div_id) {
        var obj = self;
        if (this instanceof MLS) obj = this;

        cleanLocalStorage();
        if (document.getElementById('form_mls_selector'))
            obj.displaySelectorCheckDefault();
        $("#" + div_id).empty();
        obj.displayEvoLists(div_id, obj.getDefaultLists());
    };

    this.displayEvoUserAll = function (id, all) {
        var form = document.getElementById('form_mls_selector');
        for ( var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == "checkbox")
                form.elements[i].checked = all;
        }
        this.displayEvoUser(id);
    };

    this.displayEvoUser = function (id) {
        $("#" + id).empty();
        var obj = self;
        if (this instanceof MLS) obj = this;
        obj.displayEvoLists(id, getUserLists());
    };

    this.displayEvoListSelector = function (div_id_sel, div_id_mls) {
        this.displayEvoBasicListSelector(div_id_sel, div_id_mls, null);
    };

    this.displayBasicListSelector = function (div_id_sel, div_id_mls) {
        this.displayEvoBasicListSelector(div_id_sel, null, div_id_mls);
    };

    this.displayEvoBasicListSelector = function (div_id_sel, div_id_evo, div_id_basic){
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

    this.displayEvoLists = function (id, lists) {
        for ( var i = 0; i < lists.length; i++) {
            var l = lists[i];

            file_messages = this.getDataDir()+"/mls-";
            file_messages += l;
            file_messages += "-milestone0.json";
            this.displayEvoList(displayMLSListName(l), id, file_messages);
        }
    };

    this.displayEvoList = function(list_label, id, mls_file) {
        var self = this;
        $.getJSON(mls_file, function(history) {
            self.envisionEvo(list_label, id, history);
        });
    };

    this.envisionEvo = function (list_label, div_id, history, projects) {
        var config = Report.getConfig();
        var options = Viz.getEnvisionOptions(div_id, history, this,
                config.mls_hide, projects);
        options.data.list_label = displayMLSListName(list_label);
        new envision.templates.Envision_Report(options, [ this ]);
    };
}
var aux = new MLS();
MLS.prototype = new DataSource("mls", aux.getMetrics());