/**
 * List of maps available to be used as a hero background.
 */
var nAvailableBackgrounds = ['spring01', 'spring01_desert', 'spring01_dire', 'mines', 'temple'];

/**
 * Am I a highly trained developer, rank "Divine" in Dota, which is allowed to officially modify Divine UI?
 */
var bIsDebug = false;

/**
 * Now I must also remember to change this in each version :(
 */
var sVersion = '1.1.3';
var sLatestVersion = '?';

/**
 * Returns the host where the Divine UI API is located
 */
function GetHost()
{
    return ( bIsDebug ) ? 'http://divine-ui.dev' : 'https://divineui.woots.xyz';
}

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
 * 
 * @param {*} title 
 * @param {*} message 
 */
function ShowMessagePopup(title, message)
{
    $.DispatchEvent(
        'UIShowCustomLayoutPopupParameters', 
        'CustomPopupTest', 
        'file://{resources}/layout/popups/popup_common_alert.xml', 
        'title=' + title + '&message=' + message
    );
}

/**
 * 
 */
function ShowErrorPopup(code)
{
    var errorMsg = 'An internal server problem has occurred! Try again in a few minutes.';
    
    if ( code == 0 ) {
        errorMsg = 'The Divine UI servers have not responded. Try again in a few minutes.';
    }
    else if ( code == 403 ) {
        errorMsg = 'Permission denied: To verify that you are the owner of this Steam account change your name temporarily and include the word: [DU]';
    }
    else if ( code == 503 ) {
        errorMsg = 'We had problems recovering information from OpenDota or Steam. Retry.';
    }

    ShowMessagePopup('Oops! A problem has occurred', errorMsg);

    $.Msg('Internal Server Error: ' + code);
    $.Msg(errorMsg);
}

/**
 * Make the request to load a player's profile
 * @param {string} steamID3 Steam ID-3/Account ID
 * @param {function} callback 
 */
function LoadProfile(steamID3, callback)
{
    $.Msg('Loading Profile of ' + steamID3 + '...');
    $.AsyncWebRequest(GetHost() + '/profile/', {
        type: 'GET',
        data: {
            'steam_id3': steamID3
        },
        complete: callback,
        timeout: 6000
    });
}

/**
 * Make the request to load the list of available profile backgrounds.
 * @param {string} steamID3 Steam ID-3/Account ID
 * @param {function} callback 
 */
function LoadAvailableBackgrounds(steamID3, callback)
{
    //$.Msg('Loading Backgrounds of ' + steamID3);
    $.AsyncWebRequest(GetHost() + '/profile/background/available', {
        type: 'GET',
        data: {
            'steam_id3': steamID3
        },
        complete: callback,
        timeout: 6000
    });
}

/**
 * Upload the changes to the Hero Showcase to the server.
 * @param {object} formData Request information
 * @param {function} callback 
 */
function UploadShowcase(formData, callback)
{
    $.Msg('Uploading Hero Showcase...');
    
    $.AsyncWebRequest(GetHost() + '/profile/hero-showcase', {
        type: 'POST',
        data: formData,
        complete: callback,
        timeout: 6000 // Sigh...
    });
}

/**
 * Upload the profile background changes to the server
 * @param {*} backgroundID Background ID
 * @param {*} callback 
 */
function UploadBackground(steamID3, backgroundID)
{
    $.Msg('Uploading Background (' + backgroundID + ')...');

    $.AsyncWebRequest(GetHost() + '/profile/background', {
        type: 'POST',
        data: {
            'background_id': backgroundID,
            'steam_id3': steamID3
        },
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                ShowErrorPopup(response.status);
                return;
            }

            $.Msg('Upload complete!');
        },
        //complete: callback,
        timeout: 6000
    });
}

/**
 * 
 * @param {*} steamID64
 * @param {*} solo 
 * @param {*} party 
 */
function UploadMMR(steamID64, solo, party)
{
    $.Msg('Uploading MMR...');
    
    $.AsyncWebRequest(GetHost() + '/profile/mmr', {
        type: 'POST',
        data: {
            'steam_id64': steamID64,
            'solo_mmr': solo,
            'party_mmr': party
        },
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                var errorMsg = 'An internal server problem has occurred! Try again in a few minutes.';

                if ( response.status == 0 ) {
                    errorMsg = 'The Divine UI servers have not responded. Try again in a few minutes.';
                }
                else if ( response.status == 403 ) {
                    errorMsg = 'Permission denied: To verify that you are the owner of this Steam account change your name temporarily and include the word: [DU]';
                }
                else if ( response.status == 503 ) {
                    errorMsg = 'We had problems recovering information from OpenDota or Steam. Retry.';
                }

                $.Msg('Internal Server Error: ' + response.status);
                $.Msg(errorMsg);

                $.DispatchEvent('AddStyle', $('#SoloMMRValue'), 'UploadFailed');
                return;
            }

            $.DispatchEvent('AddStyle', $('#SoloMMRValue'), 'UploadComplete');
            $.Msg('Upload complete!');
        },
        timeout: 6000
    });
}

/**
 * 
 * @param {*} steamID3 
 * @param {*} optionName 
 * @param {*} optionValue 
 */
function UploadSettings(steamID3, optionName, optionValue)
{
    $.Msg('Uploading Settings Option (' + optionName + ')...');
    
    $.AsyncWebRequest(GetHost() + '/profile/settings', {
        type: 'POST',
        data: {
            'steam_id3': steamID3,
            'option_name': optionName,
            'option_value': optionValue
        },
        complete: function(response) {
            // Request failed
            if ( response.status !== 200 ) {
                ShowErrorPopup(response.status);
                return;
            }

            $.Msg('Upload complete!');
        },
        //complete: callback,
        timeout: 6000
    });
}

/**
 * 
 */
function CheckVersion()
{
    $.Msg('Welcome to Divine UI!');
    $.Msg('Version: ' + sVersion);
    $.Msg('Checking that we have the latest version...');

    $.AsyncWebRequest('https://raw.githubusercontent.com/dota2-divine-ui/divine-ui/master/version.txt', {
        type: 'GET',
        complete: function(response) {
            if ( response.status !== 200 ) {
                $.Msg('We could not get the latest version!');
                $.Msg('Internal Server Error: ' + response.status);
                return;
            }

            sLatestVersion = response.responseText;
            sLatestVersion = sLatestVersion.replace(/\\n/g, "\\n")  
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f")
            .replace(/[\u0000-\u0019]+/g,"").trim();

            if ( sVersion !== sLatestVersion ) {
                $.Msg('New version: ' + sLatestVersion);
                $.DispatchEvent('AddStyle', $('#DivineUIButton'), 'UpdateAvailable');
            }
            else {
                $.Msg('This is the latest version :)');
            }
        },
        timeout: 6000
    });
}