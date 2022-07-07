'use strict'

// start magic after loading the page!!
window.addEventListener("load", handleWindowload);
let gameID = sessionStorage.getItem("gameID");
let movedPiece = false;
let gameIsOver = false;
let IsuploadPositions = false;
let modal;
let span;
let modalHeader;
let msgWinner;
let modalFooter;
let randomPositionsButton;
let squares;
let dataGame;
let prevPositions;
let prevpossibleTargets;


function handleWindowload() {
    let root = document.documentElement;
    let ready = document.getElementById("ready");
    let target = document.getElementById('grid-boardgame')
    let downloadPositions = document.getElementById("downloadPositions");
    let uploadPositions = document.getElementById("uploadPositions");
    let fileUpload = document.getElementById("fileUpload");
    let leaveTheGame = document.getElementById("leaveTheGame");
    modal = document.getElementById("myModal");
    span = document.getElementsByClassName("close")[0];
    modalHeader = document.getElementById("modalHeader");
    msgWinner = document.getElementById("msgWinner");
    modalFooter = document.getElementById("modalFooter");
    randomPositionsButton = document.getElementById("randomPositions");

    let boardSize;
    let dataBoard

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://strategoapi.azurewebsites.net/api/game/" + gameID + "/board");
    xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            dataBoard = JSON.parse(xhr.responseText);
            boardSize = dataBoard.size;
            // you can get information from data variable => check Swagger to know what u need and what u gona get from here.
            squares = dataBoard.squares;
        }
    }
    xhr.send();


    let xhr01 = new XMLHttpRequest();
    xhr01.open("GET", "https://strategoapi.azurewebsites.net/api/game/" + gameID);
    xhr01.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
    xhr01.onreadystatechange = function () {
        if (xhr01.readyState === 4) {
            dataGame = JSON.parse(xhr01.responseText);
        }
    }
    xhr01.send();

    setTimeout(function () {
        root.style.setProperty('--boardgame-size', boardSize)
        for (let j = 0; j < squares.length; j++) {
            for (let k = 0; k < squares[0].length; k++) {
                let row = j;
                let column = k;
                let newLink = document.createElement('div');
                newLink.classList.add('empty');
                newLink.setAttribute('ondrop', 'drop(event)');
                newLink.setAttribute('ondragover', 'allowDrop(event)')
                newLink.id = row + "" + column;
                if (squares[j][k].isBlueHomeTerritory) {
                    newLink.classList.add('blue');
                } else if (squares[j][k].isRedHomeTerritory) {
                    newLink.classList.add('red');
                } else if (squares[j][k].isObstacle) {
                    newLink.classList.add('water');
                }
                target.appendChild(newLink);
            }
        }
        if (!dataGame.ownPlayerIsReady) {
            let boardTarget = document.getElementById('grid-boardpieces');
            for (let i = 0; i < dataGame.ownLivingPieces.length; i++) {
                let boardPiece = document.createElement('div');
                if (dataGame.ownColorIsRed) {
                    boardPiece.innerHTML = '<img draggable="true" class="fill" src="style/images/red/' + dataGame.ownLivingPieces[i].name + '.png" ondragstart="drag(event)" id="' + dataGame.ownLivingPieces[i].id + '" >'
                } else {
                    boardPiece.innerHTML = '<img draggable="true" class="fill" src="style/images/blue/' + dataGame.ownLivingPieces[i].name + '.png" ondragstart="drag(event)" id="' + dataGame.ownLivingPieces[i].id + '">'
                }
                boardPiece.classList.add('box');
                boardTarget.appendChild(boardPiece);
            }
        }
    }, 1000)

    ready.addEventListener("click", function () {
        let xhr03 = new XMLHttpRequest();
        xhr03.open("POST", "https://strategoapi.azurewebsites.net/api/Game/" + gameID + "/ready");
        xhr03.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr03.setRequestHeader("Content-Type", "application/json");
        xhr03.onreadystatechange = function () {
            if (xhr03.status === 200) {
                playStartSound();
            }
            setTimeout(function () {
                updateOwnArmy();
            }, 1000);
        }
        xhr03.send();
    });

    downloadPositions.addEventListener("click", function () {
        let download = new XMLHttpRequest();
        let allowed = true;
        download.open("POST", "https://strategoapi.azurewebsites.net/api/Game/" + gameID + "/download-army-positions");
        download.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        download.setRequestHeader("Content-Type", "application/json");
        download.onreadystatechange = function () {
            if (download.readyState === 4) {
                let file = "";
                let piece = download.responseText.split("\n");
                for (let i = 0; i < piece.length - 1; i++) {
                    let positions = piece[i].split(",")
                    // position lenth === 3 : id + army name without positions => not allowed to download.
                    if (positions.length === 3) {
                        allowed = false;
                    }
                    file += positions[1] + "," + positions[2] + "," + positions[3] + "\n";
                }
                // Start file download.
                if (allowed) {
                    if (dataGame.ownColorIsRed) {
                        downloadFile("Red_Positions.txt", file);
                    } else {
                        downloadFile("Blue_Positions.txt", file);
                    }
                }else {
                    let info = document.getElementById("errorsHandel");
                    let p = document.createElement("p");
                    p.appendChild(document.createTextNode("You have to place all pices in order to dowloand positions!"));
                    p.classList.add("msg");
                    while (info.firstChild) {
                        info.firstChild.remove();
                    }
                    info.appendChild(p);
                }
            }
        }
        download.send();
    })

    uploadPositions.addEventListener("click", function () {
        document.getElementById("myForm").style.display = "block";
    })

    fileUpload.addEventListener("click", function () {
        let file0 = document.getElementById("file").files[0]; // get file from input.
        let file1 = "";
        let file;
        let result = "";
        let finalFile;
        let fr = new FileReader(); // to read file.
        fr.onload = function () {
            let piece = fr.result.split("\n"); // to make array from the readed string -> easy to work with arrays.
            for (let i = 0; i < piece.length - 1; i++) {
                let positions = piece[i].split(",")
                //check if the same name so spy take spy positions and spy id and ...
                for (let j = 0; j < dataGame.ownLivingPieces.length; j++) {
                    if (dataGame.ownLivingPieces[j].name === positions[0]) {
                        result += dataGame.ownLivingPieces[i].id + "," + positions + "\n";
                    }
                }
                // remove duplicated pieces
                finalFile = result.split("\n").filter(function (item, index, inputArray) {
                    return inputArray.indexOf(item) == index;
                });

            }
            for (let i = 0; i < finalFile.length - 1; i++) {
                let string = finalFile[i].split(",");
                file1 += string[0] + "," + string[1] + "," + string[2] + "," + string[3] + "\n"
            }
            // file to upload.
            file = new Blob([file1], {type: "text/plain"});
            file.lastModifiedDate = new Date();
            file.name = "ArmyPositions";
            // ...................................
            let formData = new FormData();
            formData.append("file", file);
            let xhr01 = new XMLHttpRequest();
            xhr01.open("POST", "https://strategoapi.azurewebsites.net/api/game/" + gameID + "/upload-army-positions");
            xhr01.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
            xhr01.onreadystatechange = function () {
                if (xhr01.readyState === 4) {
                    IsuploadPositions = true;
                    document.getElementById("myForm").style.display = "none";
                    setTimeout(function () {
                        updateOwnArmy();
                    }, 1000);
                }
            }
            xhr01.send(formData);
        }
        fr.readAsText(file0);
    })

    leaveTheGame.addEventListener("click", function () {
        window.location.href = "lobby.html";
        sessionStorage.removeItem("gameID");
        sessionStorage.setItem("time", NaN);
    })

    randomPositionsButton.addEventListener("click", function () {
        randomPositions();
        clearAsideBoardpieces(true);
        setTimeout(function () {
            updateOwnArmy();
        }, 1000)
    })

}

