var pathRoot = "/scrobble-shelf/";

function shelfItem(albumObj) {
    var item = document.createElement("div");
    if (albumObj.coverArt) {
        var backgroundImage = albumObj.coverArt;
        var itemClass = "shelf-item";
    } else {
        var backgroundImage = "";
        var itemClass = "shelf-item no-img";
    }
    item.classList.add(itemClass);
    item.style.backgroundImage = `url(${backgroundImage})`;
    item.innerHTML = `<a href="${albumObj.url}" class="album-link"> \
        <div class="shelf-item-contents"> \
            <div class="shelf-title">${albumObj.album}</div> \
                <div class="shelf-artist">${albumObj.artist}</div> \
        </div>\
        </a>`;
    return item;
}

var IS_TOUCH = false;
var LAST_TOUCHED = undefined;

document.addEventListener("touchstart", e => {
    IS_TOUCH = true;
})

document.getElementById("scrobble-shelf").addEventListener("click", e=> {
    console.log(e);
    if (IS_TOUCH && e.target.matches(".album-link")) {
        if (LAST_TOUCHED !== e.target) {
            LAST_TOUCHED = e.target;
            e.preventDefault();
        }
    }
})

function appendItems(shelfJson) {
    var shelfObj = document.getElementById("scrobble-shelf");
    for (var i = 0; i < shelfJson.length; i++) {
        shelfObj.appendChild(shelfItem(shelfJson[i]));
    }
} 

function populateShelf() {
    var shelfJson = [];
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                shelfJson = JSON.parse(xhr.responseText);
                appendItems(shelfJson);
            } else {
                console.log("error fetching scrobble-shelf json.");
            }
        }
    };
    xhr.open("GET", pathRoot + "scrobble_shelf.json", true);
    xhr.send();
}

populateShelf();
