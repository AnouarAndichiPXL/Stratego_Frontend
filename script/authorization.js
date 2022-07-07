'use strict'
// this code to ensure that user has already logged in before start to use our site!!
if (sessionStorage.getItem("token") === "undefined" || sessionStorage.getItem("token") === null) {
    window.location.replace("index.html");
}
