# Divine UI Source Code

This is the Divine UI source code, the custom user interface for Dota 2.

If you want to modify the project, improve it or just take a look at how the magic works, you are in the right place.

If you are just a mortal looking to install Divine UI, go to the [Download and Installation page](https://redd.it/7hi2vc).

## Introduction

Divine UI is nothing more than a series of _XML, CSS and JavaScript_ files that replace the original Panorama Dota 2 files.

You can find all the code inside the **panorama** folder.

## Useful links

- [Panorama Documentation](https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/Panorama)
- [Visual Studio Code](https://code.visualstudio.com/): The IDE that i use to create Divine UI.
- [Source 2 Resource Viewer](https://opensource.steamdb.info/ValveResourceFormat/): Important program: It allowed me to see the contents of **dota.vpk** and decompile the Panorama files.
- [GCFScape](http://nemesis.thewavelength.net/?p=26): Allows me to see the contents of dota.vpk and extract folders (Something Resource Viewer can not)

## My work environment

    Before starting, I recommend installing Dota 2 Workshop Tools!

How to compile and prepare the files? It's a bit of a messy process, but this was how I did it:

### Understanding Source 2

The first thing we need to do is open the folder where Dota 2 is installed, the path is usually:

    \Steam\steamapps\common\dota 2 beta

Inside we will find 2 folders, their importance in a summary:

- **content**: The "development" folder, all the source code, uncompressed files is here, this is the folder reserved for the creators of content/mods.
- **game**: The "production" folder, everything that is inside should be the files prepared for the clients. Compiled, compressed, prepared.

Within each folder are the "subfolders" that separate the content of the game (Dota 2), Source 2 loads each subfolder depending on what is needed.

For example, the Dota 2 launcher (dota2.exe) is forced to load the "dota" folder, that is:

    \Steam\steamapps\common\dota 2 beta\game\dota\

Once inside, Source 2 begins to read the file **gameinfo.gi** that contains the information of the game that is loading.

The "SearchPaths" section contains the information of all the other folders that must be loaded:

    SearchPaths
    {
        // These are optional language paths. They must be mounted first, which is why there are first in the list.
        // *LANGUAGE* will be replaced with the actual language name. If not running a specific language, these paths will not be mounted
        Game_Language		dota_*LANGUAGE*

        // These are optional low-violence paths. They will only get mounted if you're in a low-violence mode.
        Game_LowViolence	dota_lv

        Game				dota
        Game				core

        Mod					dota

        AddonRoot			dota_addons

        // Note: addon content is included in publiccontent by default.
        PublicContent 		dota_divine_ui
        PublicContent		dota_core
        PublicContent		core
    }

Source 2 begins to "remember" the content of each folder declared in the rules, following the order from top to bottom.

If Source 2 wanted to load the LifeStealer video, would start to see if they exist in any of these paths:

    /game/dota_english/resource/flash3/videos/portraits/npc_dota_hero_life_stealer.webm // Ignored because the folder dont exist since the English language is located directly in the "dota" folder, but if the player used the Russian language, then it would mount the content of "dota_russian"

    /game/dota_lv/resource/flash3/videos/portraits/npc_dota_hero_life_stealer.webm // This folder is only mounted when the game is running in low violence mode. If that were the case, the search would end here, as there is a version of low violence for LifeStealer.

    /game/dota/resource/flash3/videos/portraits/npc_dota_hero_life_stealer.webm // If the game is not running in low violence mode, then the search would end here, because here are the files of Dota 2.

    /game/core/resource/flash3/videos/portraits/npc_dota_hero_life_stealer.webm

We find rules like "Game_Language" that is responsible for declaring the name of the folder that must be loaded for the client's language,  meanwhile "Game_LowViolence" is for the folder with content of the game for countries that restrict the violence. 

The "Game" rules mounts the specified folders always, the other rules are less important and mount folders depending on different conditions.

### Creating the necessary folders

Now that you know how Source 2 mounts the contents of Dota 2, it is necessary to create 2 folders for our mod.

    // This will be the folder that we provide to our users.
    \Steam\steamapps\common\dota 2 beta\game\dota_divine_ui\ 

    // This will be the folder where our source code will be.
    \Steam\steamapps\common\dota 2 beta\content\dota_divine_ui\

So yes, the content of this repository should place it within `content\dota_divine_ui\`

### Compiling

Source 2 needs to compile the files that are in `/content/` and place them in `/game/` (once compiled)

For this we will use the `resourcecompiler.exe` program, located in:

    \Steam\steamapps\common\dota 2 beta\game\bin\win64\resourcecompiler.exe

The complete command that I used to compile all the files inside the `/panorama/` folder, has been the following:

    resourcecompiler -v -pauseiferror -i "E:\Steam\steamapps\common\dota 2 beta\content\dota_divine_ui\panorama\*" -r -game "E:\Steam\steamapps\common\dota 2 beta\game\dota_divine_ui"

Obviously you must replace `E:\Steam\steamapps\common\dota 2 beta` with the path where you have installed Dota 2.

In the command you should pay attention mainly to 2 arguments:

`-i`: Represents the path of the file/folder that you want to compile. In this case, when placing `panorama\*` we say that we want to compile any file inside the panorama folder.

`-game`: Represents the path of the folder within `/game/` where the compiled files will be. **Important:** The folder we specify must have a valid file [gameinfo.gi](https://github.com/dota2-divine-ui/divine-ui/blob/master/gameinfo.gi)

### VPK Packaging

It is very likely that before you can see the changes you have made it is necessary to package your files in a .vpk

[VPK](https://developer.valvesoftware.com/wiki/VPK) (Valve Pak) files are uncompressed archives used to package game content.

The process I use to pack is a bit messy and requires you to have [Alien Swarm](http://store.steampowered.com/app/630/Alien_Swarm/) installed.

For this we will use the `vpk.exe` program, located in:

    \Steam\steamapps\common\Alien Swarm\bin\vpk.exe

The complete command that I use is something similar to this:

    vpk -v a pak01 @vpk_list.txt

`vpk_list.txt` is a list of all the files that must be packaged, Divine UI uses the following:

    panorama/images/13741233615_e1275a8bf2_b_jpg.vtex_c
    panorama/images/feelsbadman_jpg.vtex_c
    panorama/images/icons/dotabuff_png.vtex_c
    panorama/images/icons/opendota-72x72_png.vtex_c
    panorama/layout/controls/control_demo_mode_button.vxml_c
    panorama/layout/dashboard.vxml_c
    panorama/layout/dashboard_page_controlslibrary.vxml_c
    panorama/layout/dashboard_page_profile.vxml_c
    panorama/layout/dashboard_page_profile_stable.vxml_c
    panorama/layout/popups/popup_common_alert.vxml_c
    panorama/layout/popups/popup_divineui.vxml_c
    panorama/layout/popups/popup_ranked_calibration_incomplete.vxml_c
    panorama/layout/popups/popup_select_background_showcase.vxml_c
    panorama/layout/ui_loadout_hero_stats.vxml_c
    panorama/scripts/apis.vjs_c
    panorama/scripts/controls/custom_control_demo_mode_button.vjs_c
    panorama/scripts/custom_dashboard_page_profile.vjs_c
    panorama/scripts/popups/popup_select_background_showcase.vjs_c
    panorama/scripts/utils.vjs_c
    panorama/styles/controls/custom_control_demo_mode_button.vcss_c
    panorama/styles/custom_dashboard_page_profile.vcss_c
    panorama/styles/custom_divine_ui.vcss_c
    panorama/styles/custom_global.vcss_c
    panorama/styles/popups/popup_select_background_showcase.vcss_c
    panorama/styles/profilestat.vcss_c

As you will realize the program must be run within the `/game/dota_divine_ui/` folder, that is why the files listed do not have the full path.

If everything runs smoothly, you will have a nice file called `pak01_dir.vpk`

**Note:** The videos that you are going to use in Panorama should not be packaged.

Before launching your project, be sure to delete all the files that are already in `pak01_dir.vpk`

### My Scripts

In order to avoid madness I have created a file called compile.bat that I have configured to run every time I press CTRL+SHIFT+B in Visual Studio Code.

This is the content of the file:

    @echo off
    CD "E:\Steam\steamapps\common\dota 2 beta\game\dota_divine_ui"
    CALL taskkill /f /im vconsole2.exe
    CALL taskkill /f /im dota2.exe
    CALL "E:\Steam\steamapps\common\dota 2 beta\game\bin\win64\resourcecompiler" -v -pauseiferror -i "E:\Steam\steamapps\common\dota 2 beta\content\dota_divine_ui\panorama\*" -r -game "E:\Steam\steamapps\common\dota 2 beta\game\dota_divine_ui"
    CALL php vpk.php
    CALL "E:/Steam/steamapps/common/Alien Swarm/bin/vpk" -v a pak01 @vpk_list.txt
    CALL "C:\Program Files (x86)\Steam\Steam.exe" "steam://rungameid/570"

Explanation:

---

    CD "E:\Steam\steamapps\common\dota 2 beta\game\dota_divine_ui"

Command to change the active folder, necessary for the VPK.

    CALL taskkill /f /im vconsole2.exe
    CALL taskkill /f /im dota2.exe

Command to close Dota 2 and the console "VConsole2", and thus avoid having to close it every time.

    CALL "E:\Steam\steamapps\common\dota 2 beta\game\bin\win64\resourcecompiler" -v -pauseiferror -i "E:\Steam\steamapps\common\dota 2 beta\content\dota_divine_ui\panorama\*" -r -game "E:\Steam\steamapps\common\dota 2 beta\game\dota_divine_ui"

Command to compile the files.

    CALL php vpk.php

It executes a small PHP script that I use to automatically create the list of files that should be packaged.

If you know how to use PHP, it can also serve you, this is the content:

    <?php
    $target_folders = [ "panorama" ];
    $list = '';

    unlink(__DIR__ . '/pak01_dir.vpk');

    function addFolder($folder)
    {
        global $list;

        // The videos should not be packaged.
        if ( strpos($folder, 'videos') !== false ) {
            return;
        }

        foreach (glob($folder . '/*') as $file) {
            if ( is_dir($file) ) {
                addFolder($file);
            }
            else {
                $list .= substr(str_replace(__DIR__, '', $file), 1) . "\n";
            }
        }
    }

    foreach( $target_folders as $folder ) {
        addFolder(__DIR__ . '/' . $folder);
    }

    file_put_contents('vpk_list.txt', $list);

---

    CALL "E:/Steam/steamapps/common/Alien Swarm/bin/vpk" -v a pak01 @vpk_list.txt

Command to package the files with VPK.

    CALL "C:\Program Files (x86)\Steam\Steam.exe" "steam://rungameid/570"

Command to open Dota 2 and make tests!