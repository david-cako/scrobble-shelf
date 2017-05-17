#! /usr/bin/env python
import pylast, os, json, argparse, requests, mimetypes
from shutil import copyfileobj

API_KEY = os.environ['LAST_FM_API_KEY']
API_SECRET = os.environ['LAST_FM_API_SECRET']

parser = argparse.ArgumentParser(description='Create interactive album collages from last.fm scrobble stats.')
parser.add_argument('username')
parser.add_argument('outputdir', metavar='[output directory]')
parser.add_argument('--period', nargs='?', default='3month', 
                    choices=['overall', '7day', '1month', '3month', '6month', '12month'])

class ScrobbleShelf():
    def __init__(self, username, period, output_dir):
        self.metadata = [] 
        self.network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET)
        self.user = network.get_user(username)
        self.albums = [item.item for item in self.user.get_top_albums(period)]
        self.cover_art_path = os.path.join(output_dir, 'cover_art')

        if not os.path.exists(self.cover_art_path):
            os.mkdir(self.cover_art_path)
        
        for i, album in enumerate(self.albums):
            cover_art = requests.get(album.get_cover_image())
            extension = mimetypes.guess_extension(cover_art.headers['content-type'])
            cover_art_output = os.path.join(cover_art_path, i, extension)

            with open() as f:
                r.raw.decode_content = True
                shutil.copyfileobj(r.raw, f)

            self.metadata.append({
                "index": i,
                "album": album.title,
                "artist": album.artist.name,
                "url": album.get_url(),
                "cover_art": os.path.relpath(cover_art_output, output_dir)
            })

    def create_json(self):
        with open(os.path.join(output_dir, 'scrobble_shelf.json'), 'w') as f:
            json.dump(self.metadata, f)

def entrypoint():
    args = parser.parse_args()
    if not os.path.exists(args['output_dir']):
        print("Given output directory does not exist.")
        return
    scrobble_shelf = ScrobbleShelf(args["username"], args["period"], args["output_dir"])
    scrobble_shelf.create_json()

