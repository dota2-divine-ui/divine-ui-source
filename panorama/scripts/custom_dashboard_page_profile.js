var bPreparingProfile = false;

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

var SetViewPanel = function(viewPanel)
{
    // Main Panel
    if ( viewPanel == 0 ) {
        $.DispatchEvent('RemoveStyle', $('#MainViewPanel'), 'Hidden');
        $.DispatchEvent('RemoveStyle', $('#DetailsViewPanel'), 'Visible');
        $('#OpenExtendedView').visible = true;
        $('#OpenMainView').visible = false;
    }
    else {
        $.DispatchEvent('AddStyle', $('#MainViewPanel'), 'Hidden');
        $.DispatchEvent('AddStyle', $('#DetailsViewPanel'), 'Visible');
        $('#OpenExtendedView').visible = false;
        $('#OpenMainView').visible = true;

        $.Schedule(0.3, function() {
            $('#MoreInfo').ScrollToTop();
            $('#RecentGamesTable').ScrollToTop();
        });
    }
};

var SetupOpenDotaProfile = function(response)
{
    var data = response.player_data;
    var settings = response.settings;
    var custom = response.custom_data;

    var mmrTitle = '';
    var mmrValue = null;

    if ( settings == null ) {
        settings = {
            mmr_section: 'estimated'
        };
    }

    if ( settings.mmr_section == null || settings.mmr_section == 'estimated' ) {
        if ( data.mmr_estimate && data.mmr_estimate.estimate ) {
            mmrTitle = 'Estimated MMR';
            mmrValue = number_format(data.mmr_estimate.estimate);
        }
    }
    else if ( settings.mmr_section == 'old' ) {
        if ( data.solo_competitive_rank ) {
            mmrTitle = 'Pre-Season MMR';
            mmrValue = number_format(data.solo_competitive_rank);
        }
    }
    else if ( settings.mmr_section == 'solo' ) {
        mmrTitle = 'Solo MMR';

        if ( custom == null || custom.mmr == null || custom.mmr.solo == null || isNaN(custom.mmr.solo) ) {
            mmrValue = 'Not configured';
        }
        else if ( custom.mmr.solo <= 0 ) {
            mmrValue = 'TBD';
        }
        else {
            mmrValue = number_format(custom.mmr.solo);
        }
    }
    else if ( settings.mmr_section == 'party' ) {
        mmrTitle = 'Party MMR';
        
        if ( custom == null || custom.mmr == null || custom.mmr.party == null || isNaN(custom.mmr.party) ) {
            mmrValue = 'Not configured';
        }
        else if ( custom.mmr.party <= 0 ) {
            mmrValue = 'TBD';
        }
        else {
            mmrValue = number_format(custom.mmr.party);
        }
    }

    if ( mmrValue ) {
        $('#MmrTitle').text = mmrTitle;
        $('#MmrValue').text = mmrValue;
        $('#MmrPanel').visible = true;
    }

    if ( data.solo_competitive_rank ) {
        $('#OldMmrValue').text = number_format(data.solo_competitive_rank);
        $('#OldMmrPanel').visible = true;
    }

    if ( data.profile.is_pro ) {
        $.DispatchEvent('AddStyle', $('#Header'), 'ProBackground');

        $('#ProNameValue').text = data.profile.team_tag + '.' + data.profile.name;
        $('#ProPanel').visible = true;
    }
};

var toHHMMSS = function(secs)
{
    var sec_num = parseInt(secs, 10)    
    var hours   = Math.floor(sec_num / 3600) % 24
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60    
    return [hours,minutes,seconds]
        .map(function(v) { return  v < 10 ? "0" + v : v; })
        .filter(function(v,i) { return v !== "00" || i > 0; })
        .join(":")
}