function updateOwnArmy() {
    for (let i = 0; i < squares.length; i++) {
        for (let j = 0; j < squares[0].length; j++) {
            if (!squares[i][j].isObstacle && squares[i][j].isRedHomeTerritory === dataGame.ownColorIsRed) {
                if (document.getElementById(i + "" + j).childElementCount !== 0) {
                    document.getElementById(i + "" + j).firstChild.remove();
                }
            }
        }
    }
    for (let i = 0; i < dataGame.ownLivingPieces.length; i++) {
        if (dataGame.ownLivingPieces[i] !== null && dataGame.ownLivingPieces[i].position !== null) {
            let targetOwnLivingPieces = document.getElementById(dataGame.ownLivingPieces[i].position.row + "" + dataGame.ownLivingPieces[i].position.column);
            if (dataGame.ownColorIsRed) {
                targetOwnLivingPieces.innerHTML = '<img  draggable="true" class="fill" src="style/images/red/' + dataGame.ownLivingPieces[i].name + '.png" ondragstart="drag(event)" id="' + dataGame.ownLivingPieces[i].id + '" >'
            } else {
                targetOwnLivingPieces.innerHTML = '<img draggable="true" class="fill" src="style/images/blue/' + dataGame.ownLivingPieces[i].name + '.png" ondragstart="drag(event)" id="' + dataGame.ownLivingPieces[i].id + '">'
            }
        }
    }
}

