#! /usr/bin/env python
import pylast, os, json, argparse, requests, mimetypes, urllib
from .cover_art_subs import COVER_ART_SUBS
from shutil import copyfileobj

API_KEY = os.environ['LAST_FM_API_KEY']
API_SECRET = os.environ['LAST_FM_API_SECRET']

parser = argparse.ArgumentParser(description='Create interactive album collages from last.fm scrobble stats.')
parser.add_argument('username')
parser.add_argument('output_dir', metavar='[output directory]')
parser.add_argument('--period', nargs='?', default='3month', 
                    choices=['overall', '7day', '1month', '3month', '6month', '12month'])

class ScrobbleShelf():
    def __init__(self, username, period, output_dir):
        self.metadata = [] 
        self.network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET)
        self.user = self.network.get_user(username)
        self.albums = [item.item for item in self.user.get_top_albums(period)]
        self.output_dir = output_dir
        self.cover_art_path = os.path.join(output_dir, 'cover_art')

        if not os.path.exists(self.cover_art_path):
            os.mkdir(self.cover_art_path)

        for i, album in enumerate(self.albums):
                print("fetching artwork for album {}/{}".format(i, len(self.albums)))
                cover_art_url = album.get_cover_image()
                cover_art_exists = False

                if cover_art_url:
                    cover_art = requests.get(album.get_cover_image(), stream=True)
                    extension = mimetypes.guess_extension(cover_art.headers['content-type'])
                    cover_art_output = os.path.join(self.cover_art_path, "".join(x for x in album.title if x.isalnum()) + extension)
                    if not os.path.exists(cover_art_output):
                        with open(cover_art_output, 'wb') as f:
                            cover_art.raw.decode_content = True
                            copyfileobj(cover_art.raw, f)
                    cover_art_exists = True
                else:
                    for key, path in COVER_ART_SUBS.items():
                        if album.title.lower().find(key) != -1:
                            extension = '.' + path.split('.')[-1]
                            cover_art_output = os.path.join(self.cover_art_path, "".join(x for x in album.title if x.isalnum()) + extension)

                            with open(path, 'rb') as src:
                                with open(cover_art_output, 'wb') as dest:
                                    copyfileobj(src, dest)

                            cover_art_exists = True
                            break

                self.metadata.append({
                    "index": i,
                    "album": album.title,
                    "artist": album.artist.name,
                    "url": urllib.parse.unquote(album.get_url()),
                    "coverArt": 
                        os.path.relpath(cover_art_output, self.output_dir) if \
                        cover_art_exists else None
                })

    def create_json(self):
        with open(os.path.join(self.output_dir, 'scrobble_shelf.json'), 'w') as f:
            json.dump(self.metadata, f, indent=4)

def entry_point():
    args = vars(parser.parse_args())
    if not os.path.exists(args['output_dir']):
        print("Given output directory does not exist.")
        return
    scrobble_shelf = ScrobbleShelf(args['username'], args['period'], args['output_dir'])
    scrobble_shelf.create_json()