var SetupHeroShowcase = function(data)
{
    if ( data.background_id != 'none' ) {
        $.Schedule(0.5, function() {
            $('#BackgroundPanel').BCreateChildren('<DOTAScenePanel id="BackgroundPreview" map="showcase_backgrounds/' + data.background_id + '" camera="default" particleonly="false" light="global_light" live-mode="high_end_only" />');
        });
    }

    var drawbackground = 'false';
    var cssclass = 'WithBackground';

    if ( data.background_id == 'none' ) {
        drawbackground = 'true';
        cssclass = 'WithoutBackground';
    }
    else {
        $.DispatchEvent('AddStyle', $('#HeroAvgStatsPanel'), 'WithBackground');
    }

    $.Schedule(0.5, function() {
        $('#PreviewPanel').BCreateChildren('<DOTAScenePanel id="HeroPreview" class="' + cssclass + '" unit="' + data.hero_id + '" antialias="true" particleonly="false" drawbackground="' + drawbackground + '" />');
    });

    if ( data.hero_stats ) {
        $('#RatingProgress').value = parseFloat(parseFloat(data.hero_stats.rating).toFixed(2));
        $('#WinRate').text = data.hero_stats.win_rate;
        $('#AvgKills').text = data.hero_stats.avg_kills;
        $('#AvgDeaths').text = data.hero_stats.avg_deaths;
        $('#AvgAssists').text = data.hero_stats.avg_assists;
        $('#AvgGPM').text = data.hero_stats.gpm;
        $('#AvgXPM').text = data.hero_stats.xpm;

        /*
        $('#HeroDamagePerMinute').text = Math.round(data.last_match.benchmarks.hero_damage_per_min.raw);
        $('#LastHitPerMinute').text = Math.round(data.last_match.benchmarks.last_hits_per_min.raw);
        $('#TowerDamage').text = Math.round(data.last_match.benchmarks.tower_damage.raw);
        $('#MatchDuration').text = toHHMMSS(data.last_match.duration);
        */

        $('#HeroAvgStatsPanel').visible = true;
        $('#HeroStatsPanel').visible = true;
    }
};

var SetupSettings = function(data)
{
    // Profile Background
    if ( data.background_id ) {
        // We wait 0.5s for the backgrounds to load.
        $.Schedule(0.5, function() {
            ApplyProfileBackground(data.background_id);
        });
    }

    // MMR Section
    if ( data.mmr_section ) {
        if ( data.mmr_section == 'old' ) {
            $('#MmrSectionOption').SetSelected('OldMmrOption');
        }
        else if ( data.mmr_section == 'solo' ) {
            $('#MmrSectionOption').SetSelected('SoloMmrOption');
        }
        else if ( data.mmr_section == 'party' ) {
            $('#MmrSectionOption').SetSelected('PartyMmrOption');
        }
        else if ( data.mmr_section == 'none' ) {
            $('#MmrSectionOption').SetSelected('NoneMmrOption');
        }
    }
};

var SetTopHeroesTab = function(type)
{
    if ( type == 'favorites' ) {
        $.DispatchEvent('AddStyle', $('#FavoritesTab'), 'Enabled');
        $.DispatchEvent('RemoveStyle', $('#WinsTab'), 'Enabled');
        $('#FavoritesHeroesPanel').visible = true;
        $('#WinRateHeroesPanel').visible = false;
    }
    else {
        $.DispatchEvent('RemoveStyle', $('#FavoritesTab'), 'Enabled');
        $.DispatchEvent('AddStyle', $('#WinsTab'), 'Enabled');
        $('#FavoritesHeroesPanel').visible = false;
        $('#WinRateHeroesPanel').visible = true;
    }
};

var SetupTopHeroes = function(data)
{
    $('#TopHeroesPanel').BCreateChildren('<Panel id="FavoritesHeroesPanel" class="TopHeroesContainer" />');
    $('#TopHeroesPanel').BCreateChildren('<Panel id="WinRateHeroesPanel" class="TopHeroesContainer" />');

    if ( data.favorites ) {
        for( it in data.favorites ) {
            var hero = data.favorites[it];
            hero.hero_data = GetHeroDataById(hero.hero_id);

            var template = '<Panel class="HeroContainer"> \
                <Label text="' + hero.games + ' - ' + hero.hero_data.localized_name + '" /> \
                <Panel class="RotatedEffect"> \
                    <Panel class="HeroMovie" style="background-image: url(\'file://{resources}/videos/heroes/' + hero.hero_data.name + '.webm\');" /> \
                </Panel> \
            </Panel>';

            $('#FavoritesHeroesPanel').BCreateChildren(template);
        }

        for( it in data.wins ) {
            var hero = data.wins[it];
            hero.hero_data = GetHeroDataById(hero.hero_id);

            var template = '<Panel class="HeroContainer"> \
                <Label text="' + hero.win + ' - ' + hero.hero_data.localized_name + '" /> \
                <Panel class="RotatedEffect"> \
                    <Panel class="HeroMovie" style="background-image: url(\'file://{resources}/videos/heroes/' + hero.hero_data.name + '.webm\');" /> \
                </Panel> \
            </Panel>';

            $('#WinRateHeroesPanel').BCreateChildren(template);
        }
    }

    $('#TopHeroesPanel').visible = true;
    SetTopHeroesTab('wins');
};

