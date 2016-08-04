/* global $ */
$(document).ready(function() {

    $('#signUp').submit(function(event) {
        event.preventDefault();
        var $self = $(this);
        var formData = {};

        $self.serializeArray().forEach(function(inputField) {
            formData[inputField.name] = inputField.value;
        });

        if (!formData.username) {
            $(".username-error").text("Please enter a username.");
        }
        else {
            $(".username-error").text("");
        }

        if (!formData.password) {
            $(".password-error").text("Please enter a password.");
        }
        else {
            $(".password-error").text("");
        }

        $.post('/signup', formData, function(res) {

            switch (res.msg) {
                case 'ok-user':
                    window.location = '/login';
                    break;
                case 'error-user':
                    $(".username-error").text("SHIT IS WRONG");
                    break;
                case 'taken':
                    $(".username-error").text("SHIT EXISTS");
                    break;
            }
        })
    });

    $("#logIn").submit(function(event) {
        event.preventDefault()

        var $self = $(this);
        var formData = {};

        $self.serializeArray().forEach(function(inputField) {
            formData[inputField.name] = inputField.value;
        });

        console.log(formData);

        if (!formData.username) {
            $(".username-error").text("Please enter your username.");
        }
        else {
            $(".username-error").text("");
        }

        if (!formData.password) {
            $(".password-error").text("Password enter your password.");
        }
        else {
            $(".password-error").text("");
        }


        $.post("/login", formData, function(res) {
            switch (res.msg) {
                case 'ok':
                    alert("Login successful! Redirecting to Homepage!")
                    window.location = '/posts';
                    break;
                case "none":
                    alert("Password incorrect or user doesn't exist, are you sure you signed up?")
            }
        })

    });

    $("#createPost").submit(function(event) {
        event.preventDefault();
        var $self = $(this);
        var formData = {};

        $self.serializeArray().forEach(function(inputField) {
            formData[inputField.name] = inputField.value;
        });

        if (!formData.url) {
            $(".username-error").text("Please enter a url.");
        }
        else {
            $(".username-error").text("");
        }

        if (!formData.title) {
            $(".password-error").text("Please enter a title or suggest title.");
            return;
        }
        else {
            $(".password-error").text("");
        }

        $.post('/createPost', formData, function(res) {
            switch (res.msg) {
                case 'no-login':
                    alert('You must be logged in to create a post!')
                    window.location= "/login"
                    break;
                case 'ok-create':
                    alert("Post successfully created.")
                    window.location = "/posts"
                    break;
            }
        })
    })



})