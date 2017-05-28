var pathRoot = "/scrobble-shelf/";

function trimContents(string) {
    
}

function shelfItem(albumObj) {
    var item = 
        `<div class="shelf-item" href="${pathRoot + albumObj.url}" \
        style="background-image: url(${pathRoot + albumObj.coverArt});">
            <div class="shelf-title">${albumObj.title}</div>
            <div class="shelf-artist">${albumObj.artist}</div>
        </div>`;
    return item;
}

function appendItems(shelfJson) {
    var shelfObj = document.getElementById("scrobble-shelf");
    for (i = 0; i < shelfJson.length; i++) {
        shelfObj.appendChild(shelfItem(shelfJson[i]));
    }
} 

function populateShelf() {
    var shelfJson = [];
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    shelfJson = JSON.parse(xhr.responseText);
                    appendItems(shelfJson);
            } else {
                if (error)
                    console.log("error fetching scrobble-shelf json.");
            }
        }
    };
    xhr.open("GET", pathRoot + "scrobble_shelf.json", true);
    xhr.send();
}

populateShelf();