var OnProfileLoaded = function(response, statusText)
{
    $('#PreviewSpinner').visible = false;

    // Request failed
    if ( response.status !== 200 ) {
        var errorMsg = 'An internal server problem has occurred! Reload the panel in a few seconds...';

        // The server has not responded
        if ( response.status == 0 ) {
            errorMsg = 'The Divine UI servers have not responded. Reload the panel in a few seconds...';
        }
        else if ( response.status == 503 ) {
            errorMsg = 'We had problems recovering information from OpenDota or Steam. Retry.';
        }

        // Error :(
        $('#ServerError').text = errorMsg;
        $('#ServerError').visible = true;

        $.Msg('Internal Server Error: ' + response.status);
        return;
    }

    response = JSON_Parse(response.responseText);

    bPreparingProfile = true;

    // Settings
    if ( response.settings ) {
        SetupSettings(response.settings);
    }

    // Hero Showcase
    if ( response.hero_showcase ) {
        SetupHeroShowcase(response.hero_showcase);
    }
    else {
        $('#NoShowcasePanel').visible = true;
    }

    // Player Data
    if ( response.player_data ) {
        SetupOpenDotaProfile(response);
    }

    // Top Heroes
    if ( response.top_heroes ) {
        SetupTopHeroes(response.top_heroes);
    }

    bPreparingProfile = false;
}

var OnAvailableBackgroundsLoaded = function(response)
{
    if ( response.status !== 200 ) {
        $.Msg('The server has not responded to the request. The server is down! D:');
        return;
    }

    response = JSON_Parse(response.responseText);

    $('#ProfileBackgroundsPanel').BCreateChildren('<Panel id="AvailableBackgroundsPanel" class="AvailableBackgroundsList" />');
    $('#CustomProfileBackgroundsPanel').BCreateChildren('<Panel id="AvailableCustomBackgroundsPanel" class="AvailableBackgroundsList" />');

    for ( var it in response.common ) {
        var backgroundImage = 'url(\'file://{images}/loadingscreens/' + response.common[it] + '/loadingscreen_tga.vtex\'), url(\'file://{images}/loadingscreens/' + response.common[it] + '/loadingscreen.vtex\'), url(\'file://{resources}/videos/loadingscreens/' + response.common[it] + '/loadingscreen.webm\')';
        $('#AvailableBackgroundsPanel').BCreateChildren('<Panel onactivate="SetProfileBackground(\'' + response.common[it] + '\')" style="background-image: ' + backgroundImage + ';" />');
    }

    $.Schedule(1.0, function() {
        for ( var it in response.custom ) {
            var backgroundImage = 'url(\'file://{images}/loadingscreens/' + response.custom[it] + '/loadingscreen_tga.vtex\'), url(\'file://{images}/loadingscreens/' + response.custom[it] + '/loadingscreen.vtex\'), url(\'file://{resources}/videos/loadingscreens/' + response.custom[it] + '/loadingscreen.webm\')';
            $('#AvailableCustomBackgroundsPanel').BCreateChildren('<Panel onactivate="SetProfileBackground(\'' + response.custom[it] + '\')" style="background-image: ' + backgroundImage + ';" />');
        }
    });
}

var SetProfileBackground = function(background_id)
{
    var steamID3 = $('#FriendsID').text;
    UploadBackground(steamID3, background_id);

    if ( background_id == 'none' ) {
        $.Schedule(0.6, function() {
            $.DispatchEvent('DOTAReloadCurrentPage');
        });
    }
    else {
        ApplyProfileBackground(background_id);
    }
};

