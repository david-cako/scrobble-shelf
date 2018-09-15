#!/usr/bin/env python
import pylast, os, json, argparse, requests, mimetypes, urllib, glob
from .cover_art_subs import COVER_ART_SUBS
from shutil import copyfileobj

API_KEY = os.environ['LAST_FM_API_KEY']
API_SECRET = os.environ['LAST_FM_API_SECRET']

parser = argparse.ArgumentParser()
parser.add_argument('input_json_path')
parser.add_argument('output_dir', metavar='[output directory]')

class ScrobbleShelf():
    def __init__(self, input_albums, output_dir):
        self.metadata = [] 
        self.network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET)
        self.albums = input_albums
        self.output_dir = output_dir
        self.cover_art_path = os.path.join(output_dir, 'cover_art')

        if not os.path.exists(self.cover_art_path):
            os.mkdir(self.cover_art_path)

        for i, input_album in enumerate(self.albums):
            print("processing album {}/{}".format(i, len(self.albums)))
            album = self.network.get_album(input_album[0], input_album[1])
            cover_art_output = album.get_cover_image()
                
            cover_art_local = "/" + os.path.relpath(os.path.join(self.cover_art_path, "".join(c for c in album.title if c.isalnum()).rstrip()) + ".jpg", self.output_dir)

            if os.path.exists(self.output_dir + cover_art_local):
                cover_art_output = cover_art_local
                print("add cover art for {} at {}".format(album.title, cover_art_output))

            self.metadata.append({
                "index": i,
                "album": album.title,
                "artist": album.artist.name,
                "url": urllib.parse.unquote(album.get_url()),
                "coverArt": 
                    cover_art_output
            })



    def create_json(self):
        with open(os.path.join(self.output_dir, 'scrobble_shelf.json'), 'w') as f:
            json.dump(self.metadata, f, indent=4)

def entry_point():
    args = vars(parser.parse_args())
    if not os.path.exists(args['output_dir']):
        print("Given output directory does not exist.")
        return
    with open(args['input_json_path'], 'r') as f:
        input_albums = json.load(f)
    scrobble_shelf = ScrobbleShelf(input_albums, args['output_dir'])
    scrobble_shelf.create_json()


