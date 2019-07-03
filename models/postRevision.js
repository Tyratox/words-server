module.exports = (sequelize, DataTypes) => {
  const PostRevision = sequelize.define(
    "postRevision",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      lead: {
        type: DataTypes.STRING(1000),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false
      },
      sources: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      freezeTableName: true,
      indexes: [{ type: "FULLTEXT", name: "text_idx", fields: ["content"] }]
    }
  );

  PostRevision.associate = models => {
    PostRevision.belongsTo(models.post);
  };

  PostRevision.afterAssociation = db => {};

  return PostRevision;
};
