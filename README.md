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
 - Extract [TruckNav-0.4.4-dev-on-TruckTel-0.1.1.zip](https://drive.google.com/file/d/1GAXfCu5iCBUzwYfTxkg6lmnxmIYzdKgg/view?usp=sharing)
   to this directory. It should create a "plugins" directory, if it didn't
   already exist.

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

Note that the zip is hosted on Google Drive because GitHub refuses the upload
for being too large. It was built from 884dc1b1 by the
[build-trucktel.yaml](.github/workflows/build-trucktel.yaml) action. If the
link stops working or you just prefer to build it yourself, follow the steps
there.

## Usage

When you launch the game, you will get a popup in the main menu that reads

    Request to use advanced SDK features detected.

Once you acknowledge this, TruckTel should open a browser with its landing
page. From there, you can select the TruckNav app to get a QR code for loading
it on other devices, or navigate to it locally if you want to run TruckNav on
a second monitor.

If no browser window opens once you start the game, follow the troubleshooting
steps [here](https://github.com/jvanstraten/TruckTel/blob/main/doc/troubleshooting.md).
If the landing page does open but something else isn't working, follow the
troubleshooting steps on the landing page.
