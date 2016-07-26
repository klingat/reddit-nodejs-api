var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var secureRandom = require('secure-random');

app.use(bodyParser.urlencoded({
    extended: false
})); //middleware

app.use(cookieParser());

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'klingat',
    password: '',
    database: 'reddit'
});

var reddit = require('./reddit');
var redditAPI = reddit(connection);



app.get('/', function(req, res) {
    res.send('Hello, you fine person.');
});

// app.get('/hello', function(req, res) {
//     console.log('I received a request!');

//     res.send("<h1>Hello world!</h1>");
// });

app.get('/hello', function(req, res) {
    var name = req.query.name;
    if (!name) {
        res.send(`<h1>Hello world.</h1>`);
    }
    else {
        res.send(`<h1>Hello ${name}</h1>`);
    }
});

app.get("/calculator/:op", function(req, res) {

    if (req.params.op === "add") {
        var add = parseFloat(req.query.num1) + parseFloat(req.query.num2);
        res.send({
            operator: req.params.op,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: add
        });
    }
    else if (req.params.op === "sub") {
        var sub = parseFloat(req.query.num1) - parseFloat(req.query.num2);
        console.log(sub);
        res.send({
            operator: req.params.op,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: sub
        });
    }
    else if (req.params.op === "mult") {
        var mult = parseFloat(req.query.num1) * parseFloat(req.query.num2);
        res.send({
            operator: req.params.op,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: mult
        });
    }
    else if (req.params.op === "div") {
        var div = parseFloat(req.query.num1) / parseFloat(req.query.num2);
        res.send({
            operator: req.params.op,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: div
        });
    }
    else {
        res.status(400).send("😟You have to pass a correct operator.");
    }
});

app.get("/posts", function(req, res) {
    connection.query(`select 
        posts.title, 
        posts.url, 
        users.username 
        from posts 
        left join users on users.id=posts.userId 
        order by posts.createdAt desc
        limit 5`, function(err, posts) {
        if (err) {
            res.status(500).send("Try again later.😟");

            console.log(err.stack);
        }
        else {
            function createLi(data) {
                return `
                    <li class="content-item">
                         <h2 class="content-item__title">
                            <a href="${data.url}">${data.title}</a>
                         </h2>
                         <p>Created by ${data.username}</p>
                    </li>
                    `;
            }
            res.send( //if you dont use join at the end it returns it with commas.
                `<div id="contents">
                      <h1 style="color:pink">Welcome to Reddit!!</h1>
                      <ul class="contents-list">
                        ${posts.map(function(item){
                        return createLi(item)}
                        ).join("")
                        }
                      </ul>
                </div>`
            );
        }
    });
});

app.get("/createContent", function(req, res) {
    res.send(`
        <form action="/createContent" method="POST">
             <div>
                <input type="text" name="url" placeholder="Enter a URL to content">
             </div>
             <div>
                <input type="text" name="title" placeholder="Enter the title of your content">
             </div>
             <button type="submit">Create!</button>
        </form>
    `);
});

app.post("/createContent", function(req, res) {
    redditAPI.createPost({
        title: req.body.title,
        url: req.body.url,
        userId: 1
    }, 1, function(err, post) {
        if (err) {
            res.status(500).send("There was an error. Try again later.");
            console.log(err.stack); //so that you can see the error in your terminal
        }
        else {
            res.redirect(`/posts/${post.id}`);
        }
    });
});

app.get("/posts/:ID", function(req, res) {
    var id = req.params.ID;
    connection.query(`select 
        posts.title, 
        posts.url, 
        users.username 
        from posts
        left join users on users.id=posts.userId
        where posts.id=${id}`, function(err, posts) {
        if (err) {
            res.status(400).send("Try again later.");
        }
        else {
            res.send( //if you dont use join at the end it returns it with commas.
                `<h1><a href="${posts[0].url}">${posts[0].title}</a></h1>
                <p>By ${posts[0].username}</p>`
            );
        }
    });
});

app.get("/signup", function(req, res) {
    res.send(`
        <form action="/signup" method="POST">
             <div>
                <input type="text" name="username" placeholder="Enter a username">
             </div>
             <div>
                <input type="password" name="password" placeholder="Enter a password">
             </div>
             <button type="submit">Signup!😎</button>
        </form>
    `);
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
            res.redirect("/posts");
        }
    });
});

app.get("/login", function(req, res) {
    res.send(`
        <form action="/login" method="POST">
             <div>
                <input type="text" name="username" placeholder="Enter your username">
             </div>
             <div>
                <input type="password" name="password" placeholder="Enter your password">
             </div>
             <button type="submit">Login ✅ </button>
        </form>
    `);
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
                    res.redirect('/login');
                    // res.send("hey")
                }
            });
        }
    });
});


/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
