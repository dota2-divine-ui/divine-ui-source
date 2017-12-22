/**
 * List of maps available to be used as a hero background.
 */
var nAvailableBackgrounds = ['spring01', 'spring01_desert', 'spring01_dire', 'mines', 'temple'];

/**
 * Custom Game Modes list for the current event
 */
var nCustomGames = null;

/**
 * 
 */
var sDatabaseUrl = 'https://divine-ui.firebaseio.com/';

/**
 * Am I a highly trained developer, rank "Divine" in Dota, which is allowed to officially modify Divine UI?
 */
var bIsDebug = false;

/**
 * Now I must also remember to change this in each version :(
 */
var sVersion = '1.1.6';
var sLatestVersion = '?';

/**
 * Returns the host where the Divine UI API is located
 */
function GetHost()
{
    return ( bIsDebug ) ? 'http://divine-ui.test' : 'https://divineui.woots.xyz';
}

/**
 * Make a request to the Divine UI API
 * @param {*} path 
 * @param {*} params 
 */
$.ServerRequest = function(path, params) 
{
    if ( params == undefined ) {
        params = {
            type: 'GET'
        };
    }

    if( params.type == 'GET' ) {
        // The server load and services like OpenDota/Dotabuff/Steam make it slow...
        params.timeout = (15 * 1000);
    }
    else {
        params.timeout = (6 * 1000);
    }

    if( bIsDebug ) {
        $.Msg('[Server] Requesting: ' + path);
    }

    $.AsyncWebRequest(GetHost() + '/api/v2/' + path, params);
};

/**
 * Make a request directly to the Firebase database
 * @param {*} path 
 * @param {*} params 
 */
$.DatabaseRequest = function(path, params)
{
    if ( params == undefined ) {
        params = {};
    }

    // Firebase should load fast
    params.timeout = (3 * 1000);

    if( bIsDebug ) {
        $.Msg('[Database] Requesting: ' + path);
    }

    $.AsyncWebRequest(sDatabaseUrl + path + '.json', params);
};

/**
 * Fill a panel with backgrounds available for the hero
 * @param {string} panelName 
 */
function FillWithAvailableBgs(panelName)
{
    var panel = $('#' + panelName);

    if ( panel == null ) {
        $.Msg('[FillWithAvailableBgs] Without valid Panel.');
        return;
    }

    for ( it in nAvailableBackgrounds ) {
        panel.BCreateChildren('<DOTAScenePanel class="BackgroundPreview" map="showcase_backgrounds/' + nAvailableBackgrounds[it] + '" camera="default" particleonly="false" light="global_light" onactivate="SelectBackground(\'' + nAvailableBackgrounds[it] + '\')" />');
    }
}

/**
 * Load the Custom Games that must appear in the panel to play.
 * @param {*} callback 
 */
function LoadCustomGames(callback)
{
    $.Msg('[CustomGames] Loading...');

    $.DatabaseRequest('custom-games-event', {
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                $.Schedule(1.0, function() {
                    LoadCustomGames(callback);
                });
                return;
            }

            response = response.responseText.clearJson();
            $.Msg('[CustomGames] Loaded!');

            nCustomGames = response;
            callback(response);
        }
    });
}

/**
 * Make the request to load a player profile
 * @param {string} steamid Steam ID 64
 * @param {object} callbacks 
 */
function LoadProfile(steamid, callbacks)
{
    $.Msg('[Profile] Loading ' + steamid + '...');

    // List of profile sections that we must load
    var sections = [
        'custom_data',
        'hero_showcase',
        'settings',
        'top_heroes'
    ];

    /*
      callbacks = {
        onProfile: function,
        onError: function,
        onSection: {
            custom_data: function,
            hero_showcase: function,
            settings: function,
            top_heroes: function
        }
      };
    */

    /**
     * 
     */
    var onServerLoaded = function(response) 
    {
        // Request failed
        if ( response.status !== 200 ) {
            callbacks.onError(response);
            return;
        }

        // to Array
        $.Msg(response);
        var responseText = response.responseText.toString().clearJson();

        Profile.refresh();

        $.Schedule(0.3, function() {
            // Fire callback
            callbacks.onProfile(responseText.player_data);
            callbacks.onSection['top_heroes'](responseText.top_heroes);

            $('#ServerHint2').visible = false;

            // Request to register the last time the profile was viewed.
            $.ServerRequest('profile/' + steamid + '/seen');
        });
    };

    /**
     * 
     * @param {*} response 
     * @param {*} section 
     */
    var onSectionLoaded = function(response, section) 
    {
        // Request failed
        if ( response.status !== 200 ) {
            $.Msg('[Profile] Internal Server Error Loading ' + section + ': ' + response.status);
            return;
        }

        var responseText = response.responseText.toString().clear();

        // This information has not been registered in the database.
        if ( responseText == 'null' ) {
            $.Msg('[Profile] There is no information in ' + section);
            return;
        }

        // to Array
        responseText = JSON.parse(responseText);

        // Fire callback
        callbacks.onSection[section](responseText);
    };

    /**
     * 
     * @param {*} section 
     */
    var loadSection = function(section) 
    {
        $.DatabaseRequest('players/' + section + '/' + steamid, {
            complete: function(response) { 
                onSectionLoaded(response, section); 
            }
        });
    };

    /**
     * 
     * @param {*} response 
     */
    var onFirebaseLoaded = function(response) 
    {
        // Request failed
        if ( response.status !== 200 ) {
            // Try again
            LoadProfile(steamid, callbacks);
            return;
        }

        var responseText = response.responseText.toString().clear();

        // The profile has not been registered in the database.
        if ( responseText == 'null' ) {
            $('#ServerHint').text = $.Localize('#DU_ProfileLoadingServer');

            // Request the profile to the server,
            // who will be responsible for saving it in the database
            $.ServerRequest('profile/' + steamid + '/?firsttime=true', {
                complete: onServerLoaded
            });

            return;
        }

        // to Array
        responseText = JSON.parse(responseText);

        // Fire callback
        callbacks.onProfile(responseText);

        // The information on this profile has not been updated in more than an hour!
        // Show the outdated information first and then update it.
        if ( responseText.updated_at == null || (time() - responseText.updated_at) > (60*60) ) {
            $('#ServerHint2').text = $.Localize('#DU_ProfileLoadingOutdated');
            $('#ServerHint2').visible = true;

            // Request the updated profile to the server
            $.ServerRequest('profile/' + steamid, {
                complete: onServerLoaded
            });
        }
        else {
            // Request to register the last time the profile was viewed.
            $.ServerRequest('profile/' + steamid + '/seen');
        }
    };

    $('#ServerHint').visible = true;
    $('#ServerHint').text = $.Localize('#DU_ProfileLoadingDatabase');

    // Request the profile to the database, this will take care of the rest.
    $.DatabaseRequest('players/opendota_data/' + steamid, {
        complete: onFirebaseLoaded
    });

    // Request information from other sections.
    // This information should work if we obtain it directly from the database.
    for( var it = 0; it < sections.length; it++ ) {
        loadSection(sections[it]);
    }
}

