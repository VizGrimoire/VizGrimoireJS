/* 
 * Report.js: Library for visualizing Bitergia Reports
 */

var Report = {};

(function () {
	
	// Public API
	Report.data_load = data_load;
	Report.data_ready = data_ready;
	Report.displayEvoSummary = displayEvoSummary;
	Report.displayEvoSummarySM = displayEvoSummarySM;
	Report.getAllMetrics = getAllMetrics;
	Report.getMarkers = getMarkers;
	Report.getConfig = getConfig;
	Report.getGridster = getGridster;
	Report.setGridster = setGridster;
	Report.getProjectData = getProjectData;
	Report.displayProjectData = displayProjectData;
	Report.displayBasicLines = displayBasicLines;
	Report.drawMetric = drawMetric;
	Report.report = report;
	Report.getDataSources = function () {return data_sources;};
	Report.registerDataSource = function (name, backend) {data_sources[name] = backend;};
		
	// Old public API
	Report.basic_lines = basic_lines;
	
	// Shared config
	var project_data = {}, markers = {}, config = {}, 
	data_callbacks = [], gridster = {}, data_sources = {};
	
	function getMarkers() {
		return markers;
	}
	
	function getConfig() {
		return config;
	}
	
	function getGridster() {
		return gridster;
	}
	
	function setGridster(grid) {
		gridster = grid;
	}
	
	
	function getProjectData() {
		return project_data;
	}

	function data_ready(callback) {
		data_callbacks.push(callback);
	}

	function data_load() {
		var project_file = "data/json/project-info-milestone0.json", 
		config_file = "data/json/viz_cfg.json", 
		markers_file = "data/json/markers.json";

		$.when($.getJSON(project_file), $.getJSON(config_file), $.getJSON(markers_file))
		.done (function(res1, res2, res3) {
			project_data = res1[0];
			config = res2[0];
			markers = res3[0];
			data_load_metrics();
		});		
		end_data_load();
	}
	
	function data_load_metrics() {
		// TODO: support for adding and removing data sources in Report 
		var data_sources = Report.getDataSources();
		$.each(data_sources, function(ds_name, DS) {
			$.when($.getJSON(DS.getDataFile()))
			.done (function(history) {
				DS.setData(history);
				end_data_load();
			})
			.fail(function() {
				DS.setData([]);
				end_data_load();
			});
			
		});
	}
	
	function end_data_load() {
		var all = true;
		var data_sources = Report.getDataSources();
		$.each(data_sources, function(ds_name, DS) {
			if (DS.getData() === null) all = false;
		});
		if (!all) return;
		// If all data sources are loaded invoke ready callback 
		for (var i=0; i<data_callbacks.length; i++) {
			data_callbacks[i]();
		}
	}
	
	
	function fillHistory(hist_complete_id, hist_partial) {
		
		// [ids, values]
		var new_history = [[],[]];
		for (var i = 0; i < hist_complete_id.length; i++) {
			pos = hist_partial[0].indexOf(hist_complete_id[i]);
			new_history[0][i] = hist_complete_id[i];
			if (pos != -1) {
				new_history[1][i] = hist_partial[1][pos];
			} else {
				new_history[1][i] = 0;
			}
		}
		return new_history;
	}
	
	function getAllMetrics() {
		var all = $.extend({}, SCM.getMetrics(), ITS.getMetrics());
		all = $.extend(all, MLS.getMetrics());
		return all;
	}
	
	function drawMetric(metric_id, divid) {		
        var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
		
		var list_metrics = SCM.getMetrics();
		for (metric in list_metrics) {
			if  (list_metrics[metric].column === metric_id) {
	            SCM.displayBasicMetricHTML(list_metrics[metric].column,'data/json/scm-milestone0.json',divid, config_metric);
	            return;
			}
		}
		
		list_metrics = ITS.getMetrics();
		for (metric in list_metrics) {
			if  (list_metrics[metric].column === metric_id) {
	            ITS.displayBasicMetricHTML(list_metrics[metric].column,'data/json/its-milestone0.json',divid, config_metric);
	            return;
			}
		}
		
		list_metrics = MLS.getMetrics();
		for (metric in list_metrics) {
			if  (list_metrics[metric].column === metric_id) {
	            MLS.displayBasicMetricHTML(list_metrics[metric].column,'data/json/mls-milestone0.json',divid, config_metric);
	            return;
			}
		}		
	}
	
	function envisionEvoSummary (div_id, scm_data, its_data, mls_data) {
		var container = document.getElementById(div_id);		
		var full_history_id = [], dates = [];
		
		if (scm_data.length === 0) scm_data = null;
		if (its_data.length === 0) its_data = null;
		if (mls_data.length === 0) mls_data = null;
		
		if (scm_data) {
			full_history_id = scm_data.id;
			dates = scm_data.date;
		} 
		if (its_data && its_data.id.length>full_history_id.length) {			
			full_history_id = its_data.id;
			dates = its_data.date;
		}
		if (mls_data && mls_data.id.length>full_history_id.length)  {
			full_history_id = mls_data.id;
			dates = mls_data.date;
		}
		
		markers = getMarkers();
		
		var V = envision,  options, vis, 
			firstMonth = full_history_id[0];
		
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
						min : full_history_id[0],
						max : full_history_id[full_history_id.length - 1]
					}
				}
			}
		};

		var main_metric = "", main_matric_data = [];
		if (scm_data) {
			main_metric = "commits";
			main_matric_data = scm_data[main_metric];
		}
		else if (its_data) {
			main_metric = "opened";
			main_matric_data = its_data[main_metric];
		}
		else if (mls_data) {
			main_metric = "sent";
			main_matric_data = mls_data[main_metric];
		} else {
			alert('No data for Summary viz');
		}
			
		
		var hide = getConfig().summary_hide;
		options.data = {
				summary : [full_history_id, main_matric_data],
				markers : markers,
				dates : dates,
				envision_hide: hide,
				main_metric: main_metric		
		};
		
		var all_metrics = {};
		if (scm_data) {all_metrics = $.extend(all_metrics, SCM.getMetrics());}
		if (its_data) {all_metrics = $.extend(all_metrics, ITS.getMetrics());}
		if (mls_data) {all_metrics = $.extend(all_metrics, MLS.getMetrics());}
				
		for (var id in all_metrics) {
			if (scm_data && scm_data[id])
				options.data[id] = fillHistory(full_history_id,[scm_data.id, scm_data[id]]);
			else if (its_data && its_data[id])
				options.data[id] = fillHistory(full_history_id,[its_data.id, its_data[id]]);
			else if (mls_data && mls_data[id])
				options.data[id] = fillHistory(full_history_id,[mls_data.id, mls_data[id]]);
		}
		
		options.trackFormatter = function(o) {
			var data = o.series.data, index = data[o.index][0]- firstMonth, value;

			value = dates[index] + ":<br>";
			
			var i = 0;
			for (var id in all_metrics) {
				value += options.data[id][1][index] + " " + id + ", ";
				if (++i % 3 == 0) value += "<br>";
			}

			return value;
		};
	
		// Create the TimeSeries
		vis = new envision.templates.Envision_Report(options, Report.getDataSources());
	}

	function displayEvoSummarySM(id, commits, messages) {	
			envisionEvoSummary (id, SCM.getData(), null, MLS.getData());
	}
	
	function displayEvoSummary(id) {
			envisionEvoSummary (id, SCM.getData(), ITS.getData(), MLS.getData());
	}
	
	function basic_lines(div_id, json_file, column, labels, title) {
		$.getJSON(json_file, function(history) {
			displayBasicLines (div_id, history, column, labels, title);
		});
	}
	
			
	function displayBasicLines (div_id, history, column, labels, title) {
		var line_data = [];
		container = document.getElementById(div_id);
		
		// if ($('#'+div_id).is (':visible')) return;

		for ( var i = 0; i < history[column].length; i++) {
			line_data[i] = [ i, parseInt(history[column][i]) ];
		}
		
		var config = {
				title : title,
				xaxis : {
					minorTickFreq : 4,
					tickFormatter : function(x) {
						if (history.date) {
							x = history.date[parseInt(x)];
						}
						return x;
					}
				},
				yaxis : {
					minorTickFreq : 1000,
					tickFormatter : function(y) {
						return parseInt(y) + "";
					}
				},

				grid : {
					show : false,
				// minorVerticalLines: true
				},
				mouse : {
					track : true,
					trackY : false,
					trackFormatter : function(o) {
						return history.date[parseInt(o.x)] + ": "
								+ parseInt(o.y);
					}
				}
		};

		if (!labels || labels==0) {
			config.xaxis.showLabels = false;
			config.yaxis.showLabels = false;
		}
		graph = Flotr.draw(container, [ line_data ], config);
	};
	
	function displayProjectData() {
		data = project_data;
		document.title = data.project_name + ' Report by Bitergia';
		$(".report_date").text(data.date);
		$(".project_name").text(data.project_name);
		$("#project_url").attr("href", data.project_url);
		$('#scm_type').text('git');
		$('#scm_url').attr("href", data.scm_url);
		$('#scm_name').text(data.scm_name);
		$('#its_type').text(data.its_type);
		$('#its_url').attr("href", data.its_url);
		$('#its_name').text(data.its_name);
		$('#mls_type').text(data.mls_type);
		$('#mls_url').attr("href", data.mls_url);
		$('#mls_name').text(data.mls_name);
		var str = data.scm_url;
		if (!str || str.length === 0) {
			$('.source_info').hide();
		}
		var str = data.its_url;
		if (!str || str.length === 0) {
			$('.tickets_info').hide();
		}
		var str = data.mls_url;
		if (!str || str.length === 0) {
			$('.mls_info').hide();
		}
		var str = data.blog_url;
		if (str && str.length > 0) {
			$('#blogEntry').html(
					"<br><a href='" + str
							+ "'>Blog post with some more details</a>");
			$('.blog_url').attr("href", data.blog_url);
		} else {
			$('#more_info').hide();
		}
		str = data.producer;
		if (str && str.length > 0) {
			$('#producer').html(str);
		} else {
			$('#producer').html("<a href='http://bitergia.com'>Bitergia</a>");
		}
	}
		
	function report(config) {		
		// TODO: support for adding and removing data sources in Report 
		var data_sources = Report.getDataSources();
		
		var config_metric = {};
        config_metric.show_desc = false;
        config_metric.show_title = false;
        config_metric.show_labels = true;
        config_metric.top_all = false;
        
		if (config) {
			$.each(config, function(key, value) {config_metric[key] = value;});
		}
				
        if ($("#navigation").length > 0) {
			$.get("navigation.html", function(navigation) {
				$("#navigation").html(navigation);
			});
        }
		
        // Reference card with info from all data sources
		if ($("#refcard").length > 0) {
			$.get("refcard.html", function(refcard) {
				$("#refcard").html(refcard);
		        $.each(data_sources, function(ds_name, DS) {
		        	DS.displayData('data/json/'+ds_name+'-info-milestone0.json');
		        });
				// This fills refcard
		        Report.displayProjectData('data/json/project-info-milestone0.json');
			});
		} else {
	        Report.displayProjectData('data/json/project-info-milestone0.json');
		}
		
        var show_all = config_metric.top_all;
        
        // flotr2 and top
        $.each(data_sources, function(ds_name, DS) {
	        $.each(DS.getMetrics(), function(i, metric) {
	        	var div_flotr2 = metric.divid+"-flotr2";
	        	if ($("#"+div_flotr2).length > 0)
	        		DS.displayBasicMetricHTML(i,'data/json/'+ds_name+'-milestone0.json',div_flotr2, config_metric);
	        });
	        
	        if ($("#"+ds_name+"-flotr2").length > 0) {
	        	if (DS === MLS) {
	                DS.displayBasic(ds_name+'-flotr2', 'data/json/mls-lists-milestone0.json', config_metric);
	        	} else {
	        		DS.displayBasicHTML('data/json/'+ds_name+'-milestone0.json',ds_name+'-flotr2',config_metric);
	        	}
	        }

	        if ($("#"+ds_name+"-top").length > 0)
	        	DS.displayTop(ds_name+'-top','data/json/'+ds_name+'-top-milestone0.json',show_all);
	        if ($("#"+ds_name+"-top-pie").length > 0)
	        	DS.displayTop(ds_name+'-top-pie','data/json/'+ds_name+'-top-milestone0.json',show_all,true);
        });
        
        // Envision
        if ($("#all-envision").length > 0)        	
        	Report.displayEvoSummary ('all-envision');
        $.each(data_sources, function(ds_name, DS) {
        	var div_envision = ds_name+"-envision";
        	if ($("#"+div_envision).length > 0)
        		if (DS === MLS) {
        			DS.displayEvoAggregated(div_envision);
        			DS.displayEvo(div_envision+"-lists", 'data/json/'+ds_name+'-lists-milestone0.json');
        		} else 	
        			DS.displayEvo(div_envision, 'data/json/'+ds_name+'-milestone0.json');
        });
        
        // Selectors
        $.each(data_sources, function(ds_name, DS) {
        	var div_selector = ds_name+"-selector";
        	var div_envision = ds_name+"-envision";
        	var div_flotr2 = ds_name+"-flotr2";
        	if ($("#"+div_selector).length > 0)
        		// TODO: Only MLS supported 
        		if (DS === MLS) {
        			div_envision = ds_name+"-envision-lists";
        			DS.displayEvoBasicListSelector(div_selector, div_envision, div_flotr2, 
        					'data/json/mls-lists-milestone0.json');
        		}
        });        
	}	
})();
