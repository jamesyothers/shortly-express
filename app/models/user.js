var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  username: '',
  password: '',
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      username = model.get('username');
      password = model.get('password');
    });
  }







});

module.exports = User;
