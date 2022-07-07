'use strict'

// start magic after loading the page!!
window.addEventListener("load", handleWindowload);

function handleWindowload() {
    let logout = document.getElementById("logout");
    let Quick_play = document.getElementById("quickGame");
    let Normal_play = document.getElementById("normalGame");
    let alert = document.getElementById("alert");
    let info = document.getElementById("info");
    let modal = document.getElementById("myModal");
    let friends = document.getElementById("playWithFriend");
    let sendFriendRequest = document.getElementById("sendFriendRequest");
    let challengeQuickGame = document.getElementById("challengeQuickGame");
    let challengeNormalGame = document.getElementById("challengeNormalGame");
    logout.addEventListener("click", logoutFunction);
    info.addEventListener("click", ShowInformation);
    friends.addEventListener("click", openchallengefriendgames); //ShowFriends
    sendFriendRequest.addEventListener("click", AddFriendWithId);
    challengeQuickGame.addEventListener("click", ShowFriends);
    challengeNormalGame.addEventListener("click", ShowFriends);

    let joined = false;
    let requestsData;
    let friendsData;
    let ChallengesData;
    let ChallengedUser;

    refreshGameIDEverySecond();

    Quick_play.addEventListener("click", function () {
        if (joined === true) {
            let url = 'https://strategoapi.azurewebsites.net/api/waitingpool/leave';
            fetch(url,
                {
                    method: "POST",
                    body: "",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                    }
                })
                .then((data) => {
                    Quick_play.value = "Create Game";
                    alert.style.display = "none";
                    joined = false;
                });
        } else {
            let url = 'https://strategoapi.azurewebsites.net/api/waitingpool/join';
            fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify({
                        "autoMatchCandidates": true,
                        "isQuickGame": true
                    }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                    }
                })
                .then((data) => {
                    Quick_play.value = "Leave Game";
                    alert.style.display = "block";
                    joined = true;
                });


        }

    })

    Normal_play.addEventListener("click", function () {
        if (joined === true) {
            let url = 'https://strategoapi.azurewebsites.net/api/waitingpool/leave';
            fetch(url,
                {
                    method: "POST",
                    body: "",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                    }
                })
                .then((data) => {
                    Normal_play.value = "Play Normal Game";
                    alert.style.display = "none";
                    joined = false;
                });
        } else {
            let url = 'https://strategoapi.azurewebsites.net/api/waitingpool/join';
            fetch(url,
                {
                    method: "POST",
                    body: JSON.stringify({
                        "autoMatchCandidates": true,
                        "isQuickGame": false
                    }),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                    }
                })
                .then((data) => {
                    Normal_play.value = "Leave Game";
                    alert.style.display = "block";
                    joined = true;
                });


        }
    })

    function ShowInformation() {
        document.getElementById("myModal").style.display = "block";
        document.getElementById("CloseBtn").addEventListener("click", function () {
            modal.style.display = "none"
        });
        window.onclick = closeModal;
    }

    function closeModal(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    function ShowFriends(event) {
        let quickGame = true;
        if (event.target.id === "challengeNormalGame") {
            quickGame = false;
        }
        // getOwnID
        let getOwnId = new XMLHttpRequest();
        getOwnId.open("GET", "https://strategoapi.azurewebsites.net/api/waitingpool/candidates/me");
        getOwnId.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        getOwnId.onreadystatechange = function () {
            if (getOwnId.readyState === 4) {
                let ownData = getOwnId.responseText.split("\"")[5];
                if (ownData !== undefined){
                    document.getElementById("ownId").appendChild(document.createTextNode(ownData));
                }
            }
        }
        getOwnId.send();
        //
        let xhr01 = new XMLHttpRequest();
        xhr01.open("GET", "https://strategoapi.azurewebsites.net/api/Friendships/my-friends");
        xhr01.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr01.onreadystatechange = function () {
            if (xhr01.readyState === 4 && xhr01.status === 200) {
                if (document.getElementById("h3") !== null) {
                    document.getElementById("h3").remove();
                }
                let h3 = document.createElement("h3");
                h3.innerText = "Your Friends";
                h3.id = "h3";
                document.getElementsByClassName("modal-body")[1].appendChild(h3);
                friendsData = JSON.parse(xhr01.responseText);
                if (document.getElementById("FriendsTable") !== null) {
                    document.getElementById("FriendsTable").remove();
                } else {
                    document.getElementById("h3").remove();

                }

                if (friendsData.length > 0) {
                    // making all element we need:
                    let table, th, tr, td, text, input;
                    let hoofding = ["ID", "NickName", "Challenge", "Remove"];
                    table = document.createElement("table");
                    table.id = "FriendsTable";
                    tr = document.createElement("tr");
                    // making Header of the table:
                    for (let i = 0; i < hoofding.length; i++) {
                        th = document.createElement("th");
                        text = document.createTextNode(hoofding[i]);
                        th.appendChild(text);
                        tr.appendChild(th);
                    }
                    table.appendChild(tr);

                    for (let i = 0; i < friendsData.length; i++) {
                        tr = document.createElement("tr");
                        td = document.createElement("td");
                        td.appendChild(document.createTextNode(friendsData[i].id));
                        tr.appendChild(td);
                        td = document.createElement("td");
                        td.appendChild(document.createTextNode(friendsData[i].nickName));
                        tr.appendChild(td);
                        td = document.createElement("td");
                        input = document.createElement("input");
                        input.className = "Challenge";
                        input.id = i + "user";
                        input.name = "Challenge";
                        input.value = "Challenge"
                        input.type = "submit";
                        input.onclick = function () {
                            ChallengeFriend(friendsData[i].id);
                        };
                        td.appendChild(input);
                        tr.appendChild(td);
                        td = document.createElement("td");
                        input = document.createElement("input");
                        input.className = "removeFriend";
                        input.id = i + "user";
                        input.name = "removeFriend";
                        input.value = "Remove"
                        input.type = "submit";
                        input.onclick = removeFriend;
                        td.appendChild(input);
                        tr.appendChild(td);
                        table.appendChild(tr);
                    }
                    document.getElementsByClassName("modal-body")[1].appendChild(table);
                }
            }
        }
        xhr01.send();

        let xhr02 = new XMLHttpRequest();
        xhr02.open("GET", "https://strategoapi.azurewebsites.net/api/Friendships/my-friend-requests");
        xhr02.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr02.onreadystatechange = function () {
            if (xhr02.readyState === 4 && xhr02.status === 200) {
                if (document.getElementById("FriendsRequestTable") !== null) {
                    document.getElementById("h3Req").remove();
                    document.getElementById("FriendsRequestTable").remove();
                }

                let h3 = document.createElement("h3");
                h3.innerText = "Friends Requests:";
                h3.style.padding = "20px"
                h3.id = "h3Req"
                document.getElementById("FriendsRequest").appendChild(h3);
                requestsData = JSON.parse(xhr02.responseText);
                let table, th, tr, td, text, input;
                let hoofding = ["Id", "NickName", "Status"];
                table = document.createElement("table");
                table.id = "FriendsRequestTable";
                tr = document.createElement("tr");
                // making Header of the table:
                for (let i = 0; i < hoofding.length; i++) {
                    th = document.createElement("th");
                    text = document.createTextNode(hoofding[i]);
                    th.appendChild(text);
                    th.style.backgroundColor = "#d6d6d6";
                    tr.appendChild(th);
                }
                table.appendChild(tr);

                for (let i = 0; i < requestsData.length; i++) {
                    tr = document.createElement("tr");
                    td = document.createElement("td");
                    td.appendChild(document.createTextNode(requestsData[i].id));
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.appendChild(document.createTextNode(requestsData[i].nickName));
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.appendChild(document.createTextNode("Waiting"));
                    tr.appendChild(td);
                    td = document.createElement("td");
                    input = document.createElement("input");
                    input.className = "AcceptFriend";
                    input.id = i + "user";
                    input.name = "AcceptFriend";
                    input.value = "Accept"
                    input.type = "submit";
                    input.onclick = AcceptFriendWithID;
                    td.appendChild(input);
                    tr.appendChild(td);
                    table.appendChild(tr);
                }
                document.getElementById("FriendsRequest").appendChild(table);
            }
        }
        xhr02.send();

        setInterval(function () {
            let xhr03 = new XMLHttpRequest();
            xhr03.open("GET", "https://strategoapi.azurewebsites.net/api/WaitingPool/candidates/challenging-me");
            xhr03.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
            xhr03.onreadystatechange = function () {
                if (xhr03.readyState === 4 && xhr03.status === 200) {
                    if (document.getElementById("ChallengesRequestTable") !== null) {
                        document.getElementById("ChallengesRequestTable").remove();
                        document.getElementById("h3Challenge").remove();
                    }

                    let h3 = document.createElement("h3");
                    h3.innerText = "Your Challenges :";
                    h3.style.padding = "20px";
                    h3.id = "h3Challenge"
                    document.getElementById("Challenges").appendChild(h3);
                    ChallengesData = JSON.parse(xhr03.responseText);
                    let table, th, tr, td, text, input;
                    let hoofding = ["Id", "NickName", "Accept"];
                    table = document.createElement("table");
                    table.id = "ChallengesRequestTable";
                    tr = document.createElement("tr");
                    // making Header of the table:
                    for (let i = 0; i < hoofding.length; i++) {
                        th = document.createElement("th");
                        text = document.createTextNode(hoofding[i]);
                        th.appendChild(text);
                        th.style.backgroundColor = "#d6d6d6";
                        tr.appendChild(th);
                    }
                    table.appendChild(tr);

                    for (let i = 0; i < ChallengesData.length; i++) {
                        tr = document.createElement("tr");
                        td = document.createElement("td");
                        td.appendChild(document.createTextNode(ChallengesData[i].user.id));
                        tr.appendChild(td);
                        td = document.createElement("td");
                        td.appendChild(document.createTextNode(ChallengesData[i].user.nickName));
                        tr.appendChild(td);
                        td = document.createElement("td");
                        input = document.createElement("input");
                        input.className = "AcceptChallenge";
                        input.id = i + "user";
                        input.name = "AcceptChallenge";
                        input.value = "Accept"
                        input.type = "submit";
                        input.onclick = function () {
                            ChallengeFriend(ChallengesData[i].user.id, quickGame);
                        };
                        td.appendChild(input);
                        tr.appendChild(td);
                        table.appendChild(tr);
                    }
                    document.getElementById("Challenges").appendChild(table);
                }
            }
            xhr03.send();
        }, 1000);

        let url = 'https://strategoapi.azurewebsites.net/api/waitingpool/join';
        fetch(url,
            {
                method: "POST",
                body: JSON.stringify({
                    "autoMatchCandidates": false,
                    "isQuickGame": quickGame
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                }
            })
            .then((data) => {
                joined = true;
            })

        document.getElementById("FriendsModal").style.display = "block";
        document.getElementById("CloseBtnFriend").addEventListener("click", function () {
            let url = 'https://strategoapi.azurewebsites.net/api/waitingpool/leave';
            joined = false;
            fetch(url,
                {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem("token")
                    }
                })
                .then((data) => {
                })
            document.getElementById("FriendsModal").style.display = "none"
        })
        document.getElementById("myForm").style.display = "none";

    }

    refreshGameIDEverySecond();

    function AddFriendWithId() {
        let FriendId = document.getElementById("FriendIdInput").value;
        let dataGame;
        let xhr02 = new XMLHttpRequest();
        xhr02.open("POST", "https://strategoapi.azurewebsites.net/api/Friendships/request/" + FriendId);
        xhr02.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr02.onreadystatechange = function () {
            if (xhr02.status === 200) {
                document.getElementById("msgFriend").style.color = "Green";
                document.getElementById("msgFriend").innerText = "Sent Successfully!"
            } else {
                dataGame = JSON.parse(xhr02.responseText);
                document.getElementById("msgFriend").style.color = "Red";
                if (dataGame.message === undefined) {
                    document.getElementById("msgFriend").innerText = "User Id doesn't exist!"
                } else {
                    document.getElementById("msgFriend").innerText = dataGame.message;
                }
            }
        }
        xhr02.send();
    }

    function AcceptFriendWithID() {
        let id = requestsData[parseInt(event.target.id)].id;
        let dataGame;
        let xhr03 = new XMLHttpRequest();
        xhr03.open("POST", "https://strategoapi.azurewebsites.net/api/Friendships/confirm/" + id);
        xhr03.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr03.onreadystatechange = function () {
            if (xhr03.status === 200) {
                document.getElementById("msgFriend").style.color = "Green";
                document.getElementById("msgFriend").innerText = "Friendship is Confirmed!"
            } else {
                dataGame = JSON.parse(xhr03.responseText);
                document.getElementById("msgFriend").style.color = "Red";
                if (dataGame.message === undefined) {
                    document.getElementById("msgFriend").innerText = "User Id doesn't exist!"
                } else {
                    document.getElementById("msgFriend").innerText = dataGame.message;
                }
            }
        }
        xhr03.send();
    }

    function removeFriend() {
        let id = friendsData[parseInt(event.target.id)].id;
        let xhr03 = new XMLHttpRequest();
        xhr03.open("POST", "https://strategoapi.azurewebsites.net/api/Friendships/remove/" + id);
        xhr03.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr03.onreadystatechange = function () {
            if (xhr03.readyState === 4) {
                event.target.value = "Removed";
            }
        }
        xhr03.send();
    }

    function ChallengeFriend(id) {
        let xhr01 = new XMLHttpRequest();
        xhr01.open("POST", "https://strategoapi.azurewebsites.net/api/WaitingPool/challenge");
        xhr01.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr01.setRequestHeader("Content-Type", "application/json");
        xhr01.onreadystatechange = function () {
        }
        let data01 = `{
                "targetUserId": "` + id + `"}`;
        xhr01.send(data01);
    }

    function refreshGameIDEverySecond() {
        let seconds = 0;
        let gameFound = false;
        let count = 1;
        setInterval(function () {
            if (joined === true) {
                let url = "https://strategoapi.azurewebsites.net/api/waitingpool/candidates/me";
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
                let gameID;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (!gameFound) {
                            gameID = JSON.parse(xhr.responseText).gameId;
                            if (gameID !== "00000000-0000-0000-0000-000000000000") {
                                sessionStorage.setItem("gameID", gameID);
                                gameFound = true;
                                seconds = 3;
                                count = -1;
                                alert.style.backgroundColor = "red";
                                alert.innerText = document.createTextNode("Game Found! Redirecting you in " + seconds + "...").textContent;
                            } else {
                                alert.innerText = document.createTextNode("LOOKING FOR A QUICK GAME!. (" + seconds + ") Sec").textContent;
                            }
                        } else {
                            alert.innerText = document.createTextNode("Game Found! Redirecting you in " + seconds + "...").textContent;
                            if (seconds === 0) {
                                window.location.href = "board.html";
                            }
                        }
                    }
                };
                xhr.send();
                seconds += count;
            }
        }, 1000);
    }

    function openchallengefriendgames() {
        if (document.getElementById("myForm").style.display === "block") {
            document.getElementById("myForm").style.display = "none";
        } else {
            document.getElementById("myForm").style.display = "block";
        }
        document.getElementById("CloseBtnChallenge").addEventListener("click", function () {
            document.getElementById("myForm").style.display = "none";
        });
    }
}


// this code to remove the token from session and logout normally..!!
function logoutFunction() {
    sessionStorage.clear();
    window.location.replace("index.html");
}