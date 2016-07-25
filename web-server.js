
var express = require('express');
var app = express();

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'klingat',
    password: '',
    database: 'reddit'
});


app.get('/', function (req, res) {
  res.send('Hello, you fine person.');
});


app.get('/hello', function(req, res) {
    console.log('I received a request!');
    
    res.send("<h1>Hello world!</h1>");
});

app.get('/hello', function(req, res) {
    console.log(req.query);
    console.log('I received a name request!');
    
    res.send(`<h1>Hello ${req.query.name}</h1>`);
});

app.get("/op/:operation", function(req, res) {
    console.log(req.params);
    
    if (req.params.operation === "add") {
        var add = Number(req.query.num1) + Number(req.query.num2);
        res.send({
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: add
        })
    }
    else if (req.params.operation === "sub") {
        var sub = Number(req.query.num1) - Number(req.query.num2);
        console.log(sub);
        res.send({
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: sub
        })
    }
    else if (req.params.operation === "mult") {
        var mult = Number(req.query.num1) * Number(req.query.num2);
        res.send({
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: mult
        })
    }
    else if (req.params.operation === "div") {
        var div = Number(req.query.num1) / Number(req.query.num2);
        res.send({
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: div
        })
    }
    else {
        res.sendStatus(405);
    }
});

app.get("/posts", function(req, res) {
    connection.query(`select 
        posts.title, 
        posts.url, 
        users.username 
        from posts 
        left join users on users.id=posts.userId 
        order by posts.createdAt 
        limit 5`, function(err, posts){
            if(err) {
                console.log(err);
            }
            else {
                function createLi(data){
                    return `
                    <li class="content-item">
                          <h2 class="content-item__title">
                            <a href="${data.url}">${data.title}</a>
                          </h2>
                          <p>Created by ${data.username}</p>
                        </li>
                    `
                }
                res.send( //if you dont use join at the end it returns it with commas.
                    `<div id="contents">
                      <h1>List of contents</h1>
                      <ul class="contents-list">
                        ${posts.map(function(item){return createLi(item)}).join("")}
                      </ul>
                    </div>`
                    
                    
                    
                    
                    
                    );
            }
        });
    
    
        
     
})






/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});