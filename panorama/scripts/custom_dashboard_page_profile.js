var SetEnabledTab = function( strContainerID, strTabID )
{
    for ( var c of $( strContainerID ).Children() )
    {
        c.RemoveClass( 'TabEnabled' );
    }

    var tabNew = $( strTabID );
    tabNew.AddClass( 'TabEnabled' );
};

var OnRecentGamesEnabled = function()
{
    $.DispatchEvent( "DOTAEnsureRecentGamesLoaded", false );
};

var OnTeammateStatsEnabled = function()
{
    $.DispatchEvent( "DOTAEnsureTeammateStatsLoaded" );
};

var OnAllHeroChallengeEnabled = function()
{
    $.DispatchEvent( "DOTAProfileLoadAllHeroChallenge" );
};

var OnPageSetupSuccess = function()
{
    Profile.request();

    if ( $( '#RecentGamesOption' ).checked )
    {
        OnRecentGamesEnabled();
    }
    else
    {
        if ( $('#RecentGamesOption' ).visible ) {
            $.DispatchEvent( "DOTAProfileActivateTab", 1 );
        }
        else {
            $.DispatchEvent( "DOTAProfileActivateTab", 0 );
        }
    }
};

var SetRecentGamesOptionsVisible = function( bVisible )
{
    $( '#RecentGamesOptionsContainer' ).SetHasClass( 'Active', bVisible );
    $( '#RecentGamesOptionsButton' ).SetHasClass( 'Active', bVisible );
}

var ToggleRecentGamesOptions = function()
{
    SetRecentGamesOptionsVisible( !$( '#RecentGamesOptionsContainer' ).BHasClass( 'Active' ) );
};

var Resolve = function( strEvent )
{
    for ( var i = 0; i < arguments.length; i++ )
    {
        // Resolve any string that looks like a dialog variable
        if ( ( typeof arguments[i] === 'string' ) && ( arguments[i][0] == '{' ) )
        {
            arguments[i] = $.Localize( arguments[i], $.GetContextPanel() );
        }
    }
    $.DispatchEvent.apply( $, arguments );
};

var ActivateMoreInfoTab = function()
{
    SetEnabledTab( '#ProfileContentRightContents', '#MoreInfo' );
    SetRecentGamesOptionsVisible( false );
};

/*
var ActivateFeedTab = function()
{
    SetEnabledTab( '#ProfileContentRightContents', '#SocialFeed' );
    SetRecentGamesOptionsVisible( false );
};
*/

var ActivateRecentGamesTab = function()
{
    SetEnabledTab( '#ProfileContentRightContents', '#RecentGames' );
    OnRecentGamesEnabled();
};

var ActivateAllHeroChallengeTab = function()
{
    SetEnabledTab( '#ProfileContentRightContents', '#AllHeroChallenge' );
    OnAllHeroChallengeEnabled();
    SetRecentGamesOptionsVisible( false );
};

/*
var ActivateTeammateStatsTab = function()
{
    SetEnabledTab( '#ProfileContentRightContents', '#TeammateStats' );
    OnTeammateStatsEnabled();
    SetRecentGamesOptionsVisible( false );
};
*/

$.RegisterEventHandler( 'DOTAProfileActivateTab', $.GetContextPanel(), function( eTab )
{
    /*
    if ( eTab == 0 )
    {
        $( "#ActivityFeedOption" ).checked = true;
        ActivateFeedTab();
    }
    else*/ 
    if ( eTab == 0 )
    {
        $( "#MoreInfoOption" ).checked = true;
        ActivateMoreInfoTab();
    }
    else if ( eTab == 1 )
    {
        $( "#RecentGamesOption" ).checked = true;
        ActivateRecentGamesTab();
    }
    else if ( eTab == 2 )
    {
        $( "#AllHeroChallengeOption" ).checked = true;
        ActivateMoreInfoTab();
    }
    else if ( eTab == 3 )
    {
        $( "#TeammateStatsOption" ).checked = true;
        ActivateTeammateStatsTab();
    }
});