var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

// create server
var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  // ejs: embedded javascript templating engine
  // ejs is a server side templating engine
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  // add session and cookieparser to track user's login status
  app.use(express.cookieParser());
  app.use(express.session({secret: 'topsecretlol'}));
});


// handle server requests

app.get('/', function(req, res) {
  // if session is active
  if (req.session.user) {
    // render with ejs template on server
    // send .ejs file to client
    // on client side, using handlebars template to populate ejs template
    res.render('index');
  } else {
    // otherwise send to login page
    res.redirect('/login');
  }
});

app.get('/create', function(req, res) {
  if (req.session.user) {
    res.render('index');
  } else {
    res.redirect('/login');
  }
});

app.get('/links', function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});


// main user page on login
app.post('/links', function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  // creating a skeleton for the search
  // the model is attached to the database
  // get from the Link table the url property at the requested url (uri)
  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        // if link not in the link table
        // create new link
        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });
        // save new link to database
        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/login', function(req, res) {
  // check is session open
  // if open then redirect to home
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('login');
  }
});

app.post('/login', function(req, res) {
  // utilize checkUser helper in lib/utility
  util.checkUser(req, res, function(found) {
    // if user found in database and password matches
    if (found) {
      // generate a session on login
      req.session.regenerate(function() {
        req.session.user = req.body.username;
        // redirect to main user page for app
        res.redirect('/');
      });
    } else {
      res.redirect('/signup');
    }
  });
});

app.get('/signup', function(req, res) {
  // check is session open
  // if open then redirect to home
  if (req.session.user) {
    res.redirect('/');
  } else {
    res.render('signup');
  }
});

app.post('/signup', function(req, res) {

  util.checkUser(req, res, function(found) {
    if (found) {
      res.redirect('/login');
    } else {
      // if not create new user
      var user = new User({
        username: req.body.username,
        password: req.body.password,
      });
      user.save().then(function(newUser) {
        Users.add(newUser);   // add to Users collection
        req.session.regenerate(function() {
          req.session.user = req.body.username;
          res.redirect('/');
        });
      });
    }
  });
});

// if user clicks logout button destroy session and redirect to login
// check index.html for how this works
app.get('/logout', function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
});
/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

// for all other routes
app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
// express' way of implementing server
app.listen(4568);
