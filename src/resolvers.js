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
    latestPosts: (parent, { count }, { db }, info) =>
      db.post.findAll({
        limit: count,
        order: [["createdAt", "DESC"]]
      }),
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
    createPost: (parent, { title, content }, { db, user }, info) =>
      db.post.create({
        title: title,
        content: content,
        userId: user.id
      }),
    updatePost: (parent, { title, content, id }, { db, user }, info) =>
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
            title: title,
            content: content
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
