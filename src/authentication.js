const passport = require("passport");
const BearerStrategy = require("passport-http-bearer").Strategy;

module.exports = db => {
  passport.use(
    new BearerStrategy((token, done) =>
      db.user.findOne({ token: token }, (err, user) =>
        done(
          err ? err : null,
          !err && user ? user : false,
          !err && user ? { scope: "all" } : undefined
        )
      )
    )
  );

  return passport;
};
