/*
 * Grimoire REST interface
 */

// REST Methods
exports.companies = function(req, res){
  res.send("respond with a company in JSON");
};

exports.companiesfindById = function(req, res){
    res.send("company JSON by Id");
};

exports.commits = function(req, res){
    res.send("commits");
};

exports.commitsByDate = function(req, res){
    res.send("commits between dates " + req.params.date1 + " " + req.params.date2);
};

// HTML contents for API doc
exports.index = function(req, res){
    res.render('rest', { title: 'Grimoire REST API' });
};
