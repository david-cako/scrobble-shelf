from setuptools import setup

setup(name='scrobble_shelf',
      version='0.1',
      description='Create interactive album collages from last.fm scrobble stats.',
      url='https://github.com/david-cako/scrobble-shelf',
      author='david cako',
      author_email='dc@cako.io',
      license='GPLv3',
      packages=['scrobble_shelf'],
      entry_points={
          "console_scripts": ['scrobble-shelf = scrobble_shelf.scrobble_shelf:entry_point']
      },
      install_requires={
          'pylast'
      }
)

