var Bookshelf = require('bookshelf');
var path = require('path');

// initialize a sqlite database connnection with Bookshelf
var db = Bookshelf.initialize({
  client: 'sqlite3',
  connection: {
    host: '127.0.0.1',
    user: 'your_database_user',
    password: 'password',
    database: 'shortlydb',
    charset: 'utf8',
    filename: path.join(__dirname, '../db/shortly.sqlite')
  }
});

// utilize bookshelf's query manager (knex) to build tables
// create table if it does not exists, otherwise do nothing
// urls is a table of original and shortened urls
db.knex.schema.hasTable('urls').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('urls', function (link) {
      // attributes used for handlebar templating (index.html)
      link.increments('id').primary();
      link.string('url', 255);
      link.string('base_url', 255);
      link.string('code', 100);
      link.string('title', 255);
      link.integer('visits');
      // add createdAt and updatedAt properties
      link.timestamps();
    // use promise to notify of created table
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});

// clicks is a table that tracks the number of visits to the shortened urls
db.knex.schema.hasTable('clicks').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('clicks', function (click) {
      click.increments('id').primary();
      click.integer('link_id');
      click.timestamps();
    }).then(function (table) {
      console.log('Created Table', table);
    });
  }
});


/************************************************************/
// Add additional schema definitions below
/************************************************************/

// create users table to store all users for site
db.knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    db.knex.schema.createTable('users', function (user) {
      user.increments('id').primary();
      user.string('username', 255);
      user.string('password', 255);
      user.string('salt', 255);
      user.timestamps();
    }).then(function (table) {
      console.log('Created Table users: ', table);
    });
  }
});

















module.exports = db;


