var http = require('http');
var url = require('url');

var mysql = require('mysql');
var connection = mysql.createConnection({
	user : 'webkit',
	password : '****',
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

http.createServer(
		function(req, res) {
			var total_changes;
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			if (query.callback) {
				res.writeHead(200, {
					'Content-Type' : 'application/javascript'
				});
				console.log('JSONP query ' + query.callback);
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
				// res.write('Total ticket changes: ' + total_changes + '\n');
				if (query.callback)
					res.end(query.callback + '(' +JSON.stringify(rows) + ')');
				else
					res.end(JSON.stringify(data));
				console.log('Total ticket changes: ' + total_changes);
			});
		}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
