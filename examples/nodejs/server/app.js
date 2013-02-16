
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
app.get('/scm/authors', grimoire.authors);
app.get('/scm/authors/:id', grimoire.authorsfindById);
app.get('/scm/authors_evol', grimoire.authors_evol);
app.get('/scm/commits', grimoire.commits);
app.get('/scm/commits/:id', grimoire.commitsfindById);
app.get('/scm/commits_evol', grimoire.commits_evol);
app.get('/scm/companies', grimoire.companies);
app.get('/scm/companies/:id', grimoire.companiesfindById);
app.get('/scm/companies-evol', grimoire.companies_evol);
app.get('/scm/repos', grimoire.repos);
app.get('/scm/repos/:id', grimoire.reposfindById);
app.get('/scm/repos_evol', grimoire.repos_evol);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
