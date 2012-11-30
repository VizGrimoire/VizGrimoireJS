/* 
 * Milestone0.js: Library for visualizing Bitergia Milestone 0 Report
 */

var M0 = {};

(function () {
	
	// M0 new public API
	M0.data_load = data_load;
	M0.data_ready = data_ready;
	M0.displayEvoSummary = displayEvoSummary;
	M0.getMarkers = getMarkers;
	M0.getConfig = getConfig;
	M0.getProjectData = getProjectData;
	M0.displayProjectData = displayProjectData;
	M0.displayBasicLines = displayBasicLines;
		
	// M0 old public API
	M0.basic_lines = basic_lines;


	
	// Shared config
	var project_data = {}, markers = {}, config = {}, data_callbacks = [];
	
	function getMarkers() {
		return markers;
	}
	
	function getConfig() {
		return config;
	}
	
	function getProjectData() {
		return project_data;
	}

	function data_ready(callback) {
		data_callbacks.push(callback);
	}

	function data_load(project_file, config_file, markers_file) {
		$.when($.getJSON(project_file), $.getJSON(config_file), $.getJSON(markers_file))
		.done (function(res1, res2, res3) {
			project_data = res1[0];
			config = res2[0];
			markers = res3[0];
			for (var i=0; i<data_callbacks.length; i++) {
				data_callbacks[i]();
			}
		});
	}
	
	// TODO: SCM is supposed to be the most time spread. 
	// TODO: Create a fillHistory method.
	function envisionEvoSummary (id, history, history1, history2) {
		var container = document.getElementById(id);
		
		markers = getMarkers();
		
		var V = envision,  options, vis, 
			firstMonth = history.id[0],
			commits = [history.id, history.commits], 
			authors = [history.id, history.authors], 
			dates = history.date;
	
		var opened_fill = [];
		var closed_fill = [];
		var closers_fill = [];
		var sent_fill = [];
		var senders_fill = [];

		// Fill issues
		for ( var i = 0; i < history.id.length; i++) {
			pos = history1.id.indexOf(history.id[i]);
			if (pos != -1) {
				opened_fill[i] = history1.opened[pos];
				closed_fill[i] = history1.closed[pos];
				closers_fill[i] = history1.closers[pos];

			} else {
				opened_fill[i] = null;
				closed_fill[i] = null;
				closers_fill[i] = null;
			}
		}
		// Fill messages
		for ( var i = 0; i < history.id.length; i++) {
			pos = history2.id.indexOf(history.id[i]);
			if (pos != -1) {
				sent_fill[i] = history2.sent[pos];
				senders_fill[i] = history2.senders[pos];

			} else {
				sent_fill[i] = null;
				senders_fill[i] = null;

			}
		}
		
		var opened = [history.id, opened_fill ], 
		    closed = [history.id, closed_fill ], 
		    closers = [history.id, closers_fill ],
		    sent = [history.id, sent_fill ],
		    senders = [history.id, senders_fill ]	;

		options = {
			container : container,
			data : {
				commits : commits,
				authors : authors,
				opened : opened,
				closed : closed,
				closers : closers,
				sent: sent,
				senders: senders,
				dates : dates,
				summary : commits,
				markers : markers
			},
			trackFormatter : function(
					o) {
				var
				//   index = o.index,
				data = o.series.data, index = data[o.index][0]
						- firstMonth, value;

				value = dates[index]
						+ ":<br> ";
				if (commits[1][index] != null)
					value += commits[1][index]
							+ " commits, ";
				if (authors[1][index] != null)
					value += authors[1][index]
							+ " authors (changes) <br>";
				if (opened[1][index] != null)
					value += opened[1][index]
							+ " open, ";
				if (closed[1][index] != null)
					value += closed[1][index]
							+ " closed, ";
				if (closers[1][index] != null)
					value += closers[1][index]
							+ " closers (tickets)<br>";
				if (sent[1][index] != null)
					value += sent[1][index]
							+ " sent, ";
				if (senders[1][index] != null)
					value += senders[1][index]
							+ " senders (messages)";				
				return value;
			},
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
		// Create the TimeSeries
		vis = new envision.templates.Summary_Milestone0(options);
	}
	
	function displayEvoSummary(id, commits, issues, messages) {	
		$.when($.getJSON(commits), $.getJSON(issues), $.getJSON(messages))
		.done (function(res1, res2, res3) {			
			envisionEvoSummary (id, res1[0], res2[0], res3[0]);
		});
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

		if (labels) {
			graph = Flotr.draw(container, [ line_data ], config);
		} else {
			config.xaxis.showLabels = false;
			config.yaxis.showLabels = false;
			graph = Flotr.draw(container, [ line_data ], config);
		}
	};
	
	function displayProjectData() {
		data = project_data;
		document.title = data.project_name + ' M0 Report by Bitergia';
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
})();
