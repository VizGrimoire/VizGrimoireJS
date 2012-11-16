/* 
 *  Milestone0.js: Library for visualizing Bitergia Milestone 0 Report
 * 
 */

function displayM0EvoSummary(id, commits, issues, markers) {
	var container = document.getElementById(id);

	$.getJSON(commits,function(history) {
		$.getJSON(issues,function(history1) {
			$.getJSON(markers, function(markers) {
				var V = envision, firstMonth = history.id[0], options, vis, commits = [
						history.id,
						history.commits ], authors = [
						history.id,
						history.authors ], dates = history.date;

				var open_fill = [];
				var close_fill = [];
				var closers_fill = [];

				for ( var i = 0; i < history.id.length; i++) {
					pos = history1.id
							.indexOf(history.id[i]);
					if (pos != -1) {
						open_fill[i] = history1.open[pos];
						close_fill[i] = history1.closed[pos];
						closers_fill[i] = history1.closers[pos];
					} else {
						open_fill[i] = null;
						close_fill[i] = null;
						closers_fill[i] = null;
					}
				}
				var open = [
						history.id,
						open_fill ], close = [
						history.id,
						close_fill ], closers = [
						history.id,
						closers_fill ];

				options = {
					container : container,
					data : {
						commits : commits,
						authors : authors,
						open : open,
						close : close,
						closers : closers,
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
								+ ": ";
						if (commits[1][index] != null)
							value += commits[1][index]
									+ " commits|";
						if (authors[1][index] != null)
							value += authors[1][index]
									+ " authors|";
						if (open[1][index] != null)
							value += open[1][index]
									+ " open|";
						if (close[1][index] != null)
							value += close[1][index]
									+ " closed|";
						if (closers[1][index] != null)
							value += closers[1][index]
									+ " closers";
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
			});
		});
	});
}

function displayM0EvoSCM(id, commits, markers, envision_cfg_file) {

	var container = document.getElementById(id);
	
	$.when($.getJSON(commits),$.getJSON(markers),$.getJSON(envision_cfg_file))
	.done (function(res1, res2, res3) {			
		var history = res1[0], markers = res2[0], envision_cfg = res3[0];

		var V = envision, firstMonth = history.id[0], 
		commits = [history.id, history.commits ], 
		committers = [history.id, history.committers ], 
		ratio = [history.id, history.ratio ], 
		files = [history.id, history.files ], 
		branches = [history.id, history.branches ], 
		repositories = [history.id, history.repositories ], 
		dates = history.date, options, vis;

		options = {
			container : container,
			data : {
				commits : commits,
				committers : committers,
				files : files,
				branches : branches,
				repositories : repositories,
				summary : commits,
				markers : markers,
				dates : dates,
				envision_scm_hide: envision_cfg.scm_hide
			},
			trackFormatter : function(o) {
				var
				//   index = o.index,
				data = o.series.data, index = data[o.index][0]
						- firstMonth, value;

				value = dates[index] + ": ";
				value += commits[1][index]
						+ " commits, ";
				value += committers[1][index]
						+ " committers, <br/> ";
				value += files[1][index]
						+ " files, ";
				value += branches[1][index]
						+ " branches, ";
				value += repositories[1][index]
						+ " repos";

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
		vis = new envision.templates.SCM_Milestone0(options);
	});
}

function displayM0EvoITS(id, issues, markers) {

	var container = document.getElementById(id);

	$.getJSON(issues, function(history) {
		$.getJSON(markers, issues, function(markers) {
			var V = envision, firstMonth = history.id[0], options, vis;

			options = {
				container : container,
				data : {
					summary : [ history.id, history.open ],
					open : [ history.id, history.open ],
					close : [ history.id, history.closed ],
					change : [ history.id, history.changed ],
					openers : [ history.id, history.openers ],
					closers : [ history.id, history.closers ],
					changers : [ history.id, history.changers ],
					markers : markers,
					dates : history.date
				},
				trackFormatter : function(o) {
					var
					//   index = o.index,
					data = o.series.data, index = data[o.index][0]
							- firstMonth, value;

					value = history.date[index] + ": ";
					value += history.closed[index] + " closed, ";
					value += history.open[index] + " opened, ";
					value += history.changed[index] + " changed";
					value += "<br/>" + history.closers[index]
							+ " closers, ";
					value += history.openers[index] + " openers, ";
					value += history.changers[index] + " changers";

					return value;
				},
				xTickFormatter : function(index) {
					var label = history.date[index - firstMonth];
					if (label === "0") label = "";
					return label;
					// return Math.floor(index/12) + '';
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
			vis = new envision.templates.ITS_Milestone0(options);
		});
	});
}

// http:__lists.webkit.org_pipermail_squirrelfish-dev_
function displayMLSListName(listinfo) {
	var list_name_tokens = listinfo.split("_");
	var list_name = list_name_tokens[list_name_tokens.length - 1];
	if (list_name === "")
		list_name = list_name_tokens[list_name_tokens.length - 2];
	return list_name;
}

function displayM0BasicMLS(div_id, lists_file) {

	$.getJSON(lists_file, function(history) {
		lists = history.mailing_list;
		if (typeof lists === 'string') {
			file_messages = "data/json/mls-";
			file_messages += lists;
			file_messages += "-milestone0.json";
			displayM0BasicMLSList(div_id, lists, file_messages);
			return;
		}

		for ( var i = 0; i < lists.length; i++) {
			var l = lists[i];
			file_messages = "data/json/mls-";
			file_messages += l;
			file_messages += "-milestone0.json";
			displayM0BasicMLSList(div_id, l, file_messages);
		}
		;
	});
}

function displayM0BasicMLSList(div_id, l, file_messages) {
	var container = document.getElementById(div_id);

	// Sent div for mailing list    		    		
	var new_div = "<div class='info-pill m0-box-div'>";
	new_div += "<h1>Messages sent " + displayMLSListName(l) + "</h1>";
	new_div += "<div id='container_messages_" + l + "' class='m0-box'></div>";
	new_div += "<p>Evolution in the number of messages</p>";
	new_div += "</div>";
	container.innerHTML += new_div;
	basic_lines('container_messages_' + l, file_messages, "sent", 1, "sent");

	// Senders div for mailing list    		    		
	var new_div = "<div class='info-pill m0-box-div'>";
	new_div += "<h1>Senders " + displayMLSListName(l) + "</h1>";
	new_div += "<div id='container_senders_" + l + "' class='m0-box'></div>";
	new_div += "<p>Evolution in the number of senders</p>";
	new_div += "</div>";
	container.innerHTML += new_div;
	basic_lines('container_senders_' + l, file_messages, "senders", 1,
			"senders");
}

function displayM0EvoMLS(id, lists_file, markers) {

	var container = document.getElementById(id);

	$.getJSON(lists_file, function(history) {
		lists = history.mailing_list
		if (typeof lists === 'string') {
			file_messages = "data/json/mls-";
			file_messages += lists;
			file_messages += "-milestone0.json";
			displayM0EvoMLSList(id, file_messages, markers,
					displayMLSListName(lists));
			return;
		}
		for ( var i = 0; i < lists.length; i++) {
			var l = lists[i];
			file_messages = "data/json/mls-";
			file_messages += l;
			file_messages += "-milestone0.json";
			displayM0EvoMLSList(id, file_messages, markers,
					displayMLSListName(l));
		}

	});
}

function displayM0EvoMLSList(id, messages, markers, list_label) {

	var container = document.getElementById(id);

	$.getJSON(messages, function(history) {
		$.getJSON(markers, function(markers) {
			var V = envision, firstMonth = history.id[0], options, vis;

			options = {
				container : container,
				data : {
					summary : [ history.id, history.sent ],
					sent : [ history.id, history.sent ],
					senders : [ history.id, history.senders ],
					markers : markers,
					list_label : list_label,
					dates : history.date
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
		});
	});
}

function basic_lines(div_id, json_file, column, labels, title) {
	$.getJSON(json_file, function(history) {

		var line_data = [];
		container = document.getElementById(div_id);

		for ( var i = 0; i < history[column].length; i++) {
			line_data[i] = [ i, parseInt(history[column][i]) ];
		}

		var graph;

		// Draw Graph
		if (labels) {
			graph = Flotr.draw(container, [ line_data ], {
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
			});
		} else {
			graph = Flotr.draw(container, [ line_data ], {
				xaxis : {
					//minorTickFreq: 4,
					showLabels : false,
				},
				yaxis : {
					showLabels : false,
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
			});

		}
	});
};

function time_to_fix_graph(div_id, json_file, column, labels, title) {
	$.getJSON(json_file, function(history) {
		var line_data = [];
		container = document.getElementById(div_id);

		for ( var i = 0; i < history.data[column].length; i++) {
			line_data[i] = [ i, parseInt(history.data[column][i]) ];
		}

		var graph;

		graph = Flotr.draw(container, [ line_data ], {
			title : title,
			xaxis : {
				minorTickFreq : 4,
				tickFormatter : function(x) {
					if (history.data.date) {
						x = history.data.date[parseInt(x)];
					}
					return x;
				}
			},
			yaxis : {
				minorTickFreq : 5,
				tickFormatter : function(y) {
					return parseInt(y / (24)) + 'd';
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
					var text = history.data.date[parseInt(o.x)] + ": "
							+ parseInt(o.y) + " h";
					text += " ( " + parseInt(o.y / (24)) + " days)";
					return text;
				}
			}
		});
	});
};

function displayProjectData(filename) {
	$.getJSON(filename, function(data) {
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

	});
}

function displaySCMData(filename) {
	$.getJSON(filename, function(data) {
		$("#scmFirst").text(data.first_date);
		$("#scmLast").text(data.last_date);
		$("#scmCommits").text(data.commits);
		$("#scmFiles").text(data.files);
		$("#scmAuthors").text(data.authors);
		$("#scmCommitters").text(data.committers);
	});
}

function displayITSData(filename) {
	$.getJSON(filename, function(data) {
		$("#itsFirst").text(data.first_date);
		$("#itsLast").text(data.last_date);
		$("#itsTickets").text(data.tickets);
		$("#itsOpeners").text(data.openers);
	});
}

function displayMLSData(filename) {
	$.getJSON(filename, function(data) {
		$("#mlsFirst").text(data.first_date);
		$("#mlsLast").text(data.last_date);
		$("#mlsMessages").text(data.messages);
		$("#mlsSenders").text(data.people);
	});
}
