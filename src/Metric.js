/* 
 * Metric.js: Library for visualizing Bitergia Metric shared data and logic
 */

var Metric = {};

(function() {
	
Metric.displayTop = displayTop;
Metric.displayBasicHTML = displayBasicHTML;
Metric.displayBasicMetricHTML = displayBasicMetricHTML;
Metric.displayBubbles = displayBubbles;
Metric.displayDemographics = displayDemographics;
Metric.getEnvisionDefaultsGraph = getEnvisionDefaultsGraph;
Metric.getEnvisionOptions = getEnvisionOptions;
Metric.checkBasicConfig = checkBasicConfig;
Metric.mergeConfig = mergeConfig;
Metric.displayGridMetric = displayGridMetric;
Metric.displayGridMetricSelector = displayGridMetricSelector;
Metric.displayGridMetricAll = displayGridMetricAll;
// Working fixing gridster issue: redmine issue 991
Metric.gridster_debug = gridster_debug;

var gridster_debug = false;

function mergeConfig(config1, config2)
{
	var new_config = {};
	for (entry in config1) new_config[entry] = config1[entry];
	for (entry in config2) new_config[entry] = config2[entry];
	return new_config;
}

function findMetricDoer(history, metric) {
	for (var field in history) {
		if (field != metric) return field;
	}
}

function hideEmail(email) {
	var clean = email;
	if (email.indexOf("@")>-1) {
		clean = email.split('@')[0];
	}
	return clean;		
}

function displayTopMetric(div_id, metric, metric_period, history, graph) {
	var top_metric_id = metric.column;
	var metric_id = metric.action;
	var doer = findMetricDoer(history, metric_id);
	var div_graph = '';
	var new_div = '';	
	new_div += "<div class='info-pill'>";
	new_div += "<h1>Top " + top_metric_id + " " + metric_period + " </h1>";
	if (graph) {
		div_graph = "top-"+graph+"-"+metric_id+"-"+metric_period;
		new_div += "<div id='"+div_graph+"' class='graph' style='float:right'></div>";		
	}
	new_div += "<table><tbody>";
	// new_div += "<tr><th>"+doer+"</th><th>"+metric_id+"</th></tr>";
	new_div += "<tr><th></th><th>"+metric_id+"</th></tr>";
	for (var i=0; i<history[metric_id].length; i++) {
		var metric_value = history[metric_id][i];
		var doer_value = history[doer][i];
		new_div += "<tr><td>"+hideEmail(doer_value)+"</td><td>"+metric_value+"</td></tr>";
	}
	new_div += "</tbody></table>";
	new_div += "</div>";
	
	var div = $("#"+div_id);
	div.append(new_div);
	if (graph) displayBasicChart(div_graph, history[doer], history[metric_id], graph);
}

// TODO: Move basic lines here also
function displayBasicChart(divid, labels, data, graph) {

	var container = document.getElementById(divid);
	// var container_legend = document.getElementById(divid+"-legend");
	var chart_data = [];

	for (var i=0; i<labels.length;i++) {
		chart_data.push({data: [[i,data[i]]], label:hideEmail(labels[i])});
	}
				
	var config = {
	    grid : {
		      verticalLines : false,
		      horizontalLines : false,
		      outlineWidth: 0,  
		    },
	    xaxis : { showLabels : false },
	    yaxis : { showLabels : false },
		mouse : {
			track : true,			
			trackFormatter : function(o) {
				return hideEmail(labels[parseInt(o.x)]) + ": "
				+ data[parseInt(o.x)];}
		},
		legend : {
			show: false,
			position : 'se',
			backgroundColor : '#D2E8FF',
			// container: container_legend
		}
	};
	
	if (graph === "bars") {
		config.bars = {show : true};
		config.grid.horizontalLines = true;
		config.yaxis = { showLabels : true};
	}
	if (graph === "pie") config.pie = {show : true};
	
	graph = Flotr.draw(container, chart_data, config); 
}

function getDSMetric(metric_id) {
	var ds = null;
	$.each(Report.getDataSources(), function(index, DS) {
        $.each(DS.getMetrics(), function(i, metric) {
        	if (i === metric_id) ds = DS;
        });
	});
	return ds;
}

// The two metrics should be from the same data source
function displayBubbles(divid, metric1, metric2) {

	var container = document.getElementById(divid);
	
	var DS = getDSMetric(metric1);
	var DS1 = getDSMetric(metric2);
	
	var bdata = [];
	
	if (DS != DS1) {
		alert("Metrics for bubbles have different data sources");
		return;
	}
	
	var data = DS.getData();
	
	for (var i=0; i<data.id.length;i++) {
		bdata.push([data.id[i], data[metric1][i], data[metric2][i]]);
	}
	
	var config = {
		    bubbles : { show : true, baseRadius : 5 },
		    mouse: {
	    		track:true,
	    		trackFormatter: function(o) {
	    			var value = data.date[o.index]+": "; 
	    			value += data[metric1][o.index] + " " + metric1 + ","; 
	    			value += data[metric2][o.index] + " " + metric2 + ",";
	    			return value;
	    		} 
		    },
		    xaxis : { tickFormatter : function(o) {
		    	return data.date[parseInt(o)-data.id[0]];}},
	};
		
	if (DS.getName() === "its") $.extend(config.bubbles, {baseRadius: 2});

	Flotr.draw(container, [bdata], config);
}

function displayDemographics(divid, ds, year) {
	var container = document.getElementById(divid);
		
	var data = DS.getDemographics();
	
//	for (var i=0; i<data.id.length;i++) {
//		bdata.push([data.id[i], data[metric1][i], data[metric2][i]]);
//	}
//	
//	var config = {
//		    bubbles : { show : true, baseRadius : 5 },
//		    mouse: {
//	    		track:true,
//	    		trackFormatter: function(o) {
//	    			var value = data.date[o.index]+": "; 
//	    			value += data[metric1][o.index] + " " + metric1 + ","; 
//	    			value += data[metric2][o.index] + " " + metric2 + ",";
//	    			return value;
//	    		} 
//		    },
//		    xaxis : { tickFormatter : function(o) {
//		    	return data.date[parseInt(o)-data.id[0]];}},
//	};
//		
//	if (DS.getName() === "its") $.extend(config.bubbles, {baseRadius: 2});
//
//	Flotr.draw(container, [bdata], config);	
}


// Each metric can have several top: metric.period
// For example: "committers.all":{"commits":[5310, ...],"name":["Brion Vibber",..]}
function displayTop(div, top_file, basic_metrics, all, graph) {
	if (all == undefined) all = true;
	$.getJSON(top_file, function(history) {
		for (key in history) {
			// ex: commits.all
			var data = key.split(".");
			var top_metric = data[0];
			var top_period = data[1]; 
			for (var id in basic_metrics) {
				var metric = basic_metrics[id];
					if (metric.column == top_metric) {
						displayTopMetric(div, metric, top_period, history[key], graph);
						if (!all) return;
					break;
				} 
			}
		}
	});
}

function getDefaultsMarkers (option, markers, dates) {
    var mark = "";
    for (var i=0; i<markers.date.length; i++) {
        if (markers.date[i] == dates[option.index]) {
            mark = markers.marks[i];
            }
    }
    return mark;
} 

function getEnvisionDefaultsGraph (name, gconfig) {
	var graph = {
	    name : name,
	    config : {
	      colors: gconfig.colors,
	      mouse : {
	        track: true,
	        trackY: false,
	        position: 'ne'
	      },
	      yaxis : {
	    	  autoscale : true,  
	      },
	      legend : {
	          backgroundColor : '#FFFFFF', // A light blue background color
	          backgroundOpacity: 0,
	      },
	    }
	};
	
	if (gconfig.gtype==="whiskers")
		graph.config['whiskers'] = {show : true, lineWidth : 2}; 
	else 
		graph.config['lite-lines'] = {          
	        lineWidth : 1,
	        show : true,
	        fill : true,
	        fillOpacity : 0.5,
	      };		
	
	if (gconfig.y_labels) graph.config.yaxis = {showLabels : true};
	
	if (gconfig.show_markers)
		graph.config.markers = {
	        show: true,
	        position: 'ct',
	        labelFormatter: function (o) {
	            return getDefaultsMarkers (o, gconfig.markers, gconfig.dates);
	        }
		};	
	return graph;
}

function getEnvisionOptions (div_id, history, basic_metrics, main_metric, hide) {
	
	var firstMonth = history.id[0], 
	dates = history.date, 
	container = document.getElementById(div_id),
	options;
	var markers = Report.getMarkers();
		
	options = {
			container : container,
			xTickFormatter : function(index) {
				var label = dates[index - firstMonth];
				if (label === "0") label = "";
				return label;
			},
			yTickFormatter : function(n) {
				return n + '';
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

	options.data = {
			summary : [history.id, history[main_metric]],
			markers : markers,
			dates : dates,
			envision_hide: hide,
			main_metric: main_metric		
	};
	
	for (var id in basic_metrics) {
		options.data[id] = [history.id, history[id]];
	}
	
	options.trackFormatter = function(o) {
		var data = o.series.data, index = data[o.index][0]- firstMonth, value;

		value = dates[index] + ":<br>";
		
		var i = 0;
		for (var id in basic_metrics) {
			value += options.data[id][1][index] + " " + id + ", ";
			if (++i % 3 == 0) value += "<br>";
		}

		return value;
	};

	return options;		
}


function checkBasicConfig(config) {
	if (config == undefined) config = {};
	if (config.show_desc == undefined) config.show_desc = true;
	if (config.show_title == undefined) config.show_title = true;
	if (config.show_labels == undefined) config.show_labels = true;	
	return config;
}

function displayBasicHTML(data_file, div_target, title, basic_metrics, hide, config) {
	config = checkBasicConfig(config);	
	$.getJSON(data_file, function(history) {
		var new_div = '<div class="info-pill">';
		new_div += '<h1>'+title+'</h1></div>';
		$("#"+div_target).append(new_div);
		for (var id in basic_metrics) {
			var metric = basic_metrics[id];
			var title_metric = metric.name;
			if (!config.show_title) title_metric='';
			if ($.inArray(metric.column,Report.getConfig()[hide])>-1) continue;
			new_div = '<div id="flotr2_'+metric.column+'" class="info-pill m0-box-div">';
			new_div += '<h1>'+metric.name+'</h1>';
			new_div += '<div class ="m0-box" id="'+metric.divid+'"></div>' ;
			if (config.show_desc==true)
				new_div += '<p>'+metric.desc+'</p>';
			new_div += '</div>' ;
			$("#"+div_target).append(new_div);
			Report.displayBasicLines(metric.divid, history, 
					metric.column, config.show_labels, title_metric);
		}
	});
}

function displayBasicMetricHTML(metric, data_file, div_target, config) {
	config = checkBasicConfig(config);	
	var title = metric.name;
	if (!config.show_title) title='';
	$.getJSON(data_file, function(history) { 
		var new_div = '<div class="info-pill">';
		$("#"+div_target).append(new_div);
		new_div = '<div id="flotr2_'+metric.column+'" class="info-pill m0-box-div">';
		new_div += '<h1>'+metric.name+'</h1>';
		new_div += '<div style="height:100px" id="'+metric.divid+'"></div>' ;
		if (config.show_desc==true)
			new_div += '<p>'+metric.desc+'</p>';
		new_div += '</div>' ;
		$("#"+div_target).append(new_div);
		Report.displayBasicLines(metric.divid, history, metric.column, config.show_labels, title);
	});
}


function displayGridMetric(metric_id, config) {
	var gridster = Report.getGridster();
	var metric = Report.getAllMetrics()[metric_id];
	var size_x = 1, size_y = 1, col = 2, row = 1;
	var silent = true;
	
	if (config) {
		size_x = config.size_x, size_y = config.size_y, 
		col = config.col, row = config.row;
	}

	var divid = metric.divid+"_grid";
	if ($("#"+metric_id+"_check").is(':checked')) {
		if ($("#"+divid).length === 0) {
			gridster.add_widget( "<div id='"+divid+"'></div>", size_x, size_y, col, row);
			// gridster.add_widget( "<div id='"+divid+"'></div>", size_x, size_y);
			Report.drawMetric(metric_id, divid);
		}
	} else {
		if ($("#"+divid).length > 0) {
			if (Metric.gridster_debug) silent = false;
			gridster.remove_widget($("#"+divid), silent);
		}
	}
}

function displayGridMetricAll(state) {
	var columns = 3;
	var form = document.getElementById('form_metric_selector');
	var config = {
			size_x:1, size_y:1, col: 2, row:0
	};
    for ( var i = 0; i < form.elements.length; i++) {
    	if (form.elements[i].type =="checkbox") {
    		form.elements[i].checked = state;
    		if (i%columns==0) {config.row++; config.col=2;}
    		displayGridMetric(form.elements[i].value,config);
    		config.col++;
    	}
    }
}

function displayGridMetricDefault() {
}

function displayGridMetricSelector(div_id) {
	var metrics = Report.getAllMetrics();
	// var metrics = MLS.getMetrics();
	var html = "Metrics Selector:";
	html += "<form id='form_metric_selector'>";
	
	for (metric_id in metrics) {
		html += '<input type=checkbox name="check_list" value="'+metric_id+'" ';
		html += 'onClick="';
		html += 'Metric.displayGridMetric(\''+metric_id+'\');';
		html += '" ';
		html += 'id="'+metric_id+'_check" ';
		// if ($.inArray(l, user_lists)>-1) html += 'checked ';
		html += '>';
		html += metric_id;
		html += '<br>';
	}
	html += '<input type=button value="All" ';
	html += 'onClick="Metric.displayGridMetricAll('+true+')">';
	html += '<input type=button value="None" ';
	html += 'onClick="Metric.displayGridMetricAll('+false+')">';
	//html += '<input type=button value="Default" ';
	//html += 'onClick="Metric.displayGridMetricDefault()">';
	html += "</form>";
	$("#"+div_id).html(html);
}

})();