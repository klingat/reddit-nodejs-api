var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

var secureRandom = require('secure-random');

function createSessionToken() {
    return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
}


module.exports = function RedditAPI(conn) {
  return {

    createUser: function(user, callback) {

      // first we have to hash the password...
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()],
            function(err, result) {
              if (err) {
                /*
                There can be many reasons why a MySQL query could fail. While many of
                them are unknown, there's a particular error about unique usernames
                which we can be more explicit about!
                */
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                /*
                Here we are INSERTing data, so the only useful thing we get back
                is the ID of the newly inserted row. Let's use it to find the user
                and return it
                */
                conn.query(
                  'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      /*
                      Finally! Here's what we did so far:
                      1. Hash the user's password
                      2. Insert the user in the DB
                      3a. If the insert fails, report the error to the caller
                      3b. If the insert succeeds, re-fetch the user from the DB
                      4. If the re-fetch succeeds, return the object to the caller
                      */
                      callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },

    createPost: function(post, subredditId, callback) {
      conn.query(
        'INSERT INTO posts (userId, title, url, createdAt, subredditId) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), subredditId],

        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id,title,url,userId, createdAt, updatedAt, subredditId FROM posts WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },

    createComment: function(comm, callback) {
      conn.query(
        `INSERT INTO comments 
        (parentId, comment, userId, postId, createdAt) 
        VALUES (?, ?, ?, ?, ?)`, [comm.parentId || null, comm.comment, comm.userId, comm.postId, new Date()],

        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              `SELECT 
              id, parentId, comment, userId, postId, createdAt, updatedAt 
              FROM comments
              WHERE id = ?`, [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },

    createSubreddit: function(sub, callback) {
      conn.query(
        'INSERT INTO subreddits (name, description, createdAt) VALUES (?, ?, ?)', [sub.name, sub.description, new Date()],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            /*
            Post inserted successfully. Let's use the result.insertId to retrieve
            the post and send it to the caller!
            */
            conn.query(
              'SELECT id, name, description, createdAt, updatedAt FROM subreddits WHERE id = ?', [result.insertId],
              function(err, result) {
                if (err) {
                  callback(err);
                }
                else {
                  callback(null, result[0]);
                }
              }
            );
          }
        }
      );
    },

    getAllPosts: function(options, callback) {

      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT 
        
          posts.id, 
          title, 
          url, 
          userId AS postUserId, 
          posts.createdAt AS postCreatedAt, 
          posts.updatedAt AS postUpdatedAt,
          
          users.id AS userId, 
          username, 
          users.createdAt AS userCreatedAt, 
          users.updatedAt AS userUpdatedAt,
          
          subreddits.name AS subName,
          subreddits.description AS description,
          subreddits.createdAt AS subCreatedAt,
          subreddits.updatedAt AS subUpdatedAt
          
        FROM posts
          LEFT JOIN users ON users.id=posts.userId
          LEFT JOIN subreddits ON subreddits.id=posts.subredditId 
        ORDER BY posts.createdAt DESC
        LIMIT ? OFFSET ?`, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {

            // console.log(results)
            var mappedResults = results.map(function(res) {
              return {
                id: res.id,
                title: res.title,
                url: res.url,
                createdAt: res.postCreatedAt,
                updatedAt: res.updatedAt,
                userId: res.postUserId,
                user: {
                  id: res.userId,
                  username: res.username,
                  createdAt: res.userCreatedAt,
                  updatedAt: res.userCreatedAt
                },
                subreddit: {
                  name: res.subName,
                  description: res.description,
                  createdAt: res.subCreatedAt,
                  updatedAt: res.subUpdatedAt

                }
              }
            })
            callback(null, mappedResults);
          }
        }
      );
    },

    getAllPostsSorted: function(sortingMethod, options, callback) {
      

      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      // If no sorting method is chosen or not an option of sorting methods, this is default
      if (sortingMethod !== "newest" || sortingMethod !== "top" || sortingMethod !== "hot" || sortingMethod !== "controversial" ||sortingMethod === null) {
        var choices = "postCreatedAt";
      }

      // sorting method options
      if (sortingMethod === "newest") {
        var choices = "postCreatedAt";
      }

      if (sortingMethod === "top") {
        var choices = "voteScore";
      }


      if (sortingMethod === "hot") {
        var choices = "sum(vote) / (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(postCreatedAt))";
      }

      if (sortingMethod === "controversial") {
        var choices = "if((count(if(vote=1, 1, null))>count(if(vote=-1, 1, null))),(sum(vote) * count(if(vote=1, 1, null))) / count(if(vote=-1, 1, null)), (sum(vote) * count(if(vote=-1, 1, null)) / count(if(vote=1, 1, null))))"

      }

      conn.query(`
        SELECT 
        
          posts.id, 
          title, 
          url, 
          posts.userId AS postUserId, 
          posts.createdAt AS postCreatedAt, 
          posts.updatedAt AS postUpdatedAt,
          
          users.id AS userId, 
          username, 
          users.createdAt AS userCreatedAt, 
          users.updatedAt AS userUpdatedAt,
          
          subreddits.name AS subName,
          subreddits.description AS description,
          subreddits.createdAt AS subCreatedAt,
          subreddits.updatedAt AS subUpdatedAt,
          
          sum(vote) AS voteScore
          
        FROM posts
          LEFT JOIN users ON users.id=posts.userId
          LEFT JOIN subreddits ON subreddits.id=posts.subredditId
          LEFT JOIN votes ON votes.postId=posts.id
        GROUP BY posts.id
        ORDER BY ${choices} DESC
        LIMIT ? OFFSET ?`, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {

            // console.log(results)
            var mappedResults = results.map(function(res) {
              return {
                id: res.id,
                title: res.title,
                url: res.url,
                createdAt: res.postCreatedAt,
                updatedAt: res.updatedAt,
                userId: res.postUserId,
                voteScore: res.voteScore,
                user: {
                  id: res.userId,
                  username: res.username,
                  createdAt: res.userCreatedAt,
                  updatedAt: res.userCreatedAt
                },
                subreddit: {
                  name: res.subName,
                  description: res.description,
                  createdAt: res.subCreatedAt,
                  updatedAt: res.subUpdatedAt

                }
              }
            })
            callback(null, mappedResults);
          }
        }
      );
    },

    getAllPostsForUser: function(userId, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
          SELECT title, users.username, userId, url 
          FROM posts 
          LEFT JOIN users
          ON users.id=posts.userId 
          WHERE userId=?
          ORDER BY posts.createdAt 
          LIMIT ? OFFSET ?`, [userId, limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },

    getSinglePost: function(postId, callback) {
      conn.query(`
          SELECT title, url, id 
          FROM posts 
          WHERE id=?`, [postId],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results[0]);
          }
        }
      );
    },

    getAllSubreddits: function(callback) {
      conn.query(`
        SELECT 
          name, 
          description, 
          createdAt,
          updatedAt
        FROM subreddits
        ORDER BY createdAt DESC`,
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }
      );
    },

    getCommentsForPost: function(postId, callback) {
      conn.query(`
        SELECT
        comment,
        username,
        comments.createdAt,
        posts.title
        FROM comments
        LEFT JOIN users on users.id=comments.userId
        LEFT JOIN posts on posts.id=comments.postId
        WHERE postId=?
        ORDER BY comments.createdAt DESC`, [postId],

        // callback function
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, results);
          }
        }

      )
    },

    createVoteOrUpdateVote: function(vote, user, callback) {
      console.log(vote);
      vote.vote = Number(vote.vote)
      if (vote.vote === 1 || vote.vote === -1 || vote.vote === 0) {
        conn.query(
          `INSERT INTO votes 
        (vote, userId, postId, createdAt) 
        VALUES (?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE vote=?`, [vote.vote, user, vote.postId, new Date(), vote.vote],
          function(err, res) {
            if (err) {
              callback(err);
            }
            else {
              console.log("Your vote has been recorded.");
              callback(null, res);
            }
          });
      }
      else {
        callback('That is not a valid vote');
        return;
      }
    },

    checkLogin: function(username, password, callback) {
      conn.query(`
          SELECT * 
          FROM users 
          WHERE username=?`, [username],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            if (results.length > 0) {
              var user = results[0];
              var actualHashedPassword = results[0].password;
              bcrypt.compare(password, actualHashedPassword, function(err, result) {
                if (result === true) { // let's be extra safe here
                  callback(null, user);
                }
                else {
                  callback(new Error('username or password incorrect')); // in this case the password is wrong, but we reply with the same error
                }
              });
            }
            else {
              callback("NO USER FOUND!");
            }
          }
        }
      );
    },

    createSession: function(userId, callback) {
      var token = createSessionToken();
      conn.query('INSERT INTO sessions SET userId = ?, token = ?', [userId, token], function(err, result) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, token); // this is the secret session token :)
        }
      });
    },
    
    getUserFromSession: function(token, callback) {
      conn.query(`
          SELECT users.id, users.username 
          FROM sessions 
          join users on users.id = sessions.userId
          WHERE token=?`, [token], 
          function(err, results) {
            if(err) {
              callback(err);
            }
            else{
              callback(null, results[0])
            }
          }
    )}

  }
};
