const pathRoot = "/scrobble-shelf/";
const shelfDataPath = pathRoot + "scrobble_shelf.json";
const shelfElem = document.getElementById("scrobble-shelf");

let lastMouseScreenPos;

/** Generates and appends shelf item element for album. */
function appendShelfItem(albumObj, idx) {
    var item = document.createElement("div");
    item.className = "shelf-item";
    item.dataset.imgSrc = albumObj.coverArt;
    item.tabIndex = idx + 1;

    item.innerHTML = `<a href="${albumObj.url}" class="album-link"> \
        <div class="shelf-item-contents"> \
            <div class="shelf-title">${albumObj.album}</div> \
                <div class="shelf-artist">${albumObj.artist}</div> \
        </div>\
    </a>`;

    shelfElem.append(item);

    return item;
}

/** Adds item image and returns a promise that resolves or rejects 
 * on image load. */
async function loadShelfItemImg(item) {
    return new Promise((resolve, reject) => {
        const imgSrc = item.dataset.imgSrc;
        if (!imgSrc) {
            return;
        }

        const img = new Image();

        const timeout = setTimeout(() => {
            reject("Image load timed out.");
            img.src = "";
            img.srcset = "";
        }, 5000);

        img.onload = () => {
            clearTimeout(timeout);
            resolve();
        };
        img.onerror = (e) => {
            clearTimeout(timeout);
            reject(e);
        };
        img.srcset = `${imgSrc}, ${imgSrc.replace("300x300", "600x600")} 2x`
        img.src = imgSrc;
        item.prepend(img);
    })
}

/** Creates shelf item elements and loads images.  */
async function createShelfItems(shelfJson) {
    let items = [];

    for (var i = 0; i < shelfJson.length; i++) {
        const item = appendShelfItem(shelfJson[i], i);
        items.push(item);
    }

    // Load images synchronously after all items are created
    // to keep layout consistent.
    for (const item of items) {
        try {
            await loadShelfItemImg(item);
        } catch (e) {
            console.error("Error loading shelf item image:", e, item)
        }
    }
}

function insertCakoPlaylist(shelfItems) {
    shelfItems.unshift({
        album: "CAKO",
        artist: "Apple Music",
        coverArt: encodeURI("/scrobble-shelf/cover_art/CAKO playlist.png"),
        url: "https://music.apple.com/us/playlist/cako/pl.u-MDAWeb3uW8ZaBL4"
    });
}

/** Fetches shelf data and populates shelf items. */
function populateShelf(shelfDataPath) {
    var promise = new Promise((resolve, reject) => {
        var shelfData = [];
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    shelfData = JSON.parse(xhr.responseText);

                    insertCakoPlaylist(shelfData);
                    createShelfItems(shelfData);

                    resolve();
                } else {
                    var err = "error fetching scrobble-shelf json.";
                    reject(err);
                }
            }
        };
        xhr.open("GET", shelfDataPath, true);
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

/** Updates lastMouseScreenPos and calls unfocusArrowNavAlbum() 
 *  if cursor screen position has changed.
    It is not called on mouse events from scrolling. */
function onMouseMove(e) {
    if (lastMouseScreenPos !== undefined &&
        (lastMouseScreenPos.x !== e.screenX || lastMouseScreenPos.y !== e.screenY)) {
        unfocusArrowNavAlbum();
    }

    lastMouseScreenPos = { x: e.screenX, y: e.screenY };
}

/** Get initial album for navigation when none is selected. */
function getInitialAlbum(key) {
    const shelfItems = document.querySelectorAll(".shelf-item");

    if (key === "ArrowUp" || key === "ArrowLeft") {
        let selected;

        for (let i = 0; i < shelfItems.length; i++) {
            const item = shelfItems[i];
            const pos = item.getBoundingClientRect();

            if (pos.top > window.innerHeight) {
                return selected;
            } else if (i === shelfItems.length - 1) {
                return item;
            } else if (pos.top > 0) {
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

/** Navigate albums with keyboard events. */
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
    await populateShelf(shelfDataPath);

    document.addEventListener("keydown", navigateAlbum);
    document.addEventListener("mousemove", onMouseMove);
})();
