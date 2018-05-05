const assert = require('chai').assert
const mongoose = require('mongoose')
const {seed, oneOne, oneMany, manyMany} = require('../src')
const {connect, disconnect, User, Profile, Category, Post, Comment, Tag} = require('./db')

describe('Seed', () => {
  before(connect)
  beforeEach(() =>
    User.remove({})
    .then(() => Category.remove({}))
    .then(() => Post.remove({}))
    .then(() => Comment.remove({}))
    .then(() => Tag.remove({}))
  )

  it('seeds one model', () =>
    Tag.find({})
    .then(tags => {
      assert.deepEqual(tags, [])
      return seed({Tag: 5}, [])
    })
    .then(data => {
      assert.isObject(data)
      assert.isArray(data.Tag)
      assert.lengthOf(data.Tag, 5)
      data.Tag.forEach(tag => {
        assert.isString(tag.name)
        assert.isBoolean(tag.hidden)
      })
    })
  )

  it('seeds one model with recursive relation', () =>
    seed({Category: 10}, [
      oneMany('Category', 'children', 'Category', 'parent')
    ])
    .then(data => {
      assert.isObject(data)
      assert.isArray(data.Category)
      assert.lengthOf(data.Category, 10)
      const index = data.Category.reduce((index, c) => {
        index[c.id] = c
        return index
      }, {})
      let noParent = 0
      data.Category.forEach(c => {
        assert.isString(c.name)
        if (c.parent == null)
          noParent ++
        else
          assert.include(index[c.parent].children, c.id)
      })
      assert.equal(noParent, 1)
    })
  )

  it('seeds many models with multiple relations', () => {
    const counts = {
      User: 5, Profile: 5, Category: 5,
      Post: 10, Comment: 50, Tag: 30
    }
    return seed(counts, [
      oneOne('User', 'profile', 'Profile', null),
      oneMany('User', 'posts', 'Post', 'writer'),
      oneMany('User', null, 'Comment', 'writer'),
      oneMany('Category', 'posts', 'Post', 'category'),
      oneMany('Category', 'children', 'Category', 'parent'),
      oneMany('Post', 'comments', 'Comment', 'post'),
      manyMany('Post', 'tags', 'Tag', null)
    ])
    .then(data => {
      assert.isObject(data)

      Object.keys(counts).forEach(name => {
        assert.isArray(data[name])
        assert.lengthOf(data[name], counts[name])
      })

      const index = {}
      const ids = {}
      Object.keys(data).forEach(name => {
        index[name] = data[name].reduce((index, m) => {
          index[m.id] = m
          return index
        }, {})
        ids[name] = data[name].map(_ => _.id.toString())
      })

      data.User.forEach(user => {
        assert.isString(user.name)
        assert.instanceOf(user.since, Date)
        assert.include(ids.Profile, user.profile.toString())
        user.posts.forEach(id =>
          assert.equal(user.id, index.Post[id].writer)
        )
      })

      data.Profile.forEach(profile => {
        assert.include(['free', 'premium', 'admin'], profile.type)
        assert.instanceOf(profile.picture, Buffer)
        assert.isNumber(profile.rank)
        assert.isString(profile.links.facebook)
        assert.isString(profile.links.twitter)
        assert.isString(profile.links.github)
        profile.quotes.forEach(q => assert.isString(q))
      })

      let categoriesWithNoParent = 0
      data.Category.forEach(category => {
        assert.isString(category.name)
        if (category.parent == null)
          categoriesWithNoParent ++
        else
          assert.include(
            index.Category[category.parent].children,
            category.id
          )
        category.posts.forEach(id =>
          assert.equal(category.id, index.Post[id].category)
        )
      })
      assert.equal(categoriesWithNoParent, 1)

      data.Post.forEach(post => {
        assert.isString(post.title)
        assert.isString(post.content)
        assert.include(
          index.Category[post.category].posts,
          post.id
        )
        assert.include(
          index.User[post.writer].posts,
          post.id
        )
        post.comments.forEach(id =>
          assert.equal(post.id, index.Comment[id].post)
        )
        post.tags.forEach(id =>
          assert.include(ids.Tag, id.toString())
        )
      })

      data.Comment.forEach(comment => {
        assert.isString(comment.content)
        assert.include(
          index.Post[comment.post].comments,
          comment.id
        )
        assert.include(ids.User, comment.writer.toString())
      })

      data.Tag.forEach(tag => {
        assert.isString(tag.name)
        assert.isBoolean(tag.hidden)
      })

    })
  }).timeout(10000)

  after(disconnect)
})
