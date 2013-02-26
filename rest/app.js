
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

app.get('/', grimoire.index);
app.get('/scm/dbs', grimoire.dbs);
app.get('/scm/:db/authors', grimoire.authors);
app.get('/scm/:db/authors/:id', grimoire.authorsfindById);
app.get('/scm/:db/authors_evol', grimoire.authors_evol);
app.get('/scm/:db/commits', grimoire.commits);
app.get('/scm/:db/commits/:id', grimoire.commitsfindById);
app.get('/scm/:db/commits_evol', grimoire.commits_evol);
app.get('/scm/:db/companies', grimoire.companies);
app.get('/scm/:db/companies/:id', grimoire.companiesfindById);
app.get('/scm/:db/companies_evol', grimoire.companies_evol);
app.get('/scm/:db/repos', grimoire.repos);
app.get('/scm/:db/repos/:id', grimoire.reposfindById);
app.get('/scm/:db/repos_evol', grimoire.repos_evol);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
