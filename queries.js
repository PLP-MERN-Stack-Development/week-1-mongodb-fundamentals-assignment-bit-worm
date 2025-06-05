// create the db
// in mongosh
use plp_bookstore

// create the 'books' collection
db.createCollection("books")

// inserting books from the js script
// you will need to add your username and password to the script
load("insert_books.js")

// find a book in the 'Adventure genre'
db.books.find({genre: "Adventure"})

// find books published in '1988'
db.books.find({published_year: 1988})

// find books by the author 'Jane Austen'
db.books.find({author: "Jane Austen"})

// upating the price of the books
db.books.updateOne({title: "Moby Dick"}, {$set: {price: 6.9}})

// deleting a book by title
db.books.deleteOne({title: "The Great Gatsby"})


/* --- Advanced Queries --- */

// a query to find books that are both in stock and published after 2010
db.books.find({
  $and: [
    {in_stock: true},
    {year: {$gt: 2010}}
  ]
})

// returning only the title, author, and price fields
db.books.find({}, { title: 1, author: 1, price: 1, _id: 0 })

// displpay the books in ascending order of price
// and then using the `limit` and `skip` methods to implement pagination (5 books per page)
db.books.find({}).sort({price: 1}).skip(0).limit(5)

// displpay the books in descending order of price
// and then using the `limit` and `skip` methods to implement pagination (5 books per page)
db.books.find({}).sort({price: -1}).skip(0).limit(5)


/* ---Aggregation Pipeline--- */

// an aggregation pipeline to calculate the average price of books by genre
db.books.aggregate([
  {
    $group: {
      _id: "$genre",
      averagePrice: { $avg: "$price" }
    }
  },
  {
    $project: {
      _id: 0,
      genre: "$_id",
      averagePrice: 1
    }
  },
  {
    $sort: { averagePrice: -1 }  // descending order
  }
])

// an aggregation pipeline to find the author with the most books in the collection
db.books.aggregate([
  {
    $group: {
      _id: "$author",
      books: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      author: "$_id",
      books: 1
    }
  },
  {
    $sort: { books: -1 } // puts the most books at the top
  },
  {
    $limit: 1 // returns the top most
  }
])

// a pipeline that groups books by publication decade and counts them
db.books.aggregate([
  {
    $addFields: {
      decade: {
        $multiply: [
          { $floor: { $divide: ["$year", 10] } }, 10
        ]
      }
    }
  },
  {
    $group: {
      _id: "$decade",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  },
  {
    $project: {
      _id: 0,
      decade: "$_id",
      count: 1
    }
  }
])



/* ---Indexing--- */

// an index on the `title` field for faster searches
db.books.createIndex({ title: 1 })

// a compound index on `author` and `published_year`
db.books.createIndex({ author: 1, published_year: 1 })

// `explain()` method to demonstrate the performance improvement with the indexes
db.books.find({
  author: "George Orwell",
  published_year: 1949
}).explain("executionStats")
