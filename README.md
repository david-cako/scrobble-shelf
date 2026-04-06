# scrobble shelf

### Create interactive album collages from a list of albums.  

https://davidcako.com/scrobble-shelf/

![screenshot](https://i.imgur.com/ZiDEiB8.jpg)

scrobble-shelf processes a JSON file and generates an interactive array of albums that links out to last.fm.

This is the `manual-input` branch, which has become default.  This utility previously focused on last.fm listening stats.

## Usage

#### Installation:

```
pip3 install ./scrobble-shelf
```

- Get a [last.fm API key](https://www.last.fm/api).  scrobble shelf expects `API_KEY` and `API_SECRET` environment variables.  You can either pass them in when run (`API_KEY={...} API_SECRET={...} scrobble-shelf ...`) or add them to your `~/.bashrc`.

- Add an element on your desired page with the id `scrobble-shelf`, and include the corresponding `.css` and `.js` files from the `static` folder in this repository.

- Edit the `pathRoot` variable in `scrobble-shelf.js` if you will not be using `/var/www/scrobble-shelf/` as your output directory.


#### Usage:

```
python3 -m venv venv
source venv/bin/activate
pip3 install .
scrobble-shelf INPUT.json OUTPUT_DIR [--http-root=/var/www]
```

#### Local artwork files:

scrobble shelf also allows you to substitute local files for album art.  Add files to `cover_art_local` in output directory with CamelCase album names: `AlbumName.jpg`.
