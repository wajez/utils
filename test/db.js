const mongoose = require('mongoose')
const {Schema} = mongoose

const connect = async () => {
  mongoose.Promise = global.Promise
  return mongoose.connect(`mongodb://mongo/wajez-utils`)
}

const disconnect = async () => {
  mongoose.connection.close()
}

const User = mongoose.model('User', new Schema({
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  },
  name: String,
  since: Date,
}))

const Profile = mongoose.model('Profile', new Schema({
  type: {
    type: String,
    enum: ['free', 'premium', 'admin']
  },
  picture: Buffer,
  rank: Number,
  links: {
    facebook: String,
    twitter: String,
    github: String
  },
  quotes: [String]
}))

const Category = mongoose.model('Category', new Schema({
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  posts: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  name: String
}))

const Post = mongoose.model('Post', new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  title: String,
  content: String
}))

const Comment = mongoose.model('Comment', new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String
}))

const Tag = mongoose.model('Tag', new Schema({
  name: String,
  hidden: Boolean
}))

module.exports = {connect, disconnect, User, Profile, Category, Post, Comment, Tag}
