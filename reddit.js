var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;

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
          JOIN users ON users.id=posts.userId
          JOIN subreddits ON subreddits.id=posts.subredditId 
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
          JOIN users
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
          SELECT title, url, postId 
          FROM posts 
          WHERE id=?`, [postId],
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
      }
  };
};


