var pathRoot = "/scrobble-shelf/";
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

function insertCakoPlaylist(shelfItems) {
    shelfItems.unshift({
        album: "CAKO",
        artist: "Apple Music",
        coverArt: "/scrobble-shelf/cover_art/CAKO playlist.png",
        url: "https://music.apple.com/us/playlist/cako/pl.u-MDAWeb3uW8ZaBL4"
    });
}

function populateShelf() {
    var promise = new Promise((resolve, reject) => {
        var shelfItems = [];
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    shelfItems = JSON.parse(xhr.responseText);

                    insertCakoPlaylist(shelfItems);
                    appendItems(shelfItems);

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

function scrollToAlbum(element) {
    const margin = 40;
    const pos = element.getBoundingClientRect();

    if (pos.top < margin) {
        window.scroll({
            top: window.scrollY + pos.top - margin,
            behavior: "smooth"
        });
    } else if (pos.bottom > window.innerHeight - margin) {
        window.scroll({
            top: window.scrollY + (pos.bottom - window.innerHeight + margin),
            behavior: "smooth"
        });
    }
}

function focusAlbumWithArrowNav(element) {
    setArrowNavigationActive();

    document.activeElement && document.activeElement.blur();

    element.focus({ focusVisible: true, preventScroll: true });
    scrollToAlbum(element);
}

function unfocusArrowNavAlbum() {
    document.activeElement && document.activeElement.blur();
    unsetArrowNavigationActive();
}

function onMouseMove(e) {
    // unfocusArrowNavAlbum() if cursor screen position has changed.
    // it is not called on mouse events from scrolling.
    if (lastMouseScreenPos !== undefined &&
        (lastMouseScreenPos.x !== e.screenX || lastMouseScreenPos.y !== e.screenY)) {
        unfocusArrowNavAlbum();
    }

    lastMouseScreenPos = { x: e.screenX, y: e.screenY };
}

/** Get initial album for arrow key navigation when none is selected. */
function getInitialAlbum(key) {
    const shelfItems = document.querySelectorAll(".shelf-item");

    if (key === "ArrowUp" || key === "ArrowLeft") {
        let selected;

        for (const item of shelfItems) {
            const pos = item.getBoundingClientRect();

            if (selected === undefined && pos.top > 0) {
                selected = item;
            } else if (pos.top > window.innerHeight) {
                return selected;
            } else {
                selected = item;
            }
        }
    } else if (key === "ArrowDown" || key === "ArrowRight") {
        for (const item of shelfItems) {
            if (item.getBoundingClientRect().bottom > 0) {
                return item;
            }
        }
    } else {
        throw new Error("Must pass arrow key direction to getInitialAlbum.")
    }
}

function isArrowKeyPress(key) {
    return (["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].indexOf(key) !== -1);
}

function navigateAlbum(event) {
    if (isArrowKeyPress(event.key)) {
        event.preventDefault();

        let dest;

        let current = document.querySelector(
            ".shelf-item:active, .shelf-item:focus, #scrobble-shelf:not(.arrow-nav-active) .shelf-item:hover"
        );

        if (!current) {
            dest = getInitialAlbum(event.key);

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
        }

        if (dest) {
            focusAlbumWithArrowNav(dest);
        }
    } else if (event.key === "Enter") {
        let current = document.querySelector(".shelf-item:active, .shelf-item:focus, .shelf-item:hover");
        current.firstChild && current.firstChild.click();
    } else if (event.key === "Escape") {
        unfocusArrowNavAlbum();
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
