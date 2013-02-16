/*
 * Grimoire REST interface
 */

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
    res.send("respond with a commits-evol in JSON");
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