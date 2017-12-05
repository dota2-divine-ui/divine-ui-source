function SetFavoriteHero()
{
    // We force the activation of the statistics panel, 
    // we wait 1s (in what they load) and we obtain the information.
    $.DispatchEvent('DOTAShowHeroPageSubTab', 'StatsTabContents');
    $.Schedule(1.0, PrepareTooltip);
}

function PrepareTooltip()
{
    // We enter the context of the statistics panel, hacks!
    var statsPanel = $.GetContextPanel().GetParent().GetParent().GetParent().FindChildTraverse('StatsTabContents');

    // TY volvo
    var params = {
        'hero_name': $('#DummyHeroID').text,
        'rating': statsPanel.FindChildTraverse('HeroStatsRatingBar').value,
        'win_rate': statsPanel.FindChildTraverse('HeroStatsWinRate').text,
        'avg_kills': statsPanel.FindChildTraverse('HeroStatsAvgKills').text,
        'avg_deaths': statsPanel.FindChildTraverse('HeroStatsAvgDeaths').text,
        'avg_assists': statsPanel.FindChildTraverse('HeroStatsAvgAssists').text,
        'gpm': statsPanel.FindChildTraverse('HeroStatsAvgGPM').text,
        'xpm': statsPanel.FindChildTraverse('HeroStatsAvgXPM').text
    };

    $.DispatchEvent(
        'UIShowCustomLayoutPopupParameters', 
        'CustomPopupTest', 
        'file://{resources}/layout/popups/popup_select_background_showcase.xml', 
        http_build_query(params)
    );
}

function SetupPanel()
{
    var heroName = $('#DummyHeroID').text;

    if ( heroName != 'hero_id' ) {
        $('#SetHeroShowcaseButton').visible = true;
    }
    else {
        $('#SetHeroShowcaseButton').visible = false;
    }
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