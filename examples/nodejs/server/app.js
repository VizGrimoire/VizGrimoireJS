
/**
 * Module dependencies.
 */

var express = require('express')
  , grimoire = require('./routes/grimoire')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//app.get('/wines', wine.findAll);
//app.get('/wines/:id', wine.findById);
//app.post('/wines', wine.addWine);
//app.put('/wines/:id', wine.updateWine);
//app.delete('/wines/:id', wine.deleteWine);

app.get('/', grimoire.index);
app.get('/companies', grimoire.companies);
app.get('/companies/:id', grimoire.companiesfindById);
app.get('/commits', grimoire.commits);
app.get('/commits/:date1:date2', grimoire.commitsByDate);
//http://service/commits: total numer of commits
//    http://service/commits/date1-date2 total commits for a date range
//    http://service/commits-evol total commits evolution
//    http://service/commits-evol/date1-date2 evol commits for a date range
//    http://service/authors: list of authors
//    http://service/authors/author_id/commits total commits
//    http://service/authors/author_id/commits/date1-date2 total commits for a date range
//    http://service/authors/author_id/commits-evol total commits evolution for an author
//    http://service/authors/author_id/commits-evol/date1-date2 total commits evolution for a date range for an author

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
