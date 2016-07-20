// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'klingat', // CHANGE THIS :)
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);


// redditAPI.getSinglePost(5, function(err, result){
//     if(err) {
//         console.log("ERROR");
//     }
//     else {
//         console.log(result);
//     }
// })

redditAPI.getAllPosts(function(err, result) {
    if(err) {
        console.log ("ERROR");
    }
    else {
        console.log(JSON.stringify(result, null, 4));
    }
})

// redditAPI.getAllPostsForUser(10, function(err, result) {
//     if(err) {
//         console.log("ERRRRROR");
//     }
//     else {
//         console.log(JSON.stringify(result, null, 4));
//     }
// })

