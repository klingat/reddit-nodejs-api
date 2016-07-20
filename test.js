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

// redditAPI.createSubreddit(
//     {
//         name: "Montreal",
//         description: "Poutine is good."
//     },
//     function(err, sub) {
//         if (err) {
//             console.log(err);
//         }
//         else {
//             console.log(JSON.stringify(sub, null, 4));
//         }
//     }
// )

// redditAPI.getAllSubreddits(function (err, res) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(JSON.stringify(res, null, 4));
//     }
// });


// redditAPI.createPost({
//     title: 'Hello Montréal...',
//     url: 'https://www.reddit.com/r/AskReddit/hellomontreal',
//     userId: 3
// }, 1, function(err, post) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(JSON.stringify(post, null, 4));
//     }
// });
  
