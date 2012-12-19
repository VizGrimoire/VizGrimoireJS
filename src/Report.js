/* 
 * Report.js: Library for visualizing Bitergia Reports
 */

var Report = {};

(function () {
	
	// Public API
	Report.data_load = data_load;
	Report.data_ready = data_ready;
	Report.getAllMetrics = getAllMetrics;
	Report.getMarkers = getMarkers;
	Report.getConfig = getConfig;
	Report.getGridster = getGridster;
	Report.setGridster = setGridster;
	Report.getProjectData = getProjectData;
	Report.displayProjectData = displayProjectData;
	Report.report = report;
	Report.getDataSources = function () {return data_sources;};
	Report.registerDataSource = function (backend) {data_sources.push(backend);};
		
	// Shared config
	var project_data = {}, markers = {}, config = {}, 
	data_callbacks = [], gridster = {}, data_sources = [];
	
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
	
	function data_load_file(file, fn_data_set) {
		$.when($.getJSON(file))
		.done (function(history) {
			fn_data_set(history);
			end_data_load();
		})
		.fail(function() {
			fn_data_set([]);
			end_data_load();
		});
	}
	
	function data_load_metrics() {
		// TODO: support for adding and removing data sources in Report 
		var data_sources = Report.getDataSources();
		$.each(data_sources, function(i, DS) {
			data_load_file(DS.getDataFile(), DS.setData);
			data_load_file(DS.getGlobalDataFile(), DS.setGlobalData);			
		});
		// TODO: Demographics just for SCM yet!
		data_load_file(SCM.getDemographicsFile(), SCM.setDemographicsData);
	}
	
	function end_data_load() {
		var all = true;
		var data_sources = Report.getDataSources();
		$.each(data_sources, function(index, DS) {
			if (DS.getData() === null) {all = false;return;}
			if (DS.getGlobalData() === null) {all = false;return;}
		});
		// TODO: Demographics just for SCM yet!
		if (SCM.getDemographicsData() === null) {all = false;return;}
		if (!all) return;
		// If all data sources are loaded invoke ready callback 
		for (var i=0; i<data_callbacks.length; i++) {
			data_callbacks[i]();
		}
	}
		
	function getAllMetrics() {
		var all = $.extend({}, SCM.getMetrics(), ITS.getMetrics());
		all = $.extend(all, MLS.getMetrics());
		return all;
	}	
	
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
		        $.each(data_sources, function(i, DS) {
		        	DS.displayData();
		        });
				// This fills refcard
		        Report.displayProjectData('data/json/project-info-milestone0.json');
			});
		} else {
	        Report.displayProjectData('data/json/project-info-milestone0.json');
		}
		
        var show_all = config_metric.top_all;
        
        // flotr2 and top
        $.each(data_sources, function(index, DS) {
	        $.each(DS.getMetrics(), function(i, metric) {
	        	var div_flotr2 = metric.divid+"-flotr2";
	        	if ($("#"+div_flotr2).length > 0)
	        		DS.displayBasicMetricHTML(i,div_flotr2, config_metric);
	        });
	        
	        if ($("#"+DS.getName()+"-flotr2").length > 0) {
	        	if (DS === MLS) {
	                DS.displayBasic(DS.getName()+'-flotr2', 'data/json/mls-lists-milestone0.json', config_metric);
	        	} else {
	        		DS.displayBasicHTML(DS.getName()+'-flotr2',config_metric);
	        	}
	        }

	        if ($("#"+DS.getName()+"-top").length > 0)
	        	DS.displayTop(DS.getName()+'-top','data/json/'+DS.getName()+'-top-milestone0.json',show_all);
	        	$.each(['pie','bars'], function (index, chart) {
		        	if ($("#"+DS.getName()+"-top-"+chart).length > 0)
		        		DS.displayTop(DS.getName()+'-top-'+ chart 
		        				,'data/json/'+DS.getName()+'-top-milestone0.json',show_all,chart);
	        	});
        });
        
        // Envision
        if ($("#all-envision").length > 0)        	
        	Metric.displayEvoSummary ('all-envision');
        $.each(data_sources, function(index, DS) {
        	var div_envision = DS.getName()+"-envision";
        	if ($("#"+div_envision).length > 0)
        		if (DS === MLS) {
        			DS.displayEvoAggregated(div_envision);
        			DS.displayEvo(div_envision+"-lists", 'data/json/'+DS.getName()+'-lists-milestone0.json');
        		} else 	
        			DS.displayEvo(div_envision, 'data/json/'+DS.getName()+'-milestone0.json');
        });
        
        // Time evolution without Envision
        $.each(data_sources, function(index, DS) {
        	var div_time = DS.getName()+"-time-bubbles";
        	if ($("#"+div_time).length > 0)
        		DS.displayBubbles(div_time);
        });
        
        // Radar summaries
        if ($("#radar-activity").length > 0) {
        	Metric.displayRadar ('radar-activity');
        }
        
        if ($("#radar-people").length > 0) {
        }
        
        // Demographics studies: DS-demographics
        $.each(data_sources, function(index, DS) {
        	var div_demog = DS.getName()+"-demographics";
        	if ($("#"+div_demog).length > 0)
        		DS.displayDemographics(div_demog);
        });
        
        // Selectors
        $.each(data_sources, function(index, DS) {
        	var div_selector = DS.getName()+"-selector";
        	var div_envision = DS.getName()+"-envision";
        	var div_flotr2 = DS.getName()+"-flotr2";
        	if ($("#"+div_selector).length > 0)
        		// TODO: Only MLS supported 
        		if (DS === MLS) {
        			div_envision = DS.getName()+"-envision-lists";
        			DS.displayEvoBasicListSelector(div_selector, div_envision, div_flotr2, 
        					'data/json/mls-lists-milestone0.json');
        		}
        });        
	}	
})();