let everySecond = setInterval(function () {
    if (dataGame.ownPlayerIsReady) {
        while (document.getElementById("rightSide").firstChild) {
            document.getElementById("rightSide").firstChild.remove();
        }
    }
    if (dataGame.isStarted) {
        let xhr02 = new XMLHttpRequest();
        let msg = "";

        xhr02.open("GET", "https://strategoapi.azurewebsites.net/api/game/" + gameID + "/last-move");
        xhr02.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
        xhr02.onreadystatechange = function () {
            if (xhr02.readyState === 4 && xhr02.status === 200) {
                let lastmoveData = JSON.parse(xhr02.responseText);
                if (!lastmoveData.piece.isAlive && !lastmoveData.targetPiece.isAlive) {
                    let target = document.getElementById(lastmoveData.to.row + "" + lastmoveData.to.column);
                    let piece = document.getElementById(lastmoveData.from.row + "" + lastmoveData.from.column);
                    if (target.firstChild != null) {
                        while (target.firstChild) {
                            target.firstChild.remove();
                        }
                        while (piece.firstChild) {
                            piece.firstChild.remove();
                        }
                    }
                    msg = `The two ${lastmoveData.piece.name}s both died in battle.`;
                } else if (!lastmoveData.piece.isAlive) {
                    if (document.getElementById(lastmoveData.from.row + "" + lastmoveData.from.column).firstChild != null) {
                        let piece = document.getElementById(lastmoveData.from.row + "" + lastmoveData.from.column).firstChild;
                        piece.remove();
                    }
                    if (lastmoveData.targetPiece.name === "Bomb") {
                        msg = `The ${lastmoveData.piece.name}(${lastmoveData.piece.strength}) got blown up by a bomb`;
                    } else {
                        msg = `The ${lastmoveData.piece.name}(${lastmoveData.piece.strength}) died while fighting the ${lastmoveData.targetPiece.name}(${lastmoveData.targetPiece.strength}).`;
                    }

                } else if (lastmoveData.targetPiece !== null) {
                    if (document.getElementById(lastmoveData.from.row + "" + lastmoveData.from.column).firstChild != null) {
                        if (!lastmoveData.targetPiece.isAlive && lastmoveData.piece.id !== document.getElementById(lastmoveData.from.row + "" + lastmoveData.from.column).firstChild.id) {
                            let target = document.getElementById(lastmoveData.to.row + "" + lastmoveData.to.column).firstChild;
                            let piece = document.getElementById(lastmoveData.from.row + "" + lastmoveData.from.column).firstChild;
                            target.parentElement.appendChild(piece);
                            target.remove();
                        }
                    }
                    if (lastmoveData.targetPiece.name === "Bomb") {
                        msg = `The ${lastmoveData.piece.name}(${lastmoveData.piece.strength}) defused the bomb`;
                    } else if (lastmoveData.targetPiece.name === "Marshal") {
                        msg = `The ${lastmoveData.piece.name}(${lastmoveData.piece.strength}) Assassinated the Marshal(10)`;
                    } else {
                        msg = `The ${lastmoveData.piece.name}(${lastmoveData.piece.strength}) was victorious over the weaker ${lastmoveData.targetPiece.name}(${lastmoveData.targetPiece.strength}).`;
                    }
                }

                let info = document.getElementById("errorsHandel");
                let p = document.createElement("p");
                p.innerText = msg;
                p.classList.add("msg");
                while (info.firstChild) {
                    info.firstChild.remove();
                }
                info.appendChild(p);

            }
        }
        xhr02.send();
    }


    let xhr01 = new XMLHttpRequest();
    xhr01.open("GET", "https://strategoapi.azurewebsites.net/api/game/" + gameID);
    xhr01.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
    xhr01.onreadystatechange = function () {
        if (xhr01.readyState === 4) {
            dataGame = JSON.parse(xhr01.responseText);
            for (let i = 0; i < dataGame.opponentLivingPieceCoordinates.length; i++) {
                if (dataGame.opponentLivingPieceCoordinates[i] !== null && document.getElementById(dataGame.opponentLivingPieceCoordinates[i].row + "" + dataGame.opponentLivingPieceCoordinates[i].column).childElementCount === 0) {
                    let imgOpponent = document.createElement("img");
                    imgOpponent.className = "fillAlt";
                    imgOpponent.draggable = false;
                    if (dataGame.ownColorIsRed) {
                        imgOpponent.src = "./style/images/blue/tower.png";
                    } else {
                        imgOpponent.src = "./style/images/red/tower.png";
                    }
                    document.getElementById(dataGame.opponentLivingPieceCoordinates[i].row + "" + dataGame.opponentLivingPieceCoordinates[i].column).appendChild(imgOpponent);
                    if (prevPositions !== undefined && prevPositions[i] !== dataGame.opponentLivingPieceCoordinates[i]) {
                        if (prevPositions[i] != null) {
                            document.getElementById(prevPositions[i].row + "" + prevPositions[i].column).firstChild.remove();
                        }
                    }
                }
            }
            prevPositions = dataGame.opponentLivingPieceCoordinates;
            if (dataGame.isStarted || dataGame.ownPlayerIsReady) {
                for (let i = 0; i < dataGame.ownLivingPieces.length; i++) {
                    if (dataGame.ownLivingPieces[i] !== null) {
                        let targetOwnLivingPieces = document.getElementById(dataGame.ownLivingPieces[i].position.row + "" + dataGame.ownLivingPieces[i].position.column);
                        if (dataGame.ownColorIsRed) {
                            targetOwnLivingPieces.innerHTML = '<img alt="Army" name="' + dataGame.ownLivingPieces[i].name + '" draggable="true" class="fill" src="style/images/red/' + dataGame.ownLivingPieces[i].name + '.png" ondragstart="drag(event)" id="' + dataGame.ownLivingPieces[i].id + '"  onclick="possibleTargets(event)" >'
                        } else {
                            targetOwnLivingPieces.innerHTML = '<img alt="Army" name="' + dataGame.ownLivingPieces[i].name + '" draggable="true" class="fill" src="style/images/blue/' + dataGame.ownLivingPieces[i].name + '.png" ondragstart="drag(event)" id="' + dataGame.ownLivingPieces[i].id + '"  onclick="possibleTargets(event)">'
                        }
                    }
                }
            }

            if (dataGame.ownPlayerIsReady && !dataGame.isStarted) {
                let info = document.getElementById("errorsHandel");
                let p = document.createElement("p");
                p.innerText = "Waiting other player to be ready.";
                p.classList.add("msg");
                while (info.firstChild) {
                    info.firstChild.remove();
                }
                info.appendChild(p);


            }
            if (dataGame.isStarted) {
                let playerTurn = document.getElementById("playerTurn");
                playerTurn.style.color = "green";
                playerTurn.style.textAlign = "center"
                playerTurn.style.fontWeight = "bold";
                playerTurn.style.fontFamily = "'Share Tech Mono', monospace";
                playerTurn.style.padding = "5px";

                if (dataGame.isYourTurn) {
                    playerTurn.innerText = "Its Your Turn!";
                } else {
                    playerTurn.innerText = "Its Enemy Turn!";
                }
                if (gameIsOver === false) {
                    if (sessionStorage.getItem("time") === "NaN") {
                        sessionStorage.setItem("time", 1);
                    }
                    let seconds = parseInt(sessionStorage.getItem("time"))
                    seconds++;
                    sessionStorage.setItem("time", seconds);
                }
                document.getElementById("gameinfo").style.marginBottom = "5px";
                document.getElementById("gameinfo").innerText = "Time : " + format(sessionStorage.getItem("time")) + " Seconds.";
            }
        }
    }
    xhr01.send();
    if (dataGame.opponentArmyIsDefeated) {
        gameIsOver = true;
        playWinnerSound();
        modalHeader.innerText = "You Are The Winner !";
        msgWinner.innerText = "You are a genuine, You won this game and you will win more!";
        modalFooter.innerText = "Total time spent in game : " + format(sessionStorage.getItem("time")) + " seconds";
        modal.style.display = "block";
        // When the user clicks on <span> (x), close the modal
        span.onclick = closeWinnerModal;
        // When the user clicks anywhere outside , close it
        window.onclick = closeWinnerModal;
        // Stop Interval function
        clearInterval(everySecond);

    } else if (dataGame.ownArmyIsDefeated) {
        gameIsOver = true;
        playLoserSound();
        modalHeader.parentElement.style.backgroundColor = "red";
        modalFooter.parentElement.style.backgroundColor = "red";
        modalHeader.innerText = "You lose this battle!";
        msgWinner.innerText = "You lose this battle, But not the War! you can make it next time.";
        modalFooter.innerText = "Total time spent in game : " + format(sessionStorage.getItem("time")) + " seconds";
        modal.style.display = "block";
        // When the user clicks on <span> (x), close the modal
        span.onclick = closeWinnerModal;
        // When the user clicks anywhere outside , close it
        window.onclick = closeWinnerModal;
        // Stop Interval function
        clearInterval(everySecond);
    }
}, 1000);


