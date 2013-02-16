/*
 * Grimoire REST interface
 */

var url = require('url');

// Database connection
var mysql = require('mysql');
var connection = mysql.createConnection({
    user : 'root',
    password : '',
    database : 'acs_cvsanaly_webkit'
});
connection.connect();

function toGrimoireJSON(rows) {
    var data = {id:[],date:[],commits:[]};
    for (var i =0; i<rows.length; i++) {
        data.id.push(rows[i].id);
        data.date.push(rows[i].date);
        data.commits.push(rows[i].commits);
    }
    return data;
}


// REST Methods
exports.authors = function(req, res) {
    res.send("authors " + req.query.start + " " + req.query.end);
};
exports.authorsfindById = function(req, res) {
    res.send("company JSON by Id");
};
exports.authors_evol = function(req, res) {
    res.send("respond with a authors-evol in JSON");
};

exports.commits = function(req, res) {
    res.send("commits " + req.query.start + " " + req.query.end);
};
exports.commitsfindById = function(req, res) {
    res.send("company JSON by Id");
};
exports.commits_evol = function(req, res) {
    var url_parts = url.parse(req.url, true);    
    var query = url_parts.query;

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
    
    connection.query(commits_ts_sql, function( err, rows, fields) {
        // JSONP support for jQuery
        if (query && query.callback) {
            res.writeHead(200, {'Content-Type' : 'application/javascript'});
            res.end(query.callback + '(' + 
                    JSON.stringify(toGrimoireJSON(rows)) + ')');
        }
        else {
            res.writeHead(200, {'Content-Type' : 'application/json'});
            res.end(JSON.stringify(toGrimoireJSON(rows)));
        }
    });
};

exports.companies = function(req, res) {
    res.send("companies " + req.query.start + " " + req.query.end);
};
exports.companiesfindById = function(req, res) {
    res.send("company JSON by Id");
};
exports.companies_evol = function(req, res) {
    res.send("respond with a companies-evol in JSON");
};

exports.repos = function(req, res) {
    res.send("repos " + req.query.start + " " + req.query.end);
};
exports.reposfindById = function(req, res) {
    res.send("repo JSON by Id");
};
exports.repos_evol = function(req, res) {
    res.send("respond with a repos-evol in JSON");
};

// HTML contents for API doc
exports.index = function(req, res) {
    res.render('rest', {
        title : 'Grimoire REST API'
    });
};