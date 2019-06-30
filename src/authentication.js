const passport = require("passport");
const BearerStrategy = require("passport-http-bearer").Strategy;

module.exports = db => {
  passport.use(
    new BearerStrategy((token, done) =>
      db.user
        .findOne({ token: token })
        .then(user =>
          done(null, user ? user : null, user ? { scope: "all" } : undefined)
        )
        .catch(e => done(e, null))
    )
  );

  return passport;
};
