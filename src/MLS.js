/* 
 *
 * Copyright (C) 2012, Bitergia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  
 *  MLS.js: Library for visualizing Bitergia MLS data
 */

var MLS = {};

(function() {

    var name = "mls";
    var data_file = 'data/json/mls-milestone0.json';
    var data = null;
    var demographics_file = 'data/json/mls-demographics-2012.json';
    var global_data_file = 'data/json/mls-info-milestone0.json';
    var global_data = null;
    var top_data_file = 'data/json/mls-top-milestone0.json';

    MLS.displayEvo = displayEvo;
    MLS.displayEvoAggregated = displayEvoAggregated;
    MLS.displayBasic = displayBasic;
    MLS.displayBasicMetricHTML = displayBasicMetricHTML;
    MLS.displayBasicListSelector = displayBasicListSelector;
    MLS.displayBubbles = displayBubbles;
    MLS.displayEvoListSelector = displayEvoListSelector;
    MLS.displayEvoBasicListSelector = displayEvoBasicListSelector;
    MLS.displayBasicUser = displayBasicUser;
    MLS.displayEvoUser = displayEvoUser;
    MLS.displayEvoUserAll = displayEvoUserAll;
    MLS.displayBasicUserAll = displayBasicUserAll;
    MLS.displayEvoDefault = displayEvoDefault;
    MLS.displayData = displayData;
    MLS.displayTop = displayTop;
    MLS.getMetrics = function() {
        return basic_metrics;
    };
    MLS.getDataFile = function() {
        return data_file;
    };
    MLS.setDataFile = function(file) {
        data_file = file;
    };
    MLS.setData = function(load_data) {
        data = load_data;
    };
    MLS.getData = function() {
        return data;
    };
    MLS.setDataDir = function(dataDir) {
        data_file = dataDir + '/mls-milestone0.json';
        demographics_file = dataDir + '/mls-demographics-2012.json';
        global_data_file = dataDir + '/mls-info-milestone0.json';
        top_data_file = dataDir + '/mls-top-milestone0.json';
    };
    MLS.getGlobalDataFile = function() {
        return global_data_file;
    };
    MLS.setGlobalData = function(data) {
        global_data = data;
    };
    MLS.getGlobalData = function() {
        return global_data;
    };
    MLS.getName = function() {
        return name;
    };

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

    function displayTop(div, top_file, all, graph) {
        if (all === undefined)
            all = true;
        Viz.displayTop(div, top_file, basic_metrics, all, graph);
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
            file_messages = "data/json/mls-";
            file_messages += l;
            file_messages += "-milestone0.json";
            displayBasicList(div_id, l, file_messages);
        }
    }

    // TODO: use cache data to avoid always reading lists info
    function displayBasic(div_id, lists_file, config_metric) {
        $.getJSON(lists_file, function(lists) {
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
                file_messages = "data/json/mls-";
                file_messages += l;
                file_messages += "-milestone0.json";
                displayBasicList(div_id, l, file_messages, config_metric);
            }
        });
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

    function displayBubbles(divid) {
        Viz.displayBubbles(divid, "sent", "senders");
    }

    function getReportId() {
        var project_data = Report.getProjectData();
        return project_data.date + "_" + project_data.project_name;
    }

    function getMLSId() {
        return getReportId() + "_mls_lists";
    }

    function displayData() {
        $("#mlsFirst").text(global_data.first_date);
        $("#mlsLast").text(global_data.last_date);
        $("#mlsMessages").text(global_data.sent);
        $("#mlsSenders").text(global_data.senders);
    }

    function displayEvoAggregated(id) {
        envisionEvo("Aggregated", id, MLS.getData());
    }

    function displayBasicMetricHTML(metric_id, div_target, show_desc) {
        Viz.displayBasicMetricHTML(basic_metrics[metric_id], MLS.getData(),
                div_target, show_desc);
    }

    function displayEvo(id, lists_file) {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                lists = JSON.parse(localStorage.getItem(getMLSId()));
                return displayEvoLists(id, lists);
            }
        }

        $.getJSON(lists_file, function(history) {
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
        });
    }

    function displayEvoDefault() {
        if (localStorage) {
            if (localStorage.length && localStorage.getItem(getMLSId())) {
                localStorage.removeItem(getMLSId());
            }
        }
        // TODO: don't reload full page but just update mailing lists showing
        window.location.reload(false);
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
        var lists = getUserLists();
        displayEvoLists(id, lists);
    }

    function displayEvoListSelector(div_id_sel, div_id_mls, lists_file) {
        displayEvoBasicListSelector(div_id_sel, div_id_mls, null, lists_file);
    }

    function displayBasicListSelector(div_id_sel, div_id_mls, lists_file) {
        displayEvoBasicListSelector(div_id_sel, null, div_id_mls, lists_file);
    }

    function displayEvoBasicListSelector(div_id_sel, div_id_evo, div_id_basic,
            lists_file) {
        $
                .when($.getJSON(lists_file))
                .done(
                        function(res1) {
                            var lists = res1.mailing_list;
                            var user_lists = [];

                            if (localStorage) {
                                if (localStorage.length
                                        && localStorage.getItem(getMLSId())) {
                                    user_lists = JSON.parse(localStorage
                                            .getItem(getMLSId()));
                                }
                            }

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
                                    html += 'MLS.displayEvoUser(\''
                                            + div_id_evo + '\');';
                                if (div_id_basic)
                                    html += 'MLS.displayBasicUser(\''
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
                                html += 'MLS.displayEvoUserAll(\'' + div_id_evo
                                        + '\',true);';
                            if (div_id_basic)
                                html += 'MLS.displayBasicUserAll(\''
                                        + div_id_basic + '\',true);';
                            html += '">';
                            html += '<input type=button value="None" ';
                            html += 'onClick="';
                            if (div_id_evo)
                                html += 'MLS.displayEvoUserAll(\'' + div_id_evo
                                        + '\',false);';
                            if (div_id_basic)
                                html += 'MLS.displayBasicUserAll(\''
                                        + div_id_basic + '\',false);';
                            html += '">';
                            html += '<input type=button value="Default" ';
                            html += 'onClick="MLS.displayEvoDefault()">';
                            html += "</form>";
                            $("#" + div_id_sel).html(html);
                        });
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

            file_messages = "data/json/mls-";
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
        new envision.templates.Envision_Report(options, [ MLS ]);
    }
})();

Report.registerDataSource(MLS);