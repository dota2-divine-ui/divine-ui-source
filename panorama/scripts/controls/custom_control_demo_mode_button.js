/**
 * Indicates if we are waiting for the player to select a set for his hero.
 */
var bWaitingSet = false;

/**
 * ID of the hero that we will establish as a favorite.
 */
var nHeroId = 0;

/**
 * Full Set name that the hero will wear.
 */
var sHeroSet = 'default';

/**
 * 
 */
var pPageContents = $.GetParentPanel('PageContents');

/**
 * The player has established that the hero of the current page is his favorite
 */
function SetFavoriteHero()
{
    // It is already waiting for a set...
    if( bWaitingSet ) {
        return;
    }

    // Our name does not have the keyword, we need it!
    if( !CanEditProfile() ) {
        ShowMessagePopup($.Localize('#DU_ErrorTitle'), $.Localize('#DU_Error403'));
        $.DispatchEvent('DOTAShowProfilePage', 0);
        return;
    }

    var setPicker = pPageContents.FindChildTraverse('HeroSetPicker');

    if( setPicker == null ) {
        $.Msg('[HeroShowcase] The #HeroSetPicker panel has not been found, lets assume there are no sets available for this hero');
        PreSetupTooltip();
        return;
    }

    var arrowPicker = setPicker.FindChildTraverse('MenuArrowContainer');

    if( arrowPicker == null || arrowPicker.visible == false ) {
        $.Msg('[HeroShowcase] The #MenuArrowContainer panel has not been found or is not visible, there are no sets available for this hero');
        PreSetupTooltip();
        return;
    }

    // Waiting...
    bWaitingSet = true;

    // We indicate that the button is waiting...
    $('#SetHeroShowcaseLabel').text = $.Localize('#DU_FavoriteHeroButtonDisabled');

    // Instructions
    ShowMessagePopup($.Localize('#DU_ShowcaseSelectSetTitle'), $.Localize('#DU_ShowcaseSelectSetDescription'), 'file://{images}/help/36aa2feac0fcee39c0da1a8b2c95c7a9.jpg');

    // Show the hats section.
    $.DispatchEvent('DOTAShowHeroPageSubTab', 'LoadoutTabContents');
}

/**
 * Open the stats section to collect the information and show a popup to select the hero's background.
 */
function PreSetupTooltip()
{
    // Force the activation of the stats panel
    $.DispatchEvent('DOTAShowHeroPageSubTab', 'StatsTabContents');

    // Wait 1s (in what they load) and we obtain the information.
    $.Schedule(1.5, SetupTooltip);

    // Activate the button for its use again.
    EnableFavoriteButton();
}

/**
 * Prepare the tooltip with the background selection for the showcase.
 */
function SetupTooltip()
{
    // A set has not been selected, so we do not know the hero ID. We need to find out by name.
    if( nHeroId == 0 ) {
        var heroName = $.Localize('{g:dota_hero_name:hero_id}', $.GetContextPanel());
        var hero = GetHeroData(heroName);
        nHeroId = hero.id;
    }

    // ???
    if( nHeroId == 0 ) {
        ShowMessagePopup('Invalid Hero');
        return;
    }

    // We enter the context of the stats panel, hacks!
    var statsPanel = $.GetParentPanel('PageContents').FindChildTraverse('StatsTabContents');

    // TY volvo
    var params = {
        'hero_id': nHeroId,
        'hero_set': sHeroSet,
        'rating': statsPanel.FindChildTraverse('HeroStatsRatingBar').value,
        'win_rate': statsPanel.FindChildTraverse('HeroStatsWinRate').text,
        'avg_kills': statsPanel.FindChildTraverse('HeroStatsAvgKills').text,
        'avg_deaths': statsPanel.FindChildTraverse('HeroStatsAvgDeaths').text,
        'avg_assists': statsPanel.FindChildTraverse('HeroStatsAvgAssists').text,
        'gpm': statsPanel.FindChildTraverse('HeroStatsAvgGPM').text,
        'xpm': statsPanel.FindChildTraverse('HeroStatsAvgXPM').text
    };

    //
    $.DispatchEvent(
        'UIShowCustomLayoutPopupParameters', 
        'CustomPopupTest', 
        'file://{resources}/layout/popups/popup_select_background_showcase.xml', 
        http_build_query(params)
    );

    //
    $.DispatchEvent('DOTAShowHeroPageSubTab', 'LoadoutTabContents');
}

function EnableFavoriteButton()
{
    //
    $('#SetHeroShowcaseLabel').text = $.Localize('#DU_FavoriteHeroButton');

    bWaitingSet = false;
}

/**
 * 
 */
function SetupPanel()
{
    EnableFavoriteButton();

    nHeroId = 0;
    sHeroSet = 'default';

    var heroName = $.Localize('{g:dota_hero_name:hero_id}', $.GetContextPanel());

    if ( heroName != 'hero_id' ) {
        $('#SetHeroShowcaseButton').visible = true;
    }
    else {
        $('#SetHeroShowcaseButton').visible = false;
    }
}

if( pPageContents != null ) {
    $.Schedule(1.0, function() {
        var setPicker = pPageContents.FindChildTraverse('HeroSetPicker');

        if ( setPicker != null ) {
            $.Msg('DOTAHeroSetSelected');

            // Listen for changes in Full Sets
            $.RegisterEventHandler('DOTAHeroSetSelected', setPicker, function(heroid, type, setName) 
            {
                if( !bWaitingSet ) {
                    return;
                }

                // Custom set, nope...
                if( type == 3 ) {
                    return;
                }

                if( type == 1 || setName.length == 0 ) {
                    setName = 'default';
                }

                nHeroId = heroid;
                sHeroSet = setName;

                PreSetupTooltip();
            });
        }
    });
}




// Listen for any change in cosmetics
/*
$.RegisterForUnhandledEvent( 'DOTAInventoryItemUpdated', function( unItemDef, unItemID, reason )
{
    $.Msg(unItemDef, ' - ', unItemID, ' - ', reason);

    if ( nCosmetics.indexOf(unItemDef) === -1 ) {
        nCosmetics.push(unItemDef);
    }
});

$.RegisterForUnhandledEvent( 'DOTAHeroAssetModifiersUpdated', function( unItemDef, unItemID, reason )
{
    $.Msg('DOTAHeroAssetModifiersUpdated', unItemDef, unItemID, reason);
});

$.RegisterForUnhandledEvent( 'DOTAHeroSavedSetsChanged', function( unItemDef, unItemID, reason )
{
    $.Msg('DOTAHeroSavedSetsChanged', unItemDef, unItemID, reason);
});

$.RegisterForUnhandledEvent( 'DOTAHeroStandingsUpdated', function( unItemDef, unItemID, reason )
{
    $.Msg('DOTAHeroStandingsUpdated', unItemDef, unItemID, reason);
});

$.RegisterForUnhandledEvent( 'DOTAHeroSlotItemPicked', function( unItemDef, unItemID, reason )
{
    $.Msg('DOTAHeroSlotItemPicked', unItemDef, unItemID, reason);
});

$.RegisterForUnhandledEvent( 'DOTAHeroSetSelected', function( unItemDef, unItemID, reason )
{
    $.Msg('DOTAHeroSetSelected', unItemDef, unItemID, reason);
});
*/