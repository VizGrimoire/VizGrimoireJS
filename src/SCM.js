/* 
 * SCM.js: Library for visualizing Bitergia SCM data
 */

var SCM = {};

(function() {

SCM.displayBasic = displayBasic;
SCM.displayBasicHTML = displayBasicHTML;
SCM.displayBasicMetricHTML = displayBasicMetricHTML;
SCM.displayBubbles = displayBubbles;
SCM.displayData = displayData;
SCM.displayEvo = displayEvo;
SCM.displayTop = displayTop;
SCM.getMetrics = function() {return basic_metrics;};
SCM.getDataFile = function() {return data_file;};
SCM.setData = function(load_data) {data = load_data;};
SCM.getData = function() {return data;};
SCM.getName = function() {return name;};

var name = "scm";
var data_file = 'data/json/scm-milestone0.json';
var data = null;

var basic_metrics = {
	'commits': {
		'divid':"scm-commits",
		'column':"commits",
		'name':"Commits",
		'desc':"Evolution of the number of commits (aggregating branches)",
		'envision': {y_labels: true, show_markers:true}},
	'committers': {
		'divid':"scm-committers",
		'column':"committers",
		'name':"Committers",
		'desc':"Unique committers making changes to the source code",
		'action': "commits",
		'envision': {gtype : 'whiskers'}},
	'authors': {
		'divid':"scm-authors", 
		'column':"authors",
		'name':"Authors",
		'desc':"Unique authors making changes to the source code",
		'action':"commits",
		'envision': {gtype : 'whiskers'}},
	'branches': {
		'divid':"scm-branches", 
		'column':"branches",
		'name':"Branches",
		'desc':"Evolution of the number of branches"},			
	'files': {
		'divid':"scm-files", 
		'column':"files",
		'name':"Files",
		'desc':"Evolution of the number of unique files handled by the community"},
	'repositories': {
		'divid':"scm-repositories", 
		'column':"repositories",
		'name':"Repositories",
		'desc':"Evolution of the number of repositories",
		'envision': {gtype : 'whiskers'}}			
};

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

// Create HTML code to show the metrics
function displayBasicHTML(scm_file, div_target, config) {
	Metric.displayBasicHTML(scm_file, div_target, 'Change sets (commits to source code)', 
			basic_metrics, 'scm_hide', config);
}

function displayBasicMetricHTML(metric_id, scm_file, div_target, config) {
	Metric.displayBasicMetricHTML(basic_metrics[metric_id], scm_file, div_target, config);
}

function displayTop(div, top_file, all, graph) {
	if (all == undefined) all=true;
	Metric.displayTop(div, top_file, basic_metrics, all, graph);
}

function displayBubbles(divid) {
	Metric.displayBubbles(divid, "commits", "committers");
}

function displayBasic(scm_file) {
	basicEvo(SCM.getData());
}

function basicEvo (history) {
	for (var id in basic_metrics) {
		var metric = basic_metrics[id];
		if ($.inArray(metric.column,Report.getConfig().scm_hide)>-1) continue;
		if ($('#'+metric.divid).length)
			Report.displayBasicLines(metric.divid, history, 
					metric.column, true, metric.name);
	}
}
	
function displayEvo (id, scm_file) {
	envisionEvo(id, SCM.getData());
}

function envisionEvo (div_id, history) {
	var config = Report.getConfig();
	var main_metric = "commits";
	var options = Metric.getEnvisionOptions(
			div_id, history, basic_metrics, main_metric, config.scm_hide);
	new envision.templates.Envision_Report(options, [SCM]);
}
})();

Report.registerDataSource(SCM);