/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-pg
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var Sequelize = require('sequelize');
/**
 *
 * @module index
 */

exports.options = {
  host: 'localhost',
  port: 5432,
  username: null,
  password: null,
  database: null,
  logging: false,
  workDir: './models'
}

exports.metadata = {
  name: 'Postgres',
  layer: 'data',
  param: 'SQL',
  type: 'service'
}

exports.plugin = {
    load: function(inject, loaded) {
      var self = this;
      var dbDefaults = {
        host: this.options.host,
        port: this.options.port,
        username: this.options.username,
        password: this.options.password,
        database: this.options.database,
        logging: false,
        dialect: 'postgres'
      }
      var loadingDefaults = {
       modelPath: this.options.workDir
      }

      var db = {}
      var modelCount = 0;
      this.sequelize = new Sequelize(dbDefaults.database, dbDefaults.username, dbDefaults.password, dbDefaults)
      self.Logger.log('Loading models from - ' + this.options.workDir);
      fs.readdirSync(loadingDefaults.modelPath)
        .filter(function(file) {
          return (file.indexOf('.') !== 0 && file !== 'index.js')
        })
        .forEach(function(file) {
          var model = self.sequelize.import(path.join(loadingDefaults.modelPath, file));
          self.Logger.log('Loaded model - ' + model.name);
          db[model.name] = model;
          modelCount += 1
        })

      _.each(db, function(model) {
        if(_.isFunction(model.associate)) {
          model.associate(db)
        }
      })
      this.Logger.log('Loaded ' + modelCount + ' Sql models.');

      var SQL = _.extend({Sequelize: Sequelize, sequelize: this.sequelize}, db);

      loaded(null, SQL)
    },
    start: function(done) {
      var self = this;
      return self.sequelize.authenticate()
        .then(function() {
          self.Logger.log('SQL connection successful.');
          return self.sequelize.sync({force: false})
        })
        .then(function(){
          self.Logger.log('Ready.');
          return done(null)
        })
        .catch(function(err){
          return done(err)
        })

    },
    stop: function(done) {
      var self = this;
      self.sequelize.close();
      return done()
    }
};
