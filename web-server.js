var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var secureRandom = require('secure-random');

app.use(bodyParser.urlencoded({
    extended: false
})); //middleware

app.use(cookieParser());
app.use(checkLoginToken);

app.set('view engine', 'ejs');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'klingat',
    password: '',
    database: 'reddit'
});

var reddit = require('./reddit');
var redditAPI = reddit(connection);



// app.get('/', function(req, res) {
//     res.send('Hello, you fine person.');
// });

// app.get('/hello', function(req, res) {
//     console.log('I received a request!');

//     res.send("<h1>Hello world!</h1>");
// });

// app.get('/hello', function(req, res) {
//     var name = req.query.name;
//     if (!name) {
//         res.send(`<h1>Hello world.</h1>`);
//     }
//     else {
//         res.send(`<h1>Hello ${name}</h1>`);
//     }
// });

// app.get("/calculator/:op", function(req, res) {

//     if (req.params.op === "add") {
//         var add = parseFloat(req.query.num1) + parseFloat(req.query.num2);
//         res.send({
//             operator: req.params.op,
//             firstOperand: req.query.num1,
//             secondOperand: req.query.num2,
//             solution: add
//         });
//     }
//     else if (req.params.op === "sub") {
//         var sub = parseFloat(req.query.num1) - parseFloat(req.query.num2);
//         console.log(sub);
//         res.send({
//             operator: req.params.op,
//             firstOperand: req.query.num1,
//             secondOperand: req.query.num2,
//             solution: sub
//         });
//     }
//     else if (req.params.op === "mult") {
//         var mult = parseFloat(req.query.num1) * parseFloat(req.query.num2);
//         res.send({
//             operator: req.params.op,
//             firstOperand: req.query.num1,
//             secondOperand: req.query.num2,
//             solution: mult
//         });
//     }
//     else if (req.params.op === "div") {
//         var div = parseFloat(req.query.num1) / parseFloat(req.query.num2);
//         res.send({
//             operator: req.params.op,
//             firstOperand: req.query.num1,
//             secondOperand: req.query.num2,
//             solution: div
//         });
//     }
//     else {
//         res.status(400).send("😟You have to pass a correct operator.");
//     }
// });

// app.get("/posts", function(req, res) {
//     connection.query(`select 
//         posts.title, 
//         posts.url, 
//         users.username 
//         from posts 
//         left join users on users.id=posts.userId 
//         order by posts.createdAt desc
//         limit 5`, function(err, posts) {
//         if (err) {
//             res.status(500).send("Try again later.😟");

//             console.log(err.stack);
//         }
//         else {
//             function createLi(data) {
//                 return `
//                     <li class="content-item">
//                          <h2 class="content-item__title">
//                             <a href="${data.url}">${data.title}</a>
//                          </h2>
//                          <p>Created by ${data.username}</p>
//                     </li>
//                     `;
//             }
//             res.send( //if you dont use join at the end it returns it with commas.
//                 `<div id="contents">
//                       <h1 style="color:pink">Welcome to Reddit!!</h1>
//                       <ul class="contents-list">
//                         ${posts.map(function(item){
//                         return createLi(item)}
//                         ).join("")
//                         }
//                       </ul>
//                 </div>`
//             );
//         }
//     });
// });

// app.get("/createContent", function(req, res) {
//     res.send(`
//         <form action="/createContent" method="POST">
//              <div>
//                 <input type="text" name="url" placeholder="Enter a URL to content">
//              </div>
//              <div>
//                 <input type="text" name="title" placeholder="Enter the title of your content">
//              </div>
//              <button type="submit">Create!</button>
//         </form>
//     `);
// });

// app.post("/createContent", function(req, res) {
//     redditAPI.createPost({
//         title: req.body.title,
//         url: req.body.url,
//         userId: 1
//     }, 1, function(err, post) {
//         if (err) {
//             res.status(500).send("There was an error. Try again later.");
//             console.log(err.stack); //so that you can see the error in your terminal
//         }
//         else {
//             res.redirect(`/posts/${post.id}`);
//         }
//     });
// });

// app.get("/posts/:ID", function(req, res) {
//     var id = req.params.ID;
//     connection.query(`select 
//         posts.title, 
//         posts.url, 
//         users.username 
//         from posts
//         left join users on users.id=posts.userId
//         where posts.id=${id}`, function(err, posts) {
//         if (err) {
//             res.status(400).send("Try again later.");
//         }
//         else {
//             res.send( //if you dont use join at the end it returns it with commas.
//                 `<h1><a href="${posts[0].url}">${posts[0].title}</a></h1>
//                 <p>By ${posts[0].username}</p>`
//             );
//         }
//     });
// });

