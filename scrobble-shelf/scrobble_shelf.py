#! /usr/bin/env python
import pylast, os, json, argparse

API_KEY = os.environ['LAST_FM_API_KEY']
API_SECRET = os.environ['LAST_FM_API_SECRET']

parser = argparse.ArgumentParser(description='Create interactive album collages from last.fm scrobble stats.')
parser.add_argument('username')
parser.add_argument('outputdir', metavar='[output directory]')
parser.add_argument('--period', nargs='?', default='3month', 
                    choices=['overall', '7day', '1month', '3month', '6month', '12month'])

class ScrobbleShelf():
    def __init__(self, username, period):
        self.metadata = [] 
        self.network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET)
        self.user = network.get_user(username)
        self.albums = [item.item for item in self.user.get_top_albums(period)]
        
        for i, album in enumerate(self.albums):
            self.metadata.append({
                "album": album.title,
                "artist": album.artist.name,
                "url": album.get_url(),
                "album_art": album.get_cover_image(),
            })

    def create_json(self, output_dir):
        with open(os.path.join(output_dir, 'scrobble_shelf.json'), 'w') as f:
            json.dump(self.metadata, f)

def entry():
    args = parser.parse_args()
    scrobble_shelf = ScrobbleShelf(args["username"], args["period"])
    scrobble_shelf.create_json(args["output_dir"])