let stateGame = "building"

function allowDrop(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "all";
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {

    let pieceId = ev.dataTransfer.getData("text");
    let xhr02 = new XMLHttpRequest();
    let textUrl;

    if (ev.target.hasChildNodes()) {
        return;
    }
    if (dataGame.isStarted) {
        if (ev.target.id.length > 2) {
            return;
        } // stop killing teammates
        textUrl = "move-piece/";
    } else {
        textUrl = "position-piece/";
    }

    xhr02.open("POST", "https://strategoapi.azurewebsites.net/api/Game/" + gameID + "/" + textUrl);
    xhr02.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
    xhr02.setRequestHeader("Content-Type", "application/json");
    xhr02.onreadystatechange = function () {
        if (xhr02.readyState === 4 && xhr02.status === 200) {
            if (ev.target.nodeName === 'IMG' && textUrl === "position-piece/") {

                let sourceIMG = ev.target;
                let newIMG = document.getElementById(pieceId);
                let originalDiv = newIMG.parentElement;
                sourceIMG.parentElement.appendChild(newIMG);
                originalDiv.appendChild(sourceIMG);
            } else if (ev.target.nodeName === 'IMG' && textUrl === "move-piece/") {
                playKillSound();
                movedPiece = true;
                let targetIMG = ev.target;
                let attackerIMG = document.getElementById(pieceId);
                let targetDIV = targetIMG.parentElement;
                targetDIV.appendChild(attackerIMG);
                setTimeout(function () {
                    for (let i = 0; i < dataGame.ownFallenPieces.length; i++) {
                        if (dataGame.ownFallenPieces[i] !== undefined && attackerIMG.id === dataGame.ownFallenPieces[i].id) {
                            attackerIMG.remove();
                        }
                    }

                }, 3000);
            } else {
                ev.target.appendChild(document.getElementById(pieceId));
            }
        }
        let info = document.getElementById("errorsHandel");
        if (xhr02.status === 400) {
            let msg = xhr02.responseText.split("\"")[3];
            let p = document.createElement("p");
            p.innerText = msg;
            p.classList.add("msg");
            if (!dataGame.ownColorIsRed) {
                p.style.color = "blue";
                p.style.textShadow = "0 0 5px #FFF, 0 0 10px #FFF, 0 0 15px #FFF, 0 0 20px #4cadf8, 0 0 30px #4cadf8, 0 0 40px #4cadf8, 0 0 55px #4cadf8, 0 0 75px #4cadf8, 2px 2px 2px rgba(19,124,206,0)!important";
            }
            while (info.firstChild) {
                info.firstChild.remove();
            }
            info.appendChild(p);
        } else if (xhr02.status === 200) {
            while (info.firstChild) {
                info.firstChild.remove();
            }
        }
    }
    let positions;
    if (ev.target.nodeName === 'IMG') {
        positions = ev.target.parentElement.id;

    } else if (ev.target.nodeName === 'DIV') {
        positions = ev.target.id;
    }
    let data = `{
  "pieceId": "` + pieceId.toString() + `",
  "targetCoordinate": {
    "row": ` + positions[0] + ` ,
    "column": ` + positions[1] + `
  }
}`;
    xhr02.send(data);
}

function format(time) {
    // Hours, minutes and seconds
    let hrs = ~~(time / 3600);
    let mins = ~~((time % 3600) / 60);
    let secs = ~~time % 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + " minutes and " + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

function closeWinnerModal(event) {
    if (event.target === modal) {
        window.location.href = "lobby.html";
        sessionStorage.removeItem("gameID");
        modal.style.display = "none";
        sessionStorage.setItem("time", NaN);
    }
}

function downloadFile(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function randomPositions() {
    let xhr01 = new XMLHttpRequest();
    xhr01.open("POST", "https://strategoapi.azurewebsites.net/api/game/" + gameID + "/position-all-pieces");
    xhr01.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
    xhr01.onreadystatechange = function () {
    }
    xhr01.send();
}

function playStartSound() {
    document.getElementById("Start").play();
}

function playKillSound() {
    document.getElementById("Kill").play();
}

function playWinnerSound() {
    document.getElementById("Winner").play();
}

function playLoserSound() {
    document.getElementById("Loser").play();
}

function possibleTargets(ev) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://strategoapi.azurewebsites.net/api/game/" + gameID + "/pieces/" + ev.target.id + "/possible-targets");
    xhr.setRequestHeader("Authorization", 'Bearer ' + sessionStorage.getItem("token"));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let possibleTargets = JSON.parse(xhr.responseText);
            if (prevpossibleTargets !== undefined) {
                for (let i = 0; i < prevpossibleTargets.length; i++) {
                    let target = document.getElementById(prevpossibleTargets[i].row + "" + prevpossibleTargets[i].column);
                    target.classList.remove("green");
                }
            }
            for (let i = 0; i < possibleTargets.length; i++) {
                let target = document.getElementById(possibleTargets[i].row + "" + possibleTargets[i].column);
                if (!(ev.target.name === "Bomb" || ev.target.name === "Flag")) {
                    if (target.childElementCount === 0) {
                        target.classList.add("green");
                        setTimeout(function () {
                            target.classList.remove("green");
                        }, 3000)
                    }
                    prevpossibleTargets = possibleTargets;
                }
            }
        }
    }
    xhr.send();
}

function clearAsideBoardpieces(everything) {
    let boxes = document.getElementById("grid-boardpieces").children
    if (everything) {
        for (let i = 0; i < boxes.length; i++) {
            if (boxes[i].firstChild != null) {
                boxes[i].firstChild.remove();
            }
        }
    } else { // not every piece is on the field (only with upload where not all pieces positioned)

    }
}
