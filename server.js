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
  const movies = await col
    .aggregate([
      { $skip: (page -1) * limit },
      { $limit: limit }
    ]).toArray()
    // .find()
    // .skip((page -1) * limit)
    // .limit(limit)
    // .toArray()
  const total = await col.countDocuments()
  const totalPage = Math.ceil(total / limit)
  res.render('index', { movies, total, page, limit, totalPage })
})

app.listen(3000, () => {
  console.log('App started at http://localhost:3000/')
})
