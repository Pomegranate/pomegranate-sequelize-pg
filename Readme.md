## Pomegranate-sequelize-pg

Adds models to the `SQL` injectable object provided by [pomegranate-sequelize-core](https://github.com/Pomegranate/pomegranate-sequelize-core)

## Install

```shell
npm install --save pomegranate-sequelize-pg
```

## Usage

Run `pomegranate build` to generate a config file for connection details. Place you model files in the configured work directory (defaults to `./models`).

Your loaded models will be available on the `SQL` injectable `SQL.<modelName>`

## Model File

This format is expected by the plugin for your model files. The `classMethods.associate` method will be called by the plugin when all of the models are loaded.

```javascript
// file ./models/User.js
// Available as SQL.User

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
      name: {type: DataTypes.STRING},
      email: {type: DataTypes.STRING},
  }, 
  {
    classMethods: {
      associate: function(models) {
        //define associations if any.
        User.belongsTo(models.Location)
      }
  }
  });

  // must return your model.
  return Feed
};
```