var ApplyProfileBackground = function(background_id)
{
    if ( $('#ProfileBackground') != null ) {
        $('#ProfileBackground').DeleteAsync(0);
    }

    $.Schedule(0.3, function() {
        if ( background_id == 'none' ) {
            $.DispatchEvent('RemoveStyle', $('#ProfileContent'), 'HasBackground');
        }
        else {
            $.DispatchEvent('AddStyle', $('#ProfileContent'), 'HasBackground');
            $('#ProfileBackgroundContainer').BCreateChildren('<Panel id="ProfileBackground" style="background-image: url(\'file://{images}/loadingscreens/' + background_id + '/loadingscreen_tga.vtex\'), url(\'file://{images}/loadingscreens/' + background_id + '/loadingscreen.vtex\'), url(\'file://{resources}/videos/loadingscreens/' + background_id + '/loadingscreen.webm\');" />');
        }
    });
};

var ClearProfile = function()
{
    // Remove the Last Background
    if ( $('#StatMMR') != null ) {
        $('#StatMMR').DeleteAsync(0);
    }

    // Remove the Last Hero
    if ( $('#StatTeam') != null ) {
        $('#StatTeam').DeleteAsync(0);
    }

    // Remove the Last Hero
    if ( $('#HeroPreview') != null ) {
        $('#HeroPreview').DeleteAsync(0);
    }

    // Remove the Last Hero
    if ( $('#BackgroundPreview') != null ) {
        $('#BackgroundPreview').DeleteAsync(0);
    }

    if ( $('#AvailableBackgroundsPanel') != null ) {
        $('#AvailableBackgroundsPanel').DeleteAsync(0);
    }

    if ( $('#AvailableCustomBackgroundsPanel') != null ) {
        $('#AvailableCustomBackgroundsPanel').DeleteAsync(0);
    }

    if ( $('#FavoritesHeroesPanel') != null ) {
        $('#FavoritesHeroesPanel').DeleteAsync(0);
    }

    if ( $('#WinRateHeroesPanel') != null ) {
        $('#WinRateHeroesPanel').DeleteAsync(0);
    }

    $('#TopHeroesPanel').visible = false;

    // No errors, whew!
    $('#ServerError').visible = false;

    // No background
    ApplyProfileBackground('none');

    $('#ProPanel').visible = false;
    $('#MmrPanel').visible = false;
    $('#OldMmrPanel').visible = false;

    $.DispatchEvent('RemoveStyle', $('#Header'), 'ProBackground');
    $.DispatchEvent('RemoveStyle', $('#HeroAvgStatsPanel'), 'WithBackground');

    $('#HeroAvgStatsPanel').visible = false;
    $('#HeroStatsPanel').visible = false;
    $('#PreviewSpinner').visible = true;
    $('#NoShowcasePanel').visible = false;
};

var RequestProfile = function()
{
    ClearProfile();

    var steamID3 = $('#FriendsID').text;
    LoadProfile(steamID3, OnProfileLoaded);
    LoadAvailableBackgrounds(steamID3, OnAvailableBackgroundsLoaded);
};

var OnPageSetupSuccess = function()
{
    RequestProfile();

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

$.RegisterEventHandler('DropDownSelectionChanged', $('#MmrSectionOption'), function() 
{
    if ( bPreparingProfile ) {
        return;
    }

    var selected = $('#MmrSectionOption').GetSelected();

    if ( selected == null ) {
        $.Msg('DropDownSelectionChanged without Selected!');
        return;
    }

    var value = '';

    if ( selected.id == 'EstimatedMmrOption' ) {
        value = 'estimated';
    }
    else if ( selected.id == 'OldMmrOption' ) {
        value = 'old';
    }
    else if ( selected.id == 'SoloMmrOption' ) {
        value = 'solo';
    }
    else if ( selected.id == 'PartyMmrOption' ) {
        value = 'party';
    }
    else if ( selected.id == 'NoneMmrOption' ) {
        value = 'none';
    }

    var steamID3 = $('#FriendsID').text;
    UploadSettings(steamID3, 'mmr_section', value);
})

/*
$.RegisterEventHandler('DOTAScenePanelSceneLoaded', $.GetContextPanel(), function(sceneID)
{
    if ( sceneID == 'BackgroundPreview' ) {
        LoadHeroShowcase();
    }
});
*/