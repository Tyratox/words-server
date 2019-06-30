const { Op } = require("sequelize");
const { sendMail } = require("../src/email");
const { NotFoundError } = require("../src/errors/NotFoundError");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING(255),
      email: {
        type: DataTypes.STRING(255),
        unique: true
      },
      /*passwordHash: DataTypes.STRING(512),
      passwordSalt: DataTypes.STRING(512),
      passwordAlgorithm: DataTypes.STRING(10),*/
      locale: {
        type: DataTypes.STRING(5),
        default: "de-CH",
        validate: {
          isIn: ["de-CH", "de-DE"]
        }
      }
    },
    {
      freezeTableName: true
    }
  );

  User.associate = models => {
    User.hasMany(models.post);
  };

  User.afterAssociation = db => {
    User.login = function(name, email, locale) {
      return this.findAll({ where: { email } })
        .then(users => {
          if (!users || users.length === 0) {
            //the user first has to be registered
            return this.create({ name, email, locale });
          }

          if (users.length !== 1) {
            throw new Error(
              "Internal error! Two users apparently have the same email address"
            );
          }
          return users[0];
        })
        .then(user =>
          db.authenticationToken
            .create({
              userId: user.id
            })
            .then(authenticationToken => {
              //send email with authenticationToken.token

              return sendMail(email, "login", user.locale, {
                name: user.name,
                authenticationToken: authenticationToken.token
              });
            })
        );
    };
  };

  return User;
};
