//教练员模型
module.exports = (app) => {
    const { STRING, INTEGER,DATE,NOW,VIRTUAL,DOUBLE  } = app.Sequelize;
    const community = app.model.define(
      "community",
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
        tableName: "community_list"
      }
    );
    return community;
  };