'use strict'

// start magic after loading the page!!
window.addEventListener("load", handleWindowload);

function handleWindowload() {
    let loginBtn = document.getElementById("loginBtn");
    loginBtn.addEventListener("click", loginUser)
    const urlParams = new URLSearchParams(window.location.search); 
    document.getElementById('user').value = urlParams.get('email');
}

let MsgBox = document.createElement("span");

function loginUser(event) {
    // to ensure that not refreshing before submitting!!
    event.preventDefault();

    // using XMLHTTPREQUEST to connect with API and return our information!!
    let username = document.getElementById("user").value;
    let password = document.getElementById("password").value;
    let inputs = document.getElementById("inpDIV");

    if (username === "" || password === "") {
        MsgBox.textContent = "";
        MsgBox.style.color = "red";
        MsgBox.appendChild(document.createTextNode("All fields are required."));
        inputs.appendChild(MsgBox);
    } else {
        let url = 'https://strategoapi.azurewebsites.net/api/authentication/token';
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let data = xhr.responseText;
                let jsonResponse = JSON.parse(data);
                sessionStorage.setItem("token", jsonResponse.token);
                sessionStorage.setItem("user", jsonResponse.user.nickName);
                sessionStorage.setItem("rank", jsonResponse.user.rank);
                sessionStorage.setItem("score", jsonResponse.user.score);
                window.location.href = "lobby.html";
            }else if(xhr.status !== 200) {
                MsgBox.textContent = "";
                MsgBox.style.color = "red";
                MsgBox.appendChild(document.createTextNode("Email or password wrong."));
                inputs.appendChild(MsgBox);
            }
        };

        // Rocket it,
        xhr.send(JSON.stringify({
            email: username,
            password: password,
        }));
    }
}