app.get("/signup", function(req, res) {
    res.render("signup.ejs")
});

app.post("/signup", function(req, res) {
    redditAPI.createUser({
        username: req.body.username,
        password: req.body.password
    }, function(err, user) {
        if (err) {
            res.status(400).send(err);
        }
        else {
            res.redirect("/login");
        }
    });
});

app.get("/login", function(req, res) {
    res.render("login.ejs");
});

app.post("/login", function(req, res) {
    redditAPI.checkLogin(req.body.username, req.body.password, function(err, outcome) {
        if (err) {
            res.status(401).send(err.message);
        }
        else {
            redditAPI.createSession(outcome.id, function(err, token) {
                if (err) {
                    res.status(500).send('an error occurred. please try again later!');
                }
                else {
                    res.cookie('SESSION', token); // the secret token is now in the user's cookies!
                    res.redirect('/posts');
                    // res.send("hey")
                }
            });
        }
    });
});

function checkLoginToken(request, response, next) {

    // check if there's a SESSION cookie...
    if (request.cookies.SESSION) {
        redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
            // if we get back a user object, set it on the request. From now on, this request looks like it was made by this user as far as the rest of the code is concerned


            if (user) {
                request.loggedInUser = user;

            }
            next();
        });
    }
    else {
        // if no SESSION cookie, move forward
        next();
    }
}

app.get("/createPost", function(req, res) {
    res.render("createPost.ejs")
});

app.post('/createPost', function(req, res) {
    // before creating content, check if the user is logged in
    if (!req.loggedInUser) {
        // HTTP status code 401 means Unauthorized
        res.status(401).send('You must be logged in to create content!');
    }
    else {
        // here we have a logged in user, let's create the post with the user!
        redditAPI.createPost({
            title: req.body.title,
            url: req.body.url,
            userId: req.loggedInUser.id
        }, 1, function(err, post) {
            // do something with the post object or just response OK to the user :)
            if (err) {
                res.status(500).send("There was an error. Try again later.");
                console.log(err.stack); //so that you can see the error in your terminal
            }
            else {
                res.redirect(`/posts`);
            }
        })
    }
});

app.get('/posts', function(request, response) {

    var sort = null;
    if (request.query) {
        sort = request.query.sort;
    }

    redditAPI.getAllPostsSorted(sort, function(err, posts) {
        if (err) {
            response.status(500).send('try again later');
            console.log(err.stack);
        }
        else {
            // response.send(
            //     posts.map(function(post) {return `<li>${post.title}</li>`; }).join('')
            // );
            // console.log(sort, "THE SORT")
            connection.query(`select count(comment) as count from comments`, function(err, count) {
                console.log(posts);
                response.render('posts-list', {
                    posts: posts,
                    sort: sort,
                    count: count[0].count
                });
            })
        }
    });
});

app.post("/posts", function(req, res) {

    var vote = req.body;
    console.log(vote);
    if (!req.loggedInUser) {
        res.status(401).send('You must be logged in to create content!');
    }
    else {
        redditAPI.createVoteOrUpdateVote(vote, req.loggedInUser.id, function(err, answer) {
            if (err) {
                res.status(500).send(err);
                console.log(err.stack);
            }
            else {
                res.redirect(`/posts?sort=${req.query.sort}`)
            }
        })
    }
})

app.post("/del", function(req, res) {
    res.cookie('SESSION', "", {
        expires: new Date()
    });
    res.redirect('/posts');
})

app.get("/comment", function(req, res) {
    res.render("comment.ejs", {
        postId: req.query.id
    })
})

app.post("/comment", function(req, res) {
    redditAPI.createComment({
        parentId: null,
        comment: req.body.comment,
        userId: req.loggedInUser.id,
        postId: req.body.postId
    }, function(err, post) {
        if (err) {
            res.status(500).send('try again later');
            console.log(err.stack);
        }
        else {
            res.redirect("/posts")
        }
    });
})

app.get("/allcomments", function(req, res) {
    var postId = req.query.id
    console.log(postId)
    redditAPI.getCommentsForPost(postId, function(err, result) {
        if (err) {
            res.status(500).send('try again later');
        }
        else {
            if(!result[0]) {
                res.render("no-comments.ejs")
            }
            else {
                res.render("allcomments.ejs", {
                comments: result,
                title: result[0].title 
            })
            }
            console.log(result);
        }
    });
})



/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
