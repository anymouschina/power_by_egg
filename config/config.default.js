/* eslint valid-jsdoc: "off" */


/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1598250569210_6849';

  // add your middleware config here
//   config.middleware = ['authLogin'];
config.middleware = ['api'];
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  //多出来的配置==========
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: true
    },
    domainWhiteList: ['*']
  };
  config.cors = {
    origin:'*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };
  config.sequelize = {
     dialect: 'mysql',
     host: '127.0.0.1',
     username: "libiqiang",
     password: "qq7758258",
     port: 3306,
     database: 'libiqiang',
  };
  return {
    ...config,
    ...userConfig,
  };
};