/**
 * Make the request to load the list of available profile backgrounds.
 * @param {string} steamid Steam ID 64
 * @param {function} callback 
 */
function LoadAvailableBackgrounds(steamid, callback)
{
    $.ServerRequest('profile/' + steamid + '/backgrounds', {
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                $.Msg('[LoadAvailableBackgrounds] Internal Server Error: ' + response.status);
                return;
            }

            // to Array
            var responseText = response.responseText.toString().clearJson();
            callback(responseText);
        }
    });
}

/**
 * Upload the changes to the Hero Showcase to the server.
 * @param {object} formData Request information
 * @param {function} callback 
 */
function SaveShowcase(steamid, formData, callback)
{
    $.Msg('[HeroShowcase] Saving...');

    $.ServerRequest('profile/' + steamid + '/heroshowcase', {
        type: 'POST',
        data: formData,
        complete: callback
    });
}

/**
 * 
 * @param {*} steamid
 * @param {*} solo 
 * @param {*} party 
 */
function SaveMMR(steamid, solo, party)
{
    $.Msg('[MMR] Saving...');

    $.ServerRequest('profile/' + steamid + '/mmr', {
        type: 'POST',
        data: {
            'solo_mmr': solo,
            'party_mmr': party
        },
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                var errorMsg = GetErrorMessage(response.status);

                $.Msg('[MMR] Internal Server Error: ' + response.status);
                $.Msg(errorMsg);

                $.DispatchEvent('AddStyle', $('#SoloMMRValue'), 'UploadFailed');
                return;
            }

            $.DispatchEvent('AddStyle', $('#SoloMMRValue'), 'UploadComplete');
            $.Msg('[MMR] Saved!');
        }
    });
}

/**
 * 
 * @param {*} steamid 
 * @param {*} optionName 
 * @param {*} optionValue 
 */
function SaveSetting(steamid, optionName, optionValue)
{
    $.Msg('[Settings] Saving Option (' + optionName + ')...');

    $.ServerRequest('profile/' + steamid + '/settings', {
        type: 'POST',
        data: {
            'option_name': optionName,
            'option_value': optionValue
        },
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                ShowErrorPopup(response.status);
                return;
            }

            $.Msg('[Settings] Saved!');
        }
    });
}

/**
 * Thanks for using Divine UI :)
 */
function Touch()
{
    // Notify the server that this user is using Divine UI.
    var steamid = $('#DashboardPages').FindChildTraverse('AvatarImage').steamid;
    $.ServerRequest('profile/' + steamid + '/touch');

    // Repeat in a minute
    $.Schedule(60, Touch);
}

/**
 * Check if we are using the current version of Divine UI
 */
function CheckVersion()
{
    $.Msg('[DivineUI] Welcome to Divine UI!');
    $.Msg('[DivineUI] Version: ' + sVersion);
    $.Msg('[DivineUI] Checking that we have the latest version...');

    $.AsyncWebRequest('https://raw.githubusercontent.com/dota2-divine-ui/divine-ui/master/version.txt', {
        type: 'GET',
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                $.Msg('[DivineUI] We could not get the latest version!');
                $.Msg('[DivineUI] Internal Server Error: ' + response.status);
                return;
            }

            // Latest Version
            sLatestVersion = response.responseText.toString().clear();

            // Version Comparision
            var compare = versionCompare(sVersion, sLatestVersion);

            if( compare == -1 ) {
                $.Msg('[DivineUI] New version: ' + sLatestVersion);
                $.DispatchEvent('AddStyle', $('#DivineUIButton'), 'UpdateAvailable');
            }
            else if( compare == 1 ) {
                $.DispatchEvent('AddStyle', $('#DivineUIButton'), 'WowMuchVersion');
            }
            else {
                $.Msg('[DivineUI] This is the latest version :)');
            }
        },
        timeout: 6000
    });

    Touch();
}