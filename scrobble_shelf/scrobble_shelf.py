#!/usr/bin/env python
import pylast, os, json, argparse, urllib
import urllib.request
from urllib.parse import urlparse

API_KEY = os.environ['LAST_FM_API_KEY']
API_SECRET = os.environ['LAST_FM_API_SECRET']

parser = argparse.ArgumentParser()
parser.add_argument('input_json_path')
parser.add_argument('output_dir', metavar='[output directory]')
parser.add_argument('--http-root', nargs='?', default='/var/www')

class ScrobbleShelf():
    def __init__(self, input_albums, output_dir, http_root):
        self.metadata = [] 
        self.network = pylast.LastFMNetwork(api_key=API_KEY, api_secret=API_SECRET)
        self.albums = input_albums
        self.output_dir = output_dir
        self.http_root = http_root
        self.cover_art_path = os.path.join(output_dir, 'cover_art')
        self.cover_art_local_path = os.path.join(output_dir, 'cover_art_local')

        if not os.path.exists(self.cover_art_path):
            os.mkdir(self.cover_art_path)

        for i, input_album in enumerate(self.albums):
            print("processing album {}/{} | {} - {}".format(
                i+1, len(self.albums), input_album[0], input_album[1]))

            try:
                retry = 0
                album = None
                cover_art_output = None
                while retry < 5:
                    try:
                        album = self.network.get_album(input_album[0], input_album[1])
                        break
                    except pylast.WSError as e:
                        raise Exception(print("Error fetching album: {} {}".format(input_album[0], input_album[1])), e)
                    except:
                        retry += 1
                        continue

                if album is None:
                    raise Exception("Could not fetch album from last.fm: {} {}".format(input_album[0], input_album[1]))
                    
                cover_art_local = "/" + os.path.relpath(
                    os.path.join(
                        self.cover_art_local_path, 
                        "".join(c for c in album.title if c.isalnum()).rstrip()) + ".jpg", self.http_root)

                if os.path.exists(self.http_root + cover_art_local):
                    cover_art_output = cover_art_local
                    print("add cover art for {} at {}".format(album.title, cover_art_output))
                else:
                    cover_image_url = album.get_cover_image()
                    cover_image_url = cover_image_url.replace("300x300", "600x600")

                    u = urlparse(cover_image_url)
                    filename = os.path.basename(u.path)
                    dest = os.path.join(self.cover_art_path, filename)

                    if not os.path.exists(dest):
                        retry = 0

                        while True:
                            try:
                                urllib.request.urlretrieve(cover_image_url, dest)
                                break
                            except Exception as e:
                                retry += 1
                                if retry < 5:
                                    continue
                                else:
                                    raise Exception("Error fetching cover art: ", e)
                            
                    cover_art_output = "/" + os.path.relpath(
                        os.path.join(self.cover_art_path, filename),
                        self.http_root)

                self.metadata.append({
                    "index": i,
                    "album": album.title,
                    "artist": album.artist.name,
                    "url": urllib.parse.unquote(album.get_url()),
                    "coverArt": 
                        cover_art_output
                })
            except Exception as e:
                print(e)
                cover_art_local = "/" + os.path.relpath(
                    os.path.join(
                        self.cover_art_path, 
                        "".join(c for c in input_album[0] if c.isalnum()).rstrip()) + ".jpg", self.http_root)
                if os.path.exists(self.http_root + cover_art_local):
                    cover_art_output = cover_art_local
                    print("add cover art for {} at {}".format(input_album[0], cover_art_output))

                self.metadata.append({
                    "index": i,
                    "album": input_album[1],
                    "artist": input_album[0],
                    "url": "",
                    "coverArt": 
                        cover_art_output if cover_art_output else ""
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
    scrobble_shelf = ScrobbleShelf(input_albums, args['output_dir'], args['http_root'])
    scrobble_shelf.create_json()


