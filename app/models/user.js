var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  username: '',
  password: '',
  salt: '',
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      model.set('username', model.get('username'));
      // generate salt, processing 5 times
      var tempSalt = bcrypt.genSaltSync(5);
      model.set('salt', tempSalt);
      // use the pasword and salt to generate the hash property
      var hash = bcrypt.hashSync(model.get('password'), tempSalt);
      model.set('password', hash);
    });
  }
});

module.exports = User;
