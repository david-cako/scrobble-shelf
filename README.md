# scrobble-shelf

### Create interactive album collages from last.fm scrobble stats.

https://davidcako.com/scrobble-shelf/scrobble-shelf

I wanted a way to integrate my last.fm listening stats with my website that wasn't just a static collage, and wasn't just a direct link to last.fm.

This python script and accompanying static files allows you to scrape your last.fm listening stats on a regular basis, and insert an interactive array of albums into your website that links back to the albums on last.fm.

## Usage

#### Installation:

```
pip3 install ./scrobble-shelf
```

#### Usage (default period is 3 months):

Add an element on your desired page with the id `scrobble-shelf`, and include the corresponding `.css` and `.js` files from the `static` folder in this repository.

Edit the `pathRoot` variable in `scrobble-shelf.js` if you will not be using `/var/www/scrobble-shelf/` as your output directory.

Then, run scrobble-shelf:

```
scrobble-shelf {LAST FM USERNAME} {output dir (i.e., /var/www/scrobble-shelf)} [--period 6months]
```

#### Local artwork files:

scrobble-shelf also allows you to substitute local files for albums missing cover art on last.fm, or those which are incorrectly scrobbled.  Simply add keys with partial string matches to `COVER_ART_SUBS`, and values of the local paths.  Note that these are only sourced in absence of artwork on last.fm.

```
COVER_ART_SUBS = {
    "my beautiful dark twisted fantasy": "/home/david/scrobble-shelf/cover-art-subs/mbdtf.jpg",
    "se dice": "/home/david/scrobble-shelf/cover-art-subs/sdbnb.jpg"
}
```
