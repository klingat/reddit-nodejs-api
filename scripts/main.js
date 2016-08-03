/* global $ */
$(document).ready(function() {
    var username = $("#username").val();
    
    if (!username) {
        $(".username-error").text("Please enter a username.");
    }
    
    var password = $("#password").val();
    
    if(!password) {
        $(".password-error").text("Please enter a password.");
    } 
})