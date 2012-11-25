/* 
 * SCM.js: Library for visualizing Bitergia SCM data
 */

var SCM = {};

(function() {

SCM.displayBasic = displayBasic;
SCM.displayData = displayData;
SCM.displayEvo = displayEvo;

function displayData(filename) {
	$.getJSON(filename, function(data) {
		$("#scmFirst").text(data.first_date);
		$("#scmLast").text(data.last_date);
		$("#scmCommits").text(data.commits);
		$("#scmFiles").text(data.files);
		$("#scmAuthors").text(data.authors);
		$("#scmCommitters").text(data.committers);
	});
}

function displayBasic(scm_file) {
	$.getJSON(scm_file, function(history) {
		basicEvo(history);
	});
}

function basicEvo (history) {
	M0.displayBasicLines('container_commits', history, "commits", true, "commits");
	M0.displayBasicLines('container_committers', history, "committers", true, "committers");
	M0.displayBasicLines('container_files', history, "files", true, "files");
	M0.displayBasicLines('container_branches', history, "branches", true, "branches");
	M0.displayBasicLines('container_repositories', history, "repositories", true, "repositories");	
}
	
function displayEvo (id, scm_file, markers, config) {
	$.getJSON(scm_file, function(history) {
		envisionEvo(id, history, markers, config);
	});
}

function envisionEvo (id, history, markers, config) {
	var V = envision, firstMonth = history.id[0], 
	commits = [history.id, history.commits ], 
	committers = [history.id, history.committers ], 
	ratio = [history.id, history.ratio ], 
	files = [history.id, history.files ], 
	branches = [history.id, history.branches ], 
	repositories = [history.id, history.repositories ], 
	dates = history.date, 
	container = document.getElementById(id),
	options, vis;

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
			envision_scm_hide: config.scm_hide
		},
		trackFormatter : function(o) {
			var
			//   index = o.index,
			data = o.series.data, index = data[o.index][0]
					- firstMonth, value;

			value = dates[index] + ": ";
			value += commits[1][index] + " commits, ";
			value += committers[1][index] + " committers, <br/> ";
			value += files[1][index]+ " files, ";
			value += branches[1][index] + " branches, ";
			value += repositories[1][index] + " repos";
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
}
})();