# TruckNav on TruckTel

This is a fork of [TruckNav](https://github.com/Rares-Muntean/TruckNav-Sim/)
that hosts the app for use in web browsers directly from the game via
[TruckTel](https://github.com/jvanstraten/TruckTel). That means that, aside
from copying some files to the game's installation folder, you don't have to
install anything. TruckTel works on both Windows and the native Linux builds
of ETS2 and ATS, so it also has that going for it; at the time of writing,
the main TruckNav project has no Linux support.

*That being said,* TruckNav is still in heavy development while I'm writing
this. Notably, it only supports official DLCs that are out as of May 2026,
and doesn't support map mods. So, depending on when you're reading this, you
might want to forget this exists and use the
[main fork](https://github.com/Rares-Muntean/TruckNav-Sim/) instead.

For reference, this is forked from TruckNav v0.4.4.

## Installation

Want to use it anyway? Install as follows:

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

Schematically:

```
<game-install-dir>         <- Where Steam takes you when you click "browse local files".
 |- *.scs                  <- Game data and normal mods.
 |- ...
 '- bin
     '- linux_x64          <- Name depends on your OS. EXTRACT INTO THIS DIRECTORY.
         |- eurotrucks2    <- Game executable is here (amtrucks for ATS).
         |- ...
         '- plugins        <- Should be created when you extract the zip to the right
             '- ...           place, unless you already have it from another mod.
```

## Usage

When you launch the game, you will get a popup in the main menu that reads

    Request to use advanced SDK features detected.

When you acknowledge this, the plugin will load, and you can open the web app.
YOU CANNOT OPEN THE WEB APP BEFORE THIS TIME, it will not load.

To open the app on a second screen of the computer you're running the game on,
open a browser and go to [http://localhost:30001/](http://localhost:30001/).
On different devices, you can try
[http://trucktel.local:30001/](http://trucktel.local:30001/). If that doesn't
work, try replacing `trucktel.local` with your local IP address. If that
doesn't work either, your firewall is probably blocking the webserver that's
built into TruckTel. Make sure to allow network access to the game when
prompted by your firewall, or to permit access manually if you've denied the
prompt earlier, or you use a firewall that doesn't prompt you at all.
