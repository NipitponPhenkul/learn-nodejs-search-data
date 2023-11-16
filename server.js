const express = require('express')
const path = require('path')
const { MongoClient } = require('mongodb')

const app = express()
const client = new MongoClient('mongodb://localhost')
const col = client.db('mflix').collection('movies')

client.connect().catch(console.error)

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, './views'))

app.get('/', async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : 1
  const limit = 20
  const keyword = req.query.keyword ? { title: { $regex: req.query.keyword }} : {}
  const pipeline = [
    { $match: keyword},
    { $project: { title: 1, type: 1, languages: 1, released: 1 }},
    { $skip: (page -1) * limit },
    { $limit: limit }
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

app.listen(3000, () => {
  console.log('App started at http://localhost:3000/')
})
