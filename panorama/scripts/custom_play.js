/**
 * ID of the Custom Game Mode we want to play
 */
var iCustomGameID = 0;

/**
 * Set how many custom games should appear on the list.
 */
var iMaxCustomGames = 5;

/**
 * What happens when the play button is clicked
 */
function CustomPlayButtonClicked()
{
    // We get some references to know how the button should act
    var customGameVisible = $('#CustomGamesSectionContent').visible;
    var playPanelVisible = $.GetContextPanel().BHasClass('SlideOutVisible');
    
    // Do we want to start a Custom Game?
    var isCustomGame = (customGameVisible && playPanelVisible && iCustomGameID > 0);

    if ( isCustomGame ) {
        // Close the panel (to avoid a bug) and auto-play the custom game.
        $.DispatchEvent('DOTAPlayPanelCloseButtonClicked', true);

        $.Schedule(0.3, function() {
            $.DispatchEvent('DOTAAutoPlayCustomGame', iCustomGameID);
        });
    }
    else {
        // Fire the original event
        $.DispatchEvent('DOTAPlayButtonClicked');
    }
}

/**
 * Set the ID of the Custom Game we want to play
 */
function SetFrostivusGame(id)
{
    // We want to play...
    iCustomGameID = id;

    /*
    FIXME: This does not work correctly, once you change the text of the button there is no going back...
    var buttonLabel = $('#PlayButtonLabel');

    // Change the play button text
    if ( id == 0 ) {
        buttonLabel.text = $.Localize('#DOTA_Play_Frostivus_Title');
    }
    else {
        buttonLabel.text = $.Localize('#DOTA_Custom_Game_Workshop_Page');
    }
    */
}

/**
 * Custom Game Modes loaded.
 * @param {*} response 
 */
function OnLoadCustomGames(response)
{
    $('#CustomTopGamesContainer').RemoveAndDeleteChildren();
    $('#CustomOtherGamesContainer').RemoveAndDeleteChildren();

    // Top Custom Games
    if ( response.top && response.top.length > 0 ) {
        // More than the limit, unfortunately we will have to shuffle them
        if ( response.top.length > iMaxCustomGames ) {
            response.top = shuffle(response.top);
        }

        for( var it = 0; it <= (iMaxCustomGames-1); it++ ) {
            var item = response.top[it];
            var name = item.name;

            if ( name.length > 10 ) {
                name = name.substring(0, 10) + '...';
            }

            $('#CustomTopGamesContainer').BCreateChildren('<RadioButton id="' + item.id + '" class="PlayTabRadio" group="FrostivusGameGroup" text="' + name + '" onactivate="SetFrostivusGame(' + item.id + ')" onmouseover="UIShowTextTooltipStyled(\'' + item.name + ': ' + item.description + '\', GameModeTooltip)" onmouseout="UIHideTextTooltip()" />');
        }
    }

    // Other Custom Games
    if ( response.other && response.other.length > 0 ) {
        response.other = shuffle(response.other);

        for( var it = 0; it <= (iMaxCustomGames-1); it++ ) {
            var item = response.other[it];

            if ( item == null || item.name == null ) {
                continue;
            }

            var name = item.name;

            if ( name.length > 10 ) {
                name = name.substring(0, 10) + '...';
            }

            $('#CustomOtherGamesContainer').BCreateChildren('<RadioButton id="' + item.id + '" class="PlayTabRadio" group="FrostivusGameGroup" text="' + name + '" onactivate="SetFrostivusGame(' + item.id + ')" onmouseover="UIShowTextTooltipStyled(\'' + item.name + '\', GameModeTooltip)" onmouseout="UIHideTextTooltip()" />');
        }
    }
}

function OnPlayReady()
{
    LoadCustomGames(OnLoadCustomGames);
}