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

function appendItems(shelfJson) {
    var shelfObj = document.getElementById("scrobble-shelf");
    for (var i = 0; i < shelfJson.length; i++) {
        shelfObj.appendChild(shelfItem(shelfJson[i]));
    }
}

function populateShelf() {
    var promise = new Promise((resolve, reject) => {
        var shelfJson = [];
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    shelfJson = JSON.parse(xhr.responseText);
                    appendItems(shelfJson);

                    resolve();
                } else {
                    var err = "error fetching scrobble-shelf json.";
                    reject(err);
                }
            }
        };
        xhr.open("GET", pathRoot + "scrobble_shelf.json", true);
        xhr.send();
    });

    return promise;
}

(async () => {
    await populateShelf();

    var IS_TOUCH = false;
    var LAST_TOUCHED = undefined;

    document.addEventListener("touchstart", e => {
        IS_TOUCH = true;
    })

    document.querySelectorAll(".album-link").forEach(
        elem => elem.addEventListener("click", e => {
            console.log(e);
            if (IS_TOUCH && LAST_TOUCHED !== e.target) {
                LAST_TOUCHED = e.target;
                e.preventDefault();
            }
        })
    );
})();
