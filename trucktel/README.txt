Installation
============

To install the plugin:

 - Find your game's installation directory. For Steam installs, you can find
   it by right-clicking the game in your library, and selecting
   Manage -> Browse Local Files.
 - You should see a bunch of .scs files and a few directories. Open the "bin"
   directory.
 - The "bin" directory should have one directory in it, of which the name
   depends on your OS. Open it. If this directory has the "amtrucks" or
   "eurotrucks2" executable in it, you're in the right place.
 - Extract the TruckNav-on-TruckTel.zip archive to this directory. It should
   create a "plugins" directory, if it didn't already exist.


Usage
=====

When you launch the game, you will get a popup in the main menu that reads

    Request to use advanced SDK features detected.

When you acknowledge this, the plugin will load, and you can open the web app.
YOU CANNOT OPEN THE WEB APP BEFORE THIS TIME, it will not load.

To open the app on a second screen of the computer you're running the game on,
open a browser and go to http://localhost:30001/. On different devices, you
can try:

                                       █████████████████████████████████████
                                       █████████████████████████████████████
      █▀▀▀▀▀█ █▄▄███▀▀▄  ▀▄ █▀▀▀▀▀█    ████ ▄▄▄▄▄ █ ▀▀   ▄▄▀██▄▀█ ▄▄▄▄▄ ████
      █ ███ █ ▄▀▀ ▄ ▄▄▀▄█▄▄ █ ███ █    ████ █   █ █▀▄▄█▀█▀▀▄▀ ▀▀█ █   █ ████
      █ ▀▀▀ █  ▄▄▀ ▄▀▄█▀▀█▀ █ ▀▀▀ █    ████ █▄▄▄█ ██▀▀▄█▀▄▀ ▄▄ ▄█ █▄▄▄█ ████
      ▀▀▀▀▀▀▀ █ ▀ █ ▀▄█▄▀ ▀ ▀▀▀▀▀▀▀    ████▄▄▄▄▄▄▄█ █▄█ █▄▀ ▀▄█▄█▄▄▄▄▄▄▄████
      ▀▄▀▀ █▀▀▄█ ███▄█ ▀ ▄▄ █▄▄▀ ▀█    ████▄▀▄▄█ ▄▄▀ █   ▀ █▄█▀▀█ ▀▀▄█▄ ████
      █▄ ▀ █▀█▄ ▄▄▀▀  █▀ ▄ ▀▄ █▄▀▀▄    ████ ▀█▄█ ▄ ▀█▀▀▄▄██ ▄█▀█▄▀█ ▀▄▄▀████
      ▄█  ▀█▀▄██  ▄ █▀▄██▄  ▄  ▀▀▄▄    ████▀ ██▄ ▄▀  ██▀█ ▄▀  ▀██▀██▄▄▀▀████
       █▄▄ █▀▄ █▀█ ▀▄▀█ ▄█▀▀▀▀█▀▀█▀    █████ ▀▀█ ▄▀█ ▄ █▄▀▄ █▀ ▄▄▄▄ ▄▄ ▄████
      ▀█ ▀█▄▀▀█▀ █▄ █▀█ ▄ █▀ █▀ ▄█     ████▄ █▄ ▀▄▄ ▄█ ▀█ ▄ █▀█ ▄█ ▄█▀ █████
      ▀ ▄▄▄█▀▀▄ ▄▀▄██▀▀▄█▄▀ ▀▀▀▀█      ████▄█▀▀▀ ▄▄▀█▀▄▀  ▄▄▀ ▀▄█▄▄▄▄ ██████
       ▀▀ ▀ ▀▀▄ ▀▀█▀▀▄██▄ █▀▀▀███▄▄    █████▄▄█▄█▄▄▀█▄▄ ▄▄▀  ▀█ ▄▄▄   ▀▀████
      █▀▀▀▀▀█ █ ▀▄ ▄██  █▀█ ▀ █▀ ▀▄    ████ ▄▄▄▄▄ █ █▄▀█▀  ██ ▄ █▄█ ▄█▄▀████
      █ ███ █ ▄ ▄ ▀   ▀ ▀ █▀▀▀███▄▀    ████ █   █ █▀█▀█▄███▄█▄█ ▄▄▄   ▀▄████
      █ ▀▀▀ █ ▀▄█▄▄ ▄▄ ██ █ ▄▀ █ ▄▀    ████ █▄▄▄█ █▄▀ ▀▀█▀▀█  █ █▀▄█ █▀▄████
      ▀▀▀▀▀▀▀ ▀▀ ▀ ▀▀  ▀▀▀▀ ▀▀ ▀ ▀     ████▄▄▄▄▄▄▄█▄▄█▄█▄▄██▄▄▄▄█▄▄█▄█▄█████
                                       █████████████████████████████████████
                                       ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
        (for black-on-white text)            (for white-on-black text)

                         http://trucktel.local:30001/


If that doesn't work, you can also try replacing trucktel.local with your local
IP address. If that doesn't work either, your firewall is probably blocking the
webserver that's built into TruckTel. Make sure to allow network access to the
game when prompted by your firewall.
