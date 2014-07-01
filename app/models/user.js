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
      // console.log('username: ' + model.get('username'));
      // console.log('password: ' + model.get('password'));


      model.set('username', model.get('username'));

      var hash = bcrypt.hashSync(model.get('password'));
      // console.log(hash);
      model.set('password', hash);
    });
  }



});

module.exports = User;
