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
	"SELECT m.id AS id, m.year AS year, m.month AS month, "+
    "DATE_FORMAT(m.date, '%b %Y') AS date, "+
    "IFNULL(cm.commits, 0) AS commits "+
	"FROM  months m "+
	"LEFT JOIN ("+
    " SELECT year(s.date) as year, month(s.date) as month, "+ 
    "  COUNT(DISTINCT(s.id)) AS commits "+
    " FROM scmlog s "+
    " GROUP BY YEAR(s.date), MONTH(s.date) "+
    " ORDER BY YEAR(s.date), month(s.date)" +
    ") AS cm "+
    "ON (m.year = cm.year AND m.month = cm.month);";

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
