#! /usr/bin/env python
import pylast, os, json, argparse, requests, mimetypes
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

                if cover_art_url:
                    cover_art = requests.get(album.get_cover_image(), stream=True)
                    extension = mimetypes.guess_extension(cover_art.headers['content-type'])
                    cover_art_output = os.path.join(self.cover_art_path, str(i) + extension)

                    with open(cover_art_output, 'w') as f:
                        cover_art.raw.decode_content = True
                        copyfileobj(cover_art.raw, f)

                self.metadata.append({
                    "index": i,
                    "album": album.title,
                    "artist": album.artist.name,
                    "url": album.get_url(),
                    "cover_art": os.path.relpath(cover_art_output, self.output_dir)
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

