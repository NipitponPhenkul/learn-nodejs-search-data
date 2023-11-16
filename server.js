const express = require('express')
const path = require('path')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()
const client = new MongoClient('mongodb://localhost')
const col = client.db('mflix').collection('movies')

client.connect().catch(console.error)

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, './views'))

const lookupComments = { $lookup: {
  from: 'comments',
  localField: '_id',
  foreignField: 'movie_id',
  as: 'comments'
}}

app.get('/', async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1
  const limit = 20
  const keyword = req.query.keyword ? { title: { $regex: req.query.keyword }} : {}
  const pipeline = [
    { $match: keyword},
    { $project: { title: 1, type: 1, languages: 1, released: 1 }},
    { $skip: (page -1) * limit },
    { $limit: limit },
    lookupComments
  ]
  pipeline.unshift()
  const movies = await col.aggregate(pipeline).toArray()
  const total = await col.countDocuments(keyword)
  const totalPage = Math.ceil(total / limit)
  res.render('index', {
    keywordInput: req.query.keyword,
    movies,
    total,
    page,
    limit,
    totalPage })
})

app.get('/movies/:id', async (req, res) => {
  const movies = await col.aggregate([
    { $match: { _id: new ObjectId(req.params.id) }},
    lookupComments
  ]).toArray()
  const movie = movies[0]
  res.render('movie', { movie })
})

app.listen(3000, () => {
  console.log('App started at http://localhost:3000/')
})
