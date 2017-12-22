/**
 * Panel loaded
 */
function OnLoad()
{
    // Create the panels with the backgrounds for the showcase
    FillWithAvailableBgs('BackgroundsPanel');
}

/**
 * The player has selected the background for his showcase!
 * @param {*} background 
 */
function SelectBackground(background)
{
    // Obtain necessary information
    var heroid = $.GetContextPanel().GetAttributeInt('hero_id', 0);
    var heroset = $.GetContextPanel().GetAttributeString('hero_set', 'default');
    var steamid = $('#DummyUserName').steamid;

    if( bIsDebug ) {
        $.Msg('[HeroShowcase] HeroID: ', heroid);
        $.Msg('[HeroShowcase] HeroSet: ', heroset);
        $.Msg('[HeroShowcase] SteamID: ', steamid);
        $.Msg('[HeroShowcase] Background: ', background);
    }

    // Loading!
    $('#BackgroundSelectionPanel').visible = false;
    $('#LoadingPanel').visible = true;

    // Saving...
    SaveShowcase(steamid, {
        'hero_id': heroid,
        'hero_set': heroset,
        'background_id': background,
        'rating': $.GetContextPanel().GetAttributeString('rating', '0'),
        'win_rate': $.GetContextPanel().GetAttributeString('win_rate', '?'),
        'avg_kills': $.GetContextPanel().GetAttributeString('avg_kills', '-1'),
        'avg_deaths': $.GetContextPanel().GetAttributeString('avg_deaths', '-1'),
        'avg_assists': $.GetContextPanel().GetAttributeString('avg_assists', '-1'),
        'gpm': $.GetContextPanel().GetAttributeString('gpm', '-1'),
        'xpm': $.GetContextPanel().GetAttributeString('xpm', '-1')
    }, function(response) {
        // Request failed
        if ( response.status !== 200 ) {
            var errorMsg = GetErrorMessage(response.status);

            // Error :(
            $('#ErrorMsg').text = errorMsg;
            $.Msg('Internal Server Error: ' + response.status);

            $('#LoadingPanel').visible = false;
            $('#BackgroundSelectionPanel').visible = true;
            $('#ErrorMsg').visible = true;

            return;
        }

        $.Msg('[HeroShowcase] Saved!');

        // Show the new showcase for the player
        $.DispatchEvent('DOTAShowProfilePage', 0);
        $.DispatchEvent('DOTAReloadCurrentPage');
        $.DispatchEvent('UIPopupButtonClicked', true);
    });
}