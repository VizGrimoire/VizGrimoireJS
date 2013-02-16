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

function toGrimoireEvolJSON(rows) {
    var data = {id:[],date:[],commits:[]};
    for (var i =0; i<rows.length; i++) {
        data.id.push(rows[i].id);
        data.date.push(rows[i].date);
        data.commits.push(rows[i].commits);
    }
    return data;
}

// One row with values
function toGrimoireJSON(rows) {
    return rows[0];
}

function sendSQLRes(sql_query, req, res, evol) {
    var url_parts = url.parse(req.url, true);    
    var query = url_parts.query;

    connection.query(sql_query, function( err, rows, fields) {
        // JSONP support for jQuery
        if (query && query.callback) {
            res.writeHead(200, {'Content-Type' : 'application/javascript'});
            if (evol)
                res.end(query.callback + '(' + 
                    JSON.stringify(toGrimoireEvolJSON(rows)) + ')');
            else
                res.end(query.callback + '(' + 
                        JSON.stringify(toGrimoireJSON(rows)) + ')');
        }
        else {
            res.writeHead(200, {'Content-Type' : 'application/json'});
            if (evol)
                res.end(JSON.stringify(toGrimoireEvolJSON(rows)));
            else
                res.end(JSON.stringify(toGrimoireJSON(rows)));
        }
    });
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
    var evol = false;
    var start = req.query.start;
    var end = req.query.end;
    var sql = "SELECT COUNT(id) AS commits FROM scmlog";
    if (start || end) sql += " WHERE ";
    if (start) sql += "date>'" + start +"'";
    if (start && end) sql += " AND ";
    if (end) sql += "date<'" + end + "'";
    sendSQLRes(sql, req, res, evol);
};
exports.commitsfindById = function(req, res) {
    var evol = false;
    var sql = "SELECT * FROM scmlog where id = " + req.params.id;
    sendSQLRes(sql, req, res, evol);
};
exports.commits_evol = function(req, res) {
    var evol = true;
    var sql = "" +
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
    
    sendSQLRes(sql, req, res, evol);    
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