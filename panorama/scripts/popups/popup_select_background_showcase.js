function OnLoad()
{
    FillWithAvailableBgs('BackgroundsPanel');
}

function SelectBackground(background)
{
    var heroName = $.GetContextPanel().GetAttributeString('hero_name', 'invalid');

    // Set Data
    var hero_id = GetHeroName(heroName);
    var steam_id = $('#DummyUserName').steamid;

    $.Msg('Hero-ID: ', hero_id);
    $.Msg('Steam-ID: ', steam_id);
    $.Msg('Background: ', background);

    // Loading!
    $('#BackgroundSelectionPanel').visible = false;
    $('#LoadingPanel').visible = true;

    // Upload!
    UploadShowcase({
        'steam_id': steam_id,
        'hero_id': hero_id,
        'background_id': background,
        'rating': $.GetContextPanel().GetAttributeString('rating', '0'),
        'win_rate': $.GetContextPanel().GetAttributeString('win_rate', '?'),
        'avg_kills': $.GetContextPanel().GetAttributeString('avg_kills', '-1'),
        'avg_deaths': $.GetContextPanel().GetAttributeString('avg_deaths', '-1'),
        'avg_assists': $.GetContextPanel().GetAttributeString('avg_assists', '-1'),
        'gpm': $.GetContextPanel().GetAttributeString('gpm', '-1'),
        'xpm': $.GetContextPanel().GetAttributeString('xpm', '-1')
    }, function(response, statusText) {
        // Request failed
        if ( response.status !== 200 ) {
            var errorMsg = 'An internal server problem has occurred! Try again in a few minutes.';

            // The server has not responded
            if ( response.status == 0 ) {
                errorMsg = 'The Divine UI servers have not responded. Try again in a few minutes.';
            }
            else if ( response.status == 403 ) {
                errorMsg = 'Permission denied: To verify that you are the owner of this Steam account change your name temporarily and include the word: [DU]';
            }

            // Error :(
            $('#ErrorMsg').text = errorMsg;
            $.Msg('Internal Server Error: ' + response.status);

            $('#LoadingPanel').visible = false;
            $('#BackgroundSelectionPanel').visible = true;
            $('#ErrorMsg').visible = true;

            return;
        }

        // Upload completed
        $.Msg('Upload completed!');

        $.DispatchEvent('DOTAShowProfilePage', 0);
        $.DispatchEvent('DOTAReloadCurrentPage');
        $.DispatchEvent('UIPopupButtonClicked', true);
    });
}