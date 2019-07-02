const { Op } = require("sequelize");
const { NotFoundError, MissingPermissionError } = require("./errors");

module.exports = {
  User: {
    posts: (parent, args, context, info) =>
      parent.getPosts({ order: [["createdAt", "DESC"]] })
  },
  Post: {
    user: (parent, args, context, info) => parent.getUser()
  },
  Query: {
    latestPosts: (parent, { count, after }, { db }, info) => {
      if (after) {
        return db.post.findOne({ where: { id: after } }).then(post =>
          post
            ? db.post.findAll({
                where: {
                  createdAt: { [Op.lt]: post.createdAt }
                },
                limit: count,
                order: [["createdAt", "DESC"]]
              })
            : Promise.reject(new Error("The given post id doesn't exist"))
        );
      } else {
        return db.post.findAll({
          limit: count,
          order: [["createdAt", "DESC"]]
        });
      }
    },
    postsAfterTimestamp: (parent, { timestamp }, { db }, info) =>
      db.post.findAll({
        where: {
          createdAt: {
            [Op.gt]: new Date(timestamp * 1000)
          }
        }
      }),
    post: (parent, { id }, { db }, info) => db.post.findById(id),
    user: (parent, { id }, { db }, info) => db.user.findById(id),
    me: (parent, { id }, { db, user }, info) => user
  },
  Mutation: {
    createPost: (parent, { title, lead, content }, { db, user }, info) =>
      db.post.create({
        title,
        lead,
        content,
        userId: user.id
      }),
    updatePost: (parent, { title, lead, content, id }, { db, user }, info) =>
      db.post.findById(id).then(post => {
        if (!post) {
          return new NotFoundError();
        }

        if (post.userId !== user.id) {
          throw new MissingPermissionError();
        }

        //only update the post if the userId matches
        return db.post.update(
          {
            title,
            lead,
            content
          },
          {
            where: {
              id,
              userId: user.id
            }
          }
        );
      }),
    deletePost: (parent, { id }, { db }, info) =>
      db.post.findById(id).then(post => {
        if (!post) {
          return new NotFoundError();
        }

        if (post.userId !== user.id) {
          throw new MissingPermissionError();
        }

        //only update the post if the userId matches
        return db.post.destroy({
          where: {
            id,
            userId: user.id
          }
        });
      })
  }
};
