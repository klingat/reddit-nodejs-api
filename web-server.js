
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello, you fine person.');
});


// app.get('/hello', function(req, res) {
//     console.log('I received a request!');
    
//     res.send("<h1>Hello world!</h1>");
// });

app.get('/hello', function(req, res) {
    console.log(req.query);
    console.log('I received a name request!');
    
    res.send(`<h1>Hello ${req.query.name}</h1>`);
});

app.get("/op/:operation", function(req, res) {
    console.log(req.params);
    
    if (req.params.operation === "add") {
        var add = Number(req.query.num1) + Number(req.query.num2);
        // res.send(`${add}`);
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

// app.get('/money/:account', function(request, response) {
    
//     var amount = request.query.amount;
    
    
//     if (!amount) {
//         response.send('you have to tell me how much you want');
//     }
//     else if (request.query.amount <= balance) {
        
//         balance = balance - request.query.amount;
        
//         response.send(
//             `
//             ok here you go! here are ${request.query.amount}
//             remaining balance: ${balance};
//             `
//         );
        
//         console.log('dispensed ' + request.query.amount + '$ from ' + request.params.account + ' remaining: ' + balance);
//     }
//     else {
//         response.send('i dont have enough');
//     }
// });





/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});