/**
 * @file loadModels
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-sequelize-pg
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
var path = require('path');

var PluginUtils = require('magnum-plugin-utils')

var FileList = PluginUtils.fileList;
var FileBaseName = require('magnum-plugin-utils').fileBaseName;
var _ = require('magnum-plugin-utils').lodash
/**
 *
 * @module loadModels
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
  name: 'SequelizePg',
  param: 'SQL',
  type: 'merge',
  depends: ['SequelizeCore']
}

exports.plugin = {
  load: function(inject, loaded) {
    var self = this;
    var Sequelize = inject(function(SQL){return SQL.Sequelize})
    var db = {}
    var modelCount = 0;

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

    this.sequelize = new Sequelize(dbDefaults.database, dbDefaults.username, dbDefaults.password, dbDefaults)
    db.sequelize = this.sequelize;

    self.Logger.log('Loading models from - ' + this.options.workDir);
    FileList(loadingDefaults.modelPath, {ext: '.js'})
      .then(function(files){
        _.each(files, function(file) {
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

        self.Logger.log('Loaded ' + modelCount + ' Sql models.');
        // var SQL = _.extend({Sequelize: Sequelize, sequelize: this.sequelize}, db);

        loaded(null, db)

      })
      .catch(function(err){
        loaded(err)
      })
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