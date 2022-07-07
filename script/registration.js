'use strict'

// start magic after loading the page!!
window.addEventListener("load", handleWindowload);

function handleWindowload() {
    let registerUserBtn = document.getElementById("registerUserBtn");
    registerUserBtn.addEventListener("click", registerUser)
}

let MsgBox = document.createElement("span");

function registerUser(event) {
    event.preventDefault();
    let email = document.getElementById("email").value;
    let nickname = document.getElementById("user").value;
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;
    let inputs = document.getElementById("inpDIV");

    //validation form
    if ((email === "" || password === "" || nickname === "") || password !== password2) {
        // Confirm password
        if (password !== password2) {
            MsgBox.textContent = "";
            MsgBox.style.color = "red";
            MsgBox.appendChild(document.createTextNode("Your password and confirmation password do not match."));
            inputs.appendChild(MsgBox);
        } else {
            MsgBox.textContent = "";
            MsgBox.style.color = "red";
            MsgBox.appendChild(document.createTextNode("All fields are required."));
            inputs.appendChild(MsgBox);
        }
    // after validation register new account
    } else {
        let url = 'https://strategoapi.azurewebsites.net/api/authentication/register';
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                MsgBox.textContent = "";
                MsgBox.style.color = "Green";
                MsgBox.appendChild(document.createTextNode("Registered Successfully!! we redirect you to the login page! After 5sec."));
                inputs.appendChild(MsgBox);
                setTimeout(function(){ window.location="index.html?email=" + email; },5000);
            }
        };

        //Rocket it,
        xhr.send(JSON.stringify({
            email: email,
            password: password,
            nickName: nickname,
        }));
    }
}