const { Op } = require("sequelize");
const { NotFoundError, MissingPermissionError } = require("./errors");

module.exports = {
  User: {
    posts: (parent, args, context, info) =>
      parent.getPosts({ order: [["createdAt", "DESC"]] })
  },
  Post: {
    user: (parent, args, context, info) => parent.getUser(),
    canEdit: (parent, args, { user }, info) =>
      parent.getUser().then(u => u.id === user.id),
    canDelete: (parent, args, { user }, info) =>
      parent.getUser().then(u => u.id === user.id)
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
    createPost: (
      parent,
      { title, lead, content, sources },
      { db, user },
      info
    ) =>
      db.post
        .create({
          title,
          lead,
          content,
          sources,
          userId: user.id
        })
        .then(post => {
          return db.postRevision
            .create({
              title,
              lead,
              content,
              sources,
              postId: post.id
            })
            .then(() => post);
        }),
    updatePost: (
      parent,
      { id, title, lead, content, sources },
      { db, user },
      info
    ) =>
      db.post.findOne({ where: { id } }).then(post => {
        if (!post) {
          return new NotFoundError();
        }

        if (post.userId !== user.id) {
          throw new MissingPermissionError();
        }

        //only update the post if the userId matches
        return db.postRevision
          .create({ title, lead, content, sources, postId: id })
          .then(() =>
            db.post.update(
              {
                title,
                lead,
                content,
                sources
              },
              {
                where: {
                  id,
                  userId: user.id
                }
              }
            )
          )
          .then(() => post);
      }),
    deletePost: (parent, { id }, { user, db }, info) =>
      db.post.findOne({ where: { id } }).then(post => {
        if (!post) {
          return new NotFoundError();
        }

        if (post.userId !== user.id) {
          throw new MissingPermissionError();
        }

        //only update the post if the userId matches
        return db.postRevision.destroy({ where: { postId: id } }).then(() =>
          db.post.destroy({
            where: {
              id,
              userId: user.id
            }
          })
        );
      })
  }
};
