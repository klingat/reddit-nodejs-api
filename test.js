// load the mysql library
var mysql = require('mysql');

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'klingat', // CHANGE THIS :)
    password: '',
    database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);


// redditAPI.getSinglePost(1, function(err, result){
//     if(err) {
//         console.log(err);
//     }
//     else {
//         console.log(JSON.stringify(result, null, 4));
//     }
// })

// redditAPI.getAllPosts(function(err, result) {
//     if(err) {
//         console.log ("ERROR");
//     }
//     else {
//         console.log(JSON.stringify(result, null, 4));
//     }
// })

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

// redditAPI.createComment ({
//     parentId: 4,
//     comment: "no!",
//     userId: 3,
//     postId: 1
// }, function (err, post) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(JSON.stringify(post, null, 4));
//     }
// });

// redditAPI.getCommentsForPost (1, function(err, res) {
//     if (err) {
//         console.log(err);
//     }
//     else{
//         console.log(JSON.stringify(res, null, 4));
//     }

// });



// function getComments(postId, callback) {
//     _realGetComments(postId, null, [], {}, callback);
// }


// function _realGetComments(postId, parentIds, topLevelComments, commentIdx, callback) {
//     //check parents
//     //if parents select with in
//     //else select with is null
//     var query;
    
//     if(parentIds) {
//         if (parentIds.length === 0) {
//             callback(null, topLevelComments);
//             return;
//         }
        
//         query = `SELECT *
//             FROM comments AS c
//             WHERE c.postId=? and c.parentId IN (${parentIds.join(',')})
//             ORDER BY c.createdAt DESC`;
        
//     } else {
//         query = `SELECT *
//             FROM comments AS c
//             WHERE c.postId=? and c.parentId is NULL
//             ORDER BY c.createdAt DESC`;
//     }
    
//     connection.query(query, function(err, comments) {
//         if (err) {
//             callback(err);
//         }
//         else {
//             var newParentIds = [];
//             comments.forEach(function(comment) {
//                 comment.replies = [];
//                 commentIdx[comment.id] = comment;
//                 newParentIds.push(comment.id);
                
//                 if (comment.parentId === null) {
//                     topLevelComments.push(comment);
//                 }
//                 else {
//                     commentIdx[comment.parentId].replies.push(comment);
//                 }
//             });
            
//             _realGetComments(postId, newParentIds, topLevelComments, commentIdx, callback);
//         }
//     });
    

// }

// redditAPI.getCommentsForPost(1, function(err, res) {
//     var finalComments = [];
//     var commentsIndex = {};
//     res.forEach(function(commentGroup){
//         var comment1;
//         if (commentsIndex[commentGroup.c1_id]) { // if the comment exists in the index
//             comment1 = commentsIndex[commentGroup.c1_id];
//         }
//         else {
//         comment1 = { // if it does not exist in the index
//             id: commentGroup.c1_id,
//             text: commentGroup.c1_comment,
//             parentId: commentGroup.c1_parentId,
//             replies: []
//         }
//         // put the comment in the index by its id
//         commentsIndex[commentGroup.c1_id] = comment1;
//         // put it in the final result array
//         finalComments.push(comment1)
//         if(commentGroup.c2_id === null) {
//             return;
//         }
//         var comment2;
//         if (commentsIndex[commentGroup.c2_id]) {
//             comment2 = commentsIndex[commentGroup.c2_id]
//         }
//         else {
//             comment2 = { // if it does not exist in the index
//             id: commentGroup.c2_id,
//             text: commentGroup.c2_comment,
//             parentId: commentGroup.c2_parentId,
//             replies: []
//             }
//         // put the comment in the index by its id
//         commentsIndex[commentGroup.c2_id] = comment2;
//         // put it in the final result array
//         comment1.replies.push(comment2); //pushing it into the comments1 replies array
//         if (commentGroup.c3_id !== null) {
//             comment2.replies.push({
//                 id: commentGroup.c3_id,
//                 text: commentGroup.c3_comment,
//                 parentId: commentGroup.c3_parentId
//             })
//         }
//         var comment3 = {
//             id: commentGroup.c3_id,
//             text: commentGroup.c3_comment,
//             parentId: commentGroup.c3_parentId,
//             replies: []
//         };
//     }
//     }
//     console.log(JSON.stringify(finalComments, null, 4));
// })
// })


// redditAPI.createVoteOrUpdateVote ({
//     vote: 1,
//     userId: 9,
//     postId:2
// }, function(err, res) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(res);
//     }
//   connection.end(); 
// })

redditAPI.getAllPostsSorted("controversial", function(err, res) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(JSON.stringify(res, null, 4));
    }
    connection.end();
})
