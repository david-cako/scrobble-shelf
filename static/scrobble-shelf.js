var pathRoot = "/scrobble-shelf/";
let arrowNavTarget;
let lastMouseScreenPos;

function shelfItem(albumObj, idx) {
    var item = document.createElement("div");
    if (albumObj.coverArt) {
        var backgroundImage = albumObj.coverArt;
        var itemClass = "shelf-item";
    } else {
        var backgroundImage = "";
        var itemClass = "shelf-item no-img";
    }
    item.classList.add(itemClass);
    item.style.backgroundImage = `image-set(url('${backgroundImage}') 1x, url('${backgroundImage.replace("300x300", "600x600")}') 2x)`;
    item.style.backgroundImage = `-webkit-image-set(url('${backgroundImage}') 1x, url('${backgroundImage.replace("300x300", "600x600")}') 2x)`;
    item.tabIndex = idx + 1;
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
        shelfObj.appendChild(shelfItem(shelfJson[i], i));
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

function setArrowNavigationActive() {
    document.getElementById("scrobble-shelf").classList.add("arrow-nav-active");
}

function unsetArrowNavigationActive() {
    document.getElementById("scrobble-shelf").classList.remove("arrow-nav-active");
}

function focusAlbumWithArrowNav(element) {
    setArrowNavigationActive();
    element.focus();

    arrowNavTarget = element;
}

function unfocusArrowNavAlbum() {
    arrowNavTarget && arrowNavTarget.blur();
    arrowNavTarget = undefined;

    unsetArrowNavigationActive();
}

function onMouseMove(e) {
    // unfocusArrowNavAlbum() if cursor screen position has changed.
    // it is not called on mouse events from scrolling.
    if (lastMouseScreenPos !== undefined &&
        (lastMouseScreenPos.x !== e.screenX || lastMouseScreenPos.y !== e.screenY)) {
            unfocusArrowNavAlbum();
    }

    lastMouseScreenPos = {x: e.screenX, y: e.screenY};
}


function navigateAlbum(event) {
    let current = document.querySelector(".shelf-item:active, .shelf-item:focus, .shelf-item:hover");
    let dest;

    if (!current) {
        dest = document.querySelector(".shelf-item");
        dest && focusAlbumWithArrowNav(dest);
        return;
    }

    if (event.key === "ArrowRight") {
        dest = current.nextSibling;
    } else if (event.key === "ArrowLeft") {
        dest = current.previousSibling;
    } else if (event.key === "ArrowUp") {
        let d = current.previousSibling;
        while (d !== null) {
            if (d.offsetTop < current.offsetTop &&
                d.offsetLeft <= current.offsetLeft) {
                dest = d;
                break;
            }

            d = d.previousSibling;
        }
    } else if (event.key === "ArrowDown") {
        let d = current.nextSibling;
        while (d !== null) {
            if (d.offsetTop > current.offsetTop &&
                d.offsetLeft >= current.offsetLeft) {
                dest = d;
                break;
            }

            d = d.nextSibling;
        }
    } else if (event.key === "Enter") {
        current.firstChild && current.firstChild.click();
    } else if (event.key === "Escape") {
        unfocusArrowNavAlbum();
    }

    if (dest) {
        focusAlbumWithArrowNav(dest);
    }
}

(async () => {
    await populateShelf();

    var IS_TOUCH = false;
    var LAST_TOUCHED = undefined;

    document.addEventListener("touchstart", e => {
        IS_TOUCH = true;
    });

    document.querySelectorAll(".album-link").forEach(
        elem => elem.addEventListener("click", e => {
            e.stopPropagation();
            if (IS_TOUCH && LAST_TOUCHED !== e.target) {
                e.preventDefault();
                LAST_TOUCHED = e.target;
            }
        })
    );

    document.addEventListener("click", (e) => {
        if (!e.target.classList.contains(".album-link")) {
            document.activeElement.blur();
            LAST_TOUCHED = undefined;
        }
    });

    document.addEventListener("keydown", navigateAlbum);
    document.addEventListener("mousemove", onMouseMove);
})();
