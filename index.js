/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-pg
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

/**
 *
 * @module index
 */

module.exports = [
  require('pomegranate-sequelize-core'),
  require('./plugins/loadModels')
];
