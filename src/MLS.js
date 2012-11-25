/* 
 * MLS.js: Library for visualizing Bitergia MLS data
 */

var MLS = {};

(function() {
	
MLS.displayEvo = displayEvo;
MLS.displayBasicMLS = displayBasicMLS; 
MLS.displayListSelector = displayListSelector;
MLS.displayEvoMLSUser = displayEvoMLSUser;
MLS.displayEvoMLSUserAll = displayEvoMLSUserAll;
MLS.displayEvoMLSCleanPrefs = displayEvoMLSCleanPrefs;
MLS.displayData = displayData;

// http:__lists.webkit.org_pipermail_squirrelfish-dev_
// <allura-dev.incubator.apache.org>
function displayMLSListName(listinfo) {
	var list_name_tokens = listinfo.split("_");
	if (list_name_tokens.length > 1) {
		var list_name = list_name_tokens[list_name_tokens.length - 1];
		if (list_name === "")
			list_name = list_name_tokens[list_name_tokens.length - 2];
	} else {
		list_name = listinfo.replace("<","");
		list_name = list_name.replace(">","");
	}
	return list_name;
}

function displayBasicMLS(div_id, lists_file, envision_cfg_file) {
	$.when($.getJSON(lists_file), $.getJSON(envision_cfg_file))
	.done (function(res1, res2) {				
		lists = res1[0].mailing_list;
		lists_hide = res2[0].mls_hide_lists;

		if (typeof lists === 'string') {
			lists = [lists];
		}

		for ( var i = 0; i < lists.length; i++) {
			var l = lists[i];
			if ($.inArray(l,lists_hide)>-1) continue;
			file_messages = "data/json/mls-";
			file_messages += l;
			file_messages += "-milestone0.json";
			displayBasicMLSList(div_id, l, file_messages);
		}
		;
	});
}

function displayBasicMLSList(div_id, l, file_messages) {
	var container = document.getElementById(div_id);

	// Sent div for mailing list    		    		
	var new_div = "<div class='info-pill m0-box-div flotr2-sent'>";
	new_div += "<h1>Messages sent " + displayMLSListName(l) + "</h1>";
	new_div += "<div id='container_messages_" + l + "' class='m0-box'></div>";
	new_div += "<p>Evolution in the number of messages</p>";
	new_div += "</div>";
	container.innerHTML += new_div;
	basic_lines('container_messages_' + l, file_messages, "sent", 1, "sent");

	// Senders div for mailing list    		    		
	var new_div = "<div class='info-pill m0-box-div flotr2-senders'>";
	new_div += "<h1>Senders " + displayMLSListName(l) + "</h1>";
	new_div += "<div id='container_senders_" + l + "' class='m0-box flotr2-senders'></div>";
	new_div += "<p>Evolution in the number of senders</p>";
	new_div += "</div>";
	container.innerHTML += new_div;
	basic_lines('container_senders_' + l, file_messages, "senders", 1,
			"senders");
}

function getReportId() {
	var project_data = M0.getProjectData();
	return project_data.date + "_" + project_data.project_name;
}

function getMLSId() {
	return getReportId()+"_mls_lists";
}
	
function displayEvoMLSCleanPrefs() {
	if (localStorage) {
        if (localStorage.length && localStorage.getItem(getMLSId())) {
        	localStorage.removeItem(getMLSId());
        }
	}
}

function displayData(filename) {
	$.getJSON(filename, function(data) {
		$("#mlsFirst").text(data.first_date);
		$("#mlsLast").text(data.last_date);
		$("#mlsMessages").text(data.messages);
		$("#mlsSenders").text(data.people);
	});
}

function displayEvo(id, lists_file, markers, config) {		
	if (localStorage) {
        if (localStorage.length && localStorage.getItem(getMLSId())) {
        	lists = JSON.parse(localStorage.getItem(getMLSId()));
    		return displayEvoMLSLists(id, lists, markers, config);
        } 
	}
	
	$.getJSON(lists_file, function(history) {				
		lists = history.mailing_list;
		lists_hide = config.mls_hide_lists;		
		if (typeof lists === 'string') {
			lists = [lists];
		}
		
		var filtered_lists = [];
		for (var i = 0; i < lists.length; i++) {			
			if ($.inArray(lists[i],lists_hide)==-1) 
				filtered_lists.push(lists[i]); 
		}
		
		if (localStorage) {
	        if (!localStorage.getItem(getMLSId())) {
	    		localStorage.setItem(getMLSId(), JSON.stringify(filtered_lists));
	        } 
		}		
		displayEvoMLSLists(id, filtered_lists, markers, config);
	});
}
	
function displayEvoMLSUserAll(id, all) {
    var form = document.getElementById('form_mls_selector');
    for ( var i = 0; i < form.elements.length; i++) {
    	if (form.elements[i].type =="checkbox")
    		form.elements[i].checked = all;
    }
    var markers = M0.getMarkers();
	var envision_cfg_file = M0.getConfig();	
    displayEvoMLSUser(id, markers, envision_cfg_file);
}

function displayEvoMLSUser(id, markers, envision_cfg_file) {
	
	$("#"+id).empty();
	
    var form = document.getElementById('form_mls_selector');
    var lists = [];
    for ( var i = 0; i < form.elements.length; i++) {
        if (form.elements[i].checked) lists.push(form.elements[i].value);
    }

	if (localStorage) {
		localStorage.setItem(getMLSId(), JSON.stringify(lists));
	}
	
	displayEvoMLSLists(id, lists, markers, envision_cfg_file);    	
}

function displayListSelector(div_id_sel, div_id_mls, lists_file, markers, config) {
	$.when($.getJSON(lists_file))
	.done (function(res1) {				
		var lists = res1.mailing_list;
		var user_lists = [];
				
		if (localStorage) {
	        if (localStorage.length && localStorage.getItem(getMLSId())) {
	        	user_lists = JSON.parse(localStorage.getItem(getMLSId()));
	        } 
		}

		var html = "Mailing list selector:";
		html += "<form id='form_mls_selector'>";
		
		if (typeof lists === 'string') {
			lists = [lists];
		}
		for ( var i = 0; i < lists.length; i++) {
			var l = lists[i];
			html += displayMLSListName(l);
			html += '<input type=checkbox name="check_list" value="'+l+'" ';
			html += 'onClick="MLS.displayEvoMLSUser(\''+div_id_mls+'\')"';
			html += 'id="'+l+'_check" ';
			if ($.inArray(l, user_lists)>-1) html += 'checked ';
			html += '><br>';
		}
		html += '<input type=button value="All" ';
		html += 'onClick="MLS.displayEvoMLSUserAll(\''+div_id_mls+'\',';
		html += true +')">';
		html += '<input type=button value="None" ';
		html += 'onClick="MLS.displayEvoMLSUserAll(\''+div_id_mls+'\',';
		html += false +')">';
		html += '<input type=button value="Clean prefs" ';
		html += 'onClick="MLS.displayEvoMLSCleanPrefs()">';
		html += "</form>";
		$("#"+div_id_sel).html(html);
	});
}


// history values should be always arrays
function filterHistory(history) {
	if (typeof(history.id) === "number") {
		for (key in history) {
			history[key] = [history[key]];
		}
	}
	return history;	
}

function displayEvoMLSLists(id, lists, markers, envision_cfg_file) {
	for ( var i = 0; i < lists.length; i++) {
		var l = lists[i];
		
		file_messages = "data/json/mls-";
		file_messages += l;
		file_messages += "-milestone0.json";
		displayEvoMLSList(displayMLSListName(l), id, file_messages, 
				markers, envision_cfg_file);
	}
}

function displayEvoMLSList(list_label, id, mls_file, markers, config) {
	$.getJSON(mls_file, function(history) {
		envisionEvo(list_label, id, history, markers, config);
	});
}

function envisionEvo(list_label, id, history, markers, envision_cfg) {
	var V = envision, firstMonth = history.id[0], options, vis;
	var container = document.getElementById(id);
	
	options = {
		container : container,
		data : {
			summary : [ history.id, history.sent ],
			sent : [ history.id, history.sent ],
			senders : [ history.id, history.senders ],
			markers : markers,
			list_label : list_label,
			dates : history.date,
			envision_mls_hide: envision_cfg.mls_hide
		},
		trackFormatter : function(o) {
			var
			//   index = o.index,
			data = o.series.data, index = data[o.index][0]
					- firstMonth, value;
			value = history.date[index] + ":";
			value += history.sent[index] + " messages sent, ";
			value += "<br/>"+ history.senders[index]+" senders";
			return value;
		},
		xTickFormatter : function(index) {
			return history.date[index - firstMonth];
			// return Math.floor(index/12) + '';
		},
		yTickFormatter : function(n) {
			return parseInt(n) + '';
		},
		// Initial selection
		selection : {
			data : {
				x : {
					min : history.id[0],
					max : history.id[history.id.length - 1]
				}
			}
		}
	};
	// Create the TimeSeries
	vis = new envision.templates.MLS_Milestone0(options);		
}
})();