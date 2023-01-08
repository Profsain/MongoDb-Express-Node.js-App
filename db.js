const { MongoClient } = require('mongodb');

let dbConnection;
let uri = 'mongodb+srv://profsain:win123@cluster0.5dwhuiz.mongodb.net/?retryWrites=true&w=majority';

module.exports = {
  // connect to mongodb database
  // callbackFnc is a function that will be called after the connection is established

  connectToDb: (callbackFnc) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection =client.db()
        return callbackFnc();
      })
      .catch((err) => {
        console.log(err);
        return callbackFnc(err);
      });
  },

  // get mongodb database after connection
  getDb: () => dbConnection,
}