var http = require('http');
var querystring = require('querystring');
var url = require('url');

var mysql = require('mysql');
var connection = mysql.createConnection({
	user : 'root',
	password : '',
	database : 'acs_cvsanaly_webkit'
});


var commits_ts_sql = "" +
		"select m.id as id, "+
        "m.year as year, "+
        "m.month as month, "+
        "DATE_FORMAT(m.date, '%b %Y') as date, "+
        "IFNULL(pm.commits, 0) as commits "+
		"from   months m "+
		"left join ("+
        "select year(s.date) as year, "+ 
        "       month(s.date) as month, "+ 
        "       count(distinct(s.id)) as commits "+
        "from   scmlog s "+
        "group by year(s.date), "+
        "      month(s.date) "+
        "order by year(s.date), "+
        "       month(s.date) ) as pm "+
        "       on ("+
        "m.year = pm.year and "+
        "m.month = pm.month);";

connection.connect();

function toBitergiaJSON(rows) {
	var data = {id:[],date:[],commits:[]};
	for (var i =0; i<rows.length; i++) {
		data.id.push(rows[i].id);
		data.date.push(rows[i].date);
		data.commits.push(rows[i].commits);
	}
	return data;
}

http.createServer(
		function(req, res) {
			var total_changes;
			var url_parts = url.parse(req.url, true);
			var query = url_parts.path;
			console.log('Getting: ' + query + ' from ' + 
			        req.connection.remoteAddress);
			var query = url_parts.query;
			if (query.callback) {
				res.writeHead(200, {
					'Content-Type' : 'application/javascript'
				});
			}
			else {
				res.writeHead(200, {
					'Content-Type' : 'application/json'
				});
			}
			// connection.query('SELECT COUNT(*) as total from changes', function(
			connection.query(commits_ts_sql, function(
					err, rows, fields) {
				if (err)
					throw err;
				total_changes = rows[0].total;
				var data = {
					'total_changes' : total_changes
				};
				if (query.callback)
					res.end(query.callback + '(' +JSON.stringify(toBitergiaJSON(rows)) + ')');
				else
					res.end(JSON.stringify(toBitergiaJSON(rows)));
			});
		}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
