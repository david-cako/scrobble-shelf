var pathRoot = "/scrobble-shelf/";

function shelfItem(albumObj) {
    var item = document.createElement("a");
    item.href = albumObj.url;
    if (albumObj.coverArt) {
        var backgroundImage = albumObj.coverArt;
        var itemClass = "shelf-item";
    } else {
        var backgroundImage = "";
        var itemClass = "shelf-item no-img";
    }
    item.innerHTML = `<div class="${itemClass}" \
        style="background-image: url(${backgroundImage});"> \
            <div class="shelf-item-contents"> \
                <div class="shelf-title">${albumObj.album}</div> \
                <div class="shelf-artist">${albumObj.artist}</div> \
            </div>
        </div>`;
    item.setAttribute("target", "_blank");
    return item;
}

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
