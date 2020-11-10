//教练员模型
module.exports = (app) => {
  const { STRING, INTEGER,DATE,NOW,VIRTUAL,DOUBLE  } = app.Sequelize;
  const Driver = app.model.define(
    "Driver",
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name:STRING,
      en_name:STRING,
      sologon:STRING,
      tag:STRING,
      wechat:STRING,
      keyword:STRING 
    },
    {
      timestamps: false,
      freezeTableName: true,
      tableName: "Driver_user"
    }
  );
//  Driver.hasMany(app.model.Vote
  Driver.associate = function() {
        app.model.Driver.hasMany(app.model.Vote, { foreignKey: 'driver_id' , targetKey: 'id'});
        app.model.Driver.hasMany(app.model.Question,{foreignKey:'tag',targetKey:'tag'})
        app.model.Driver.belongsToMany(app.model.Question, {  through: app.model.DriverQuestion })
        // foreignKey的值为AuthGroupAccess表中的外键（对应user表里ID的字段）
      }
  return Driver;
};