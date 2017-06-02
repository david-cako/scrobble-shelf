# scrobble-shelf

### Create interactive album collages from last.fm scrobble stats.

I wanted a way to integrate my last.fm listening stats with my website that wasn't just a static collage, and didn't require linking out to last.fm.

This python script and accompanying static files allows you to scrape your last.fm listening stats on a regular basis, and insert an interactive array of albums into your website that links back to the albums on last.fm.

## Usage

#### Installation:

```
pip3 install ./scrobble-shelf
```

#### Usage (default period is 3 months):

```
scrobble-shelf {LAST FM USERNAME} {output dir (i.e., /var/www/scrobble-shelf)} [--period 6months]
```

scrobble-shelf also allows you to supply it with local files for cover art for albums missing cover art on last.fm, or those which are incorrectly scrobbled.  Simply add keys with partial string matches to `COVER_ART_SUBS`, and values of the local paths.  Note that these are only sourced in absence of artwork on last.fm.

#### Local artwork files example:

```
COVER_ART_SUBS = {
    "my beautiful dark twisted fantasy": "/home/david/scrobble-shelf/cover-art-subs/mbdtf.jpg",
    "se dice": "/home/david/scrobble-shelf/cover-art-subs/sdbnb.jpg"
}
```
