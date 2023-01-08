// require express
const express = require('express');

const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

// create our express app
const app = express();
app.use(express.json())

// connect to mongodb database
let db;
connectToDb((err) => {
  if (!err) {
    console.log('connected to mongodb');
    // start our server
    app.listen(3000, () => {
      console.log('listening on port 3000');
    })
    db = getDb();
  }
})

// request routs to get all books
app.get('/books', (req, res) => {
  // pagenations using skip and limit method
  const page = req.query.p || 0
  const booksPerPage = 3

  let books = [];

  db.collection('books')
    .find()
    .sort({author: 1})
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => books.push(book))
    .then(() => {
      res.status(200).json(books);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({error: 'Error fetching books from database'});
    });
});

// request routs to get a book by id
app.get('/books/:id', (req, res) => {
  const id = req.params.id;

  if (ObjectId.isValid(id)) {
    db.collection('books')
    .findOne({_id: ObjectId(id)})
    .then(doc => {
      res.status(200).json(doc);
    })
    .catch(err => {
      res.status(500).json({error: 'Error fetching book from database'});
    });
  } else {
    res.status(404).json({error: 'Invalid id'});
  }
})

// request route to post new book
app.post('/books', (req, res) => {
  const book = req.body

  db.collection('books')
    .insertMany(book)
    .then(result => {
      res.status(201).json(result)
    })
    .catch(err => {
      res.status(500).json({error: 'Could not create a new document'})
    })
})

// request route to delete a book
app.delete('/books/:id', (req, res) => {
  const id = req.params.id

  // check if id is valid
  if (ObjectId.isValid(id)) {
    db.collection('books')
      .deleteOne({_id: ObjectId(id)})
      .then(result => {
        res.status(200).json(result)
      })
      .catch(err => {
        res.status(500).json({error: 'Could not delete the document'})
      })
  } else {
    res.status(500).json({error: 'Not a valid id'})
  }
})

// request route to update document
app.patch('/books/:id', (req, res) => {
  const updates = req.body
  const id = req.params.id

  if (ObjectId.isValid(id)) {
    db.collection('books')
      .updateOne({_id: ObjectId(id)}, {$set: updates})
      .then(result => res.status(200).json(result))
      .catch(err => res.status(500).json({error: 'Could not update the document'}))
  } else {
    res.status(500).json({error: 'Not a valid id'})
  }
})