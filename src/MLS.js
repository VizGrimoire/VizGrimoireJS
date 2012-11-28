/* 
 * MLS.js: Library for visualizing Bitergia MLS data
 */

var MLS = {};

(function() {
	
MLS.displayEvo = displayEvo;
MLS.displayBasic = displayBasic; 
MLS.displayBasicListSelector = displayBasicListSelector;
MLS.displayEvoListSelector = displayEvoListSelector;
MLS.displayEvoBasicListSelector = displayEvoBasicListSelector;
MLS.displayBasicUser = displayBasicUser;
MLS.displayEvoUser = displayEvoUser;
MLS.displayEvoUserAll = displayEvoUserAll;
MLS.displayBasicUserAll = displayBasicUserAll;
MLS.displayEvoDefault = displayEvoDefault;
MLS.displayData = displayData;

var basic_metrics = {
		'sent': {
			'divid':"sent_mls", 
			'column':"sent",
			'name':"Sent",
			'desc':"Evolution in the number of messages"},
		'senders': {
			'divid':"senders_mls", 
			'column':"senders",
			'name':"Senders",
			'desc':"Evolution in the number of senders"},
};

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

function getUserLists() {
    var form = document.getElementById('form_mls_selector');
    var lists = [];
    for ( var i = 0; i < form.elements.length; i++) {
        if (form.elements[i].checked) lists.push(form.elements[i].value);
    }

	if (localStorage) {
		localStorage.setItem(getMLSId(), JSON.stringify(lists));
	}
	return lists;
}

function displayBasicUserAll(id, all) {
    var form = document.getElementById('form_mls_selector');
    for ( var i = 0; i < form.elements.length; i++) {
    	if (form.elements[i].type =="checkbox")
    		form.elements[i].checked = all;
    }
    displayBasicUser(id);
}

function displayBasicUser(div_id) {
	
	$("#"+div_id).empty();
	
	lists = getUserLists();
	
	for ( var i = 0; i < lists.length; i++) {
		var l = lists[i];
		file_messages = "data/json/mls-";
		file_messages += l;
		file_messages += "-milestone0.json";
		displayBasicList(div_id, l, file_messages);
	}
}

function displayBasic(div_id, lists_file) {
	$.getJSON(lists_file, function(lists) {				
		lists_hide = M0.getConfig().mls_hide_lists;
		lists = lists.mailing_list;

		if (typeof lists === 'string') lists = [lists];

		for ( var i = 0; i < lists.length; i++) {
			var l = lists[i];
			if ($.inArray(l,lists_hide)>-1) continue;
			file_messages = "data/json/mls-";
			file_messages += l;
			file_messages += "-milestone0.json";
			displayBasicList(div_id, l, file_messages);
		}
	});
}

// TODO: similar to displayBasicHTML in ITS and SCM. Join.
// TODO: use cache to store mls_file and check it! 
function displayBasicList(div_id, l, mls_file) { 
	for (var id in basic_metrics) {
		var metric = basic_metrics[id];
		if ($.inArray(metric.column,M0.getConfig().mls_hide)>-1) continue;
		var new_div = "<div class='info-pill m0-box-div flotr2-"+metric.column+"'>";
		new_div += "<h1>" + metric.name + " " + displayMLSListName(l) + "</h1>";
		new_div += "<div id='"+metric.divid+"_" + l + "' class='m0-box flotr2-"+metric.column+"'></div>";
		new_div += "<p>"+metric.desc+"</p>";
		new_div += "</div>";
		$("#"+div_id).append(new_div);
		M0.basic_lines(metric.divid+'_' + l, mls_file, metric.column , true, metric.name);	
	}

}

function getReportId() {
	var project_data = M0.getProjectData();
	return project_data.date + "_" + project_data.project_name;
}

function getMLSId() {
	return getReportId()+"_mls_lists";
}
	
function displayData(filename) {
	$.getJSON(filename, function(data) {
		$("#mlsFirst").text(data.first_date);
		$("#mlsLast").text(data.last_date);
		$("#mlsMessages").text(data.messages);
		$("#mlsSenders").text(data.people);
	});
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
		var config = M0.getConfig();
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
    	if (form.elements[i].type =="checkbox")
    		form.elements[i].checked = all;
    }
    displayEvoUser(id);
}

function displayEvoUser(id) {	
	$("#"+id).empty();	
    var lists = getUserLists();	
	displayEvoLists(id, lists);    	
}

function displayEvoListSelector(div_id_sel, div_id_mls, lists_file) {
	displayEvoBasicListSelector(div_id_sel, div_id_mls, null, lists_file);
}

function displayBasicListSelector(div_id_sel, div_id_mls, lists_file) {
	displayEvoBasicListSelector(div_id_sel, null, div_id_mls, lists_file);
}

function displayEvoBasicListSelector(div_id_sel, div_id_evo, div_id_basic, lists_file) {
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
			html += 'onClick="';
			if (div_id_evo)
				html += 'MLS.displayEvoUser(\''+div_id_evo+'\');';
			if (div_id_basic)
				html += 'MLS.displayBasicUser(\''+div_id_basic+'\')";';
			html += '" ';
			html += 'id="'+l+'_check" ';
			if ($.inArray(l, user_lists)>-1) html += 'checked ';
			html += '><br>';
		}
		html += '<input type=button value="All" ';
		html += 'onClick="';
		if (div_id_evo)
			html += 'MLS.displayEvoUserAll(\''+div_id_evo+'\',true);';
		if (div_id_basic)
			html += 'MLS.displayBasicUserAll(\''+div_id_basic+'\',true);';
		html += '">';
		html += '<input type=button value="None" ';
		html += 'onClick="';
		if (div_id_evo)
			html += 'MLS.displayEvoUserAll(\''+div_id_evo+'\',false);';
		if (div_id_basic)
			html += 'MLS.displayBasicUserAll(\''+div_id_basic+'\',false);';		
		html += '">';
		html += '<input type=button value="Default" ';
		html += 'onClick="MLS.displayEvoDefault()">';
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

function envisionEvo(list_label, id, history) {
	var V = envision, firstMonth = history.id[0], options, vis;
	var container = document.getElementById(id);
	
	var markers = M0.getMarkers();
	var envision_cfg = M0.getConfig();
			
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