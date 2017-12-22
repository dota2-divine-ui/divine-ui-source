/**
 * 
 */
var Profile =
{
    /**
     *
     */
    steamid: 0,

    /**
     *
     */
    loaded: false,

    /**
     *
     */
    data: {
        player: null,
        custom: null,
        hero_showcase: null,
        settings: null,
        top_heroes: null
    },

    /**
     *
     */
    request: function()
    {
        // Clean the previous profile
        this.clear();

        // Get the Steam ID
        this.steamid = $('#AvatarImage').steamid;

        // Loading...
        LoadProfile(this.steamid, {
            onProfile: this.onProfileLoaded,
            onError: this.onError,
            onSection: {
                custom_data: this.onCustomDataLoaded,
                hero_showcase: this.onHeroShowcaseLoaded,
                settings: this.onSettingsLoaded,
                top_heroes: this.onTopHeroesLoaded
            }
        });

        LoadAvailableBackgrounds(this.steamid, this.onAvailableBackgroundsLoaded);
    },

    /**
     *
     */
    clear: function()
    {
        // New Profile
        this.data = {
            player: null,
            custom: null,
            hero_showcase: null,
            settings: null,
            top_heroes: null
        };

        // Remove the panels from a previous profile
        $.RemovePanel('StatMMR');
        $.RemovePanel('StatTeam');
        $.RemovePanel('HeroPreview');
        $.RemovePanel('BackgroundPreview');
        $.RemovePanel('AvailableBackgroundsPanel');
        $.RemovePanel('AvailableCustomBackgroundsPanel');
        $.RemovePanel('FavoritesHeroesPanel');
        $.RemovePanel('WinRateHeroesPanel');

        // We need to get the information first...
        $('#PreviewSpinner').visible = true;

        //$('#ServerHint').visible = false;
        $('#TopHeroesPanel').visible = false;
        $('#ProPanel').visible = false;
        $('#MmrPanel').visible = false;
        $('#OldMmrPanel').visible = false;
        $('#HeroAvgStatsPanel').visible = false;
        $('#HeroStatsPanel').visible = false;
        $('#NoShowcasePanel').visible = false;

        // No errors, yeah!
        $('#ServerError').visible = false;
        $('#ServerHint2').visible = false;

        // No background
        this.applyBackground('none');

        //
        $.DispatchEvent('RemoveStyle', $('#Header'), 'ProBackground');
    },

    /**
     * 
     */
    refresh: function()
    {
        $.RemovePanel('FavoritesHeroesPanel');
        $.RemovePanel('WinRateHeroesPanel');
    },

    /**
     * 
     */
    onError: function(response)
    {
        var errorMsg = GetErrorMessage(response.status);

        $('#PreviewSpinner').visible = false;
        $('#ServerHint').visible = false;

        // Error :(
        $('#ServerError').text = errorMsg;
        $('#ServerHint2').text = errorMsg;
        $('#ServerError').visible = true;

        $.Msg('Internal Server Error: ' + response.status);
        $.Msg(errorMsg);
    },

    /**
     * Showing the MMR requires several sections that may or may not load.
     * This needs to be called every time a necessary section loads.
     */
    setupMMR: function()
    {
        var self = Profile;

        // Shortcuts
        var player = self.data.player;
        var settings = self.data.settings;
        var custom = self.data.custom;

        // This is necessary
        if ( player == null ) {
            return;
        }

        // MMR
        var title = '';
        var value = null;

        // The options have not been loaded or not configured.
        if( settings == null ) {
            settings = {
                mmr_section: 'estimated'
            };
        }

        if( settings.mmr_section == null || settings.mmr_section == 'estimated' ) {
            if( player.mmr_estimate && player.mmr_estimate.estimate ) {
                title = $.Localize('#DU_EstimatedMMR');
                value = number_format(player.mmr_estimate.estimate);
            }
        }
        else if( settings.mmr_section == 'old' ) {
            if( player.solo_competitive_rank ) {
                title = $.Localize('#DU_PreSeasonMMR');
                value = number_format(player.solo_competitive_rank);
            }
        }
        else if( settings.mmr_section == 'solo' ) {
            title = $.Localize('#DU_SoloMMR');

            if( custom == null || custom.mmr == null || custom.mmr.solo == null || isNaN(custom.mmr.solo) ) {
                value = $.Localize('#DU_NotConfigured');
            }
            else if( custom.mmr.solo <= 0 ) {
                value = $.Localize('#DU_TBD');
            }
            else {
                value = number_format(custom.mmr.solo);
            }
        }
        else if( settings.mmr_section == 'party' ) {
            title = $.Localize('#DU_PartyMMR');

            if( custom == null || custom.mmr == null || custom.mmr.party == null || isNaN(custom.mmr.party) ) {
                value = $.Localize('#DU_NotConfigured');
            }
            else if( custom.mmr.party <= 0 ) {
                value = $.Localize('#DU_TBD');
            }
            else {
                value = number_format(custom.mmr.party);
            }
        }

        if( value ) {
            $('#MmrTitle').text = title;
            $('#MmrValue').text = value;
            $('#MmrPanel').visible = true;
        }
    },

    /**
     * 
     */
    onProfileLoaded: function(response)
    {
        var self = Profile;

        //
        $('#PreviewSpinner').visible = false;
        $('#ServerHint').visible = false;

        // Set the information
        self.data.player = response;

        // Pre-season MMR
        if( response.solo_competitive_rank ) {
            $('#OldMmrValue').text = number_format(response.solo_competitive_rank);
            $('#OldMmrPanel').visible = true;
        }

        // Is Professional?
        if( response.profile.is_pro ) {
            $.DispatchEvent('AddStyle', $('#Header'), 'ProBackground');
            $('#ProNameValue').text = response.profile.team_tag + '.' + response.profile.name;
            $('#ProPanel').visible = true;
        }

        //
        if( self.data.hero_showcase == null ) {
            $('#NoShowcasePanel').visible = true;
        }

        // Try to setup the MMR
        self.setupMMR();

        // 
        self.loaded = true;
    },

    /**
     * 
     */
    onCustomDataLoaded: function(response)
    {
        var self = Profile;

        // Set the information
        self.data.custom = response;

        // Try to setup the MMR
        self.setupMMR();
    },

    /**
     * 
     */
    onHeroShowcaseLoaded: function(response)
    {
        var self = Profile;

        // Set the information
        self.data.hero_showcase = response;

        // 
        $('#NoShowcasePanel').visible = false;

        // Options
        var drawbackground = 'false';
        var cssClass = 'WithBackground';

        if ( response.background_id == 'none' ) {
            // Simple hero, on top of a pedestal
            drawbackground = 'true';
            cssClass = 'WithoutBackground';
            $.DispatchEvent('RemoveStyle', $('#HeroAvgStatsPanel'), 'WithBackground');
        }
        else {
            // Hero with an epic background
            $('#BackgroundPanel').BCreateChildren('<DOTAScenePanel id="BackgroundPreview" map="showcase_backgrounds/' + response.background_id + '" camera="default" particleonly="false" light="global_light" live-mode="high_end_only" />');
            $.DispatchEvent('AddStyle', $('#HeroAvgStatsPanel'), 'WithBackground');
        }

        if( response.hero_set_defid && response.hero_set_defid != 0 ) {
            // Full set Hero
            $('#PreviewPanel').BCreateChildren('<DOTAUIEconSetPreview id="HeroPreview" class="' + cssClass + '" allowrotation="true" />');
            $.DispatchEvent('DOTAEconSetPreviewSetItemDef', $( '#HeroPreview' ), response.hero_set_defid, response.hero_id, '', 0, false, (drawbackground == 'true') ? true : false);
        }
        else {
            // Simple Hero
            $('#PreviewPanel').BCreateChildren('<DOTAScenePanel id="HeroPreview" class="' + cssClass + '" unit="' + response.hero_id + '" antialias="false" particleonly="false" drawbackground="' + drawbackground + '" />');
        }

        if ( response.hero_stats ) {
            $('#RatingProgress').value = parseFloat(parseFloat(response.hero_stats.rating).toFixed(2));
            $('#WinRate').text = response.hero_stats.win_rate;
            $('#AvgKills').text = response.hero_stats.avg_kills;
            $('#AvgDeaths').text = response.hero_stats.avg_deaths;
            $('#AvgAssists').text = response.hero_stats.avg_assists;
            $('#AvgGPM').text = response.hero_stats.gpm;
            $('#AvgXPM').text = response.hero_stats.xpm;

            $('#HeroAvgStatsPanel').visible = true;
            $('#HeroStatsPanel').visible = true;
        }
    },

    /**
     * 
     */
    onSettingsLoaded: function(response)
    {
        var self = Profile;

        // Set the information
        self.data.settings = response;

        // Profile Background
        if( response.background_id ) {
            // Wait 0.5s for backgrounds load
            $.Schedule(0.5, function() {
                self.applyBackground(response.background_id);
            });
        }

        // MMR Section
        if( response.mmr_section ) {
            ignoreMmrOption = true;

            if ( response.mmr_section == 'old' ) {
                $('#MmrSectionOption').SetSelected('OldMmrOption');
            }
            else if ( response.mmr_section == 'solo' ) {
                $('#MmrSectionOption').SetSelected('SoloMmrOption');
            }
            else if ( response.mmr_section == 'party' ) {
                $('#MmrSectionOption').SetSelected('PartyMmrOption');
            }
            else if ( response.mmr_section == 'none' ) {
                $('#MmrSectionOption').SetSelected('NoneMmrOption');
            }
        }

        // Try to setup the MMR
        self.setupMMR();
    },

    /**
     * 
     */
    onTopHeroesLoaded: function(response)
    {
        var self = Profile;

        // Set the information
        self.data.top_heroes = response;

        //
        $('#TopHeroesPanel').BCreateChildren('<Panel id="FavoritesHeroesPanel" class="TopHeroesContainer" />');
        $('#TopHeroesPanel').BCreateChildren('<Panel id="WinRateHeroesPanel" class="TopHeroesContainer" />');

        //
        if ( response.favorites ) {
            for( it in response.favorites ) {
                var hero = response.favorites[it];
                hero.hero_data = GetHeroDataById(hero.hero_id);

                var winRate = ((hero.win / hero.games) * 100).toFixed(1);
                var defeats = hero.games - hero.win;

                var template = '<Panel class="HeroContainer" onmouseover="UIShowTextTooltip(\'' + hero.win + $.Localize('#DU_TooltipWinsOf') + hero.games + ' ' + $.Localize('#DU_TooltipMatches') + ' (' + defeats + ' ' + $.Localize('#DU_TooltipDefeats') + ')\')" onmouseout="UIHideTextTooltip()"> \
                    <Label html="true" text="' + winRate + '% (' + hero.games + ') &lt;br&gt; ' + hero.hero_data.localized_name + '" /> \
                    <Panel class="RotatedEffect"> \
                        <Panel class="HeroMovie" style="background-image: url(\'file://{resources}/videos/heroes/' + hero.hero_data.name + '.webm\');" /> \
                    </Panel> \
                </Panel>';

                $('#FavoritesHeroesPanel').BCreateChildren(template);
            }

            for( it in response.wins ) {
                var hero = response.wins[it];
                hero.hero_data = GetHeroDataById(hero.hero_id);

                var winRate = ((hero.win / hero.games) * 100).toFixed(1);
                var defeats = hero.games - hero.win;

                var template = '<Panel class="HeroContainer" onmouseover="UIShowTextTooltip(\'' + hero.win + $.Localize('#DU_TooltipWinsOf') + hero.games + ' ' + $.Localize('#DU_TooltipMatches') + ' (' + defeats + ' ' + $.Localize('#DU_TooltipDefeats') + ')\')" onmouseout="UIHideTextTooltip()"> \
                    <Label html="true" text="&lt;b&gt;' + winRate + '%&lt;/b&gt; &lt;br&gt; ' + hero.hero_data.localized_name + '" /> \
                    <Panel class="RotatedEffect"> \
                        <Panel class="HeroMovie" style="background-image: url(\'file://{resources}/videos/heroes/' + hero.hero_data.name + '.webm\');" /> \
                    </Panel> \
                </Panel>';

                $('#WinRateHeroesPanel').BCreateChildren(template);
            }
        }

        $('#TopHeroesPanel').visible = true;
        SetTopHeroesTab('wins');
    },

    /**
     * 
     */
    onAvailableBackgroundsLoaded: function(response)
    {
        // Remove any panel from the previous backgrounds
        $('#ProfileBackgroundsPanel').BCreateChildren('<Panel id="AvailableBackgroundsPanel" class="AvailableBackgroundsList" />');
        $('#CustomProfileBackgroundsPanel').BCreateChildren('<Panel id="AvailableCustomBackgroundsPanel" class="AvailableBackgroundsList" />');

        // Create each panel with the profile background
        for ( var it in response.common ) {
            var backgroundImage = 'url(\'file://{images}/loadingscreens/' + response.common[it] + '/loadingscreen_tga.vtex\'), url(\'file://{images}/loadingscreens/' + response.common[it] + '/loadingscreen.vtex\'), url(\'file://{resources}/videos/loadingscreens/' + response.common[it] + '/loadingscreen.webm\')';
            $('#AvailableBackgroundsPanel').BCreateChildren('<Panel onactivate="Profile.setBackground(\'' + response.common[it] + '\')" style="background-image: ' + backgroundImage + ';" />');
        }

        // Wait a bit to create custom backgrounds
        $.Schedule(1.0, function() {
            for ( var it in response.custom ) {
                var backgroundImage = 'url(\'file://{images}/loadingscreens/' + response.custom[it] + '/loadingscreen_tga.vtex\'), url(\'file://{images}/loadingscreens/' + response.custom[it] + '/loadingscreen.vtex\'), url(\'file://{resources}/videos/loadingscreens/' + response.custom[it] + '/loadingscreen.webm\')';
                $('#AvailableCustomBackgroundsPanel').BCreateChildren('<Panel onactivate="Profile.setBackground(\'' + response.custom[it] + '\')" style="background-image: ' + backgroundImage + ';" />');
            }
        });
    },

    /**
     * 
     */
    setBackground: function(backgroundid)
    {
        // Save the configuration
        ExecuteWithPermissions(function() {
            SaveSetting(Profile.steamid, 'background_id', backgroundid);
        });

        // Applies the new profile background
        this.applyBackground(backgroundid);
    },

    /**
     * 
     */
    applyBackground: function(backgroundid)
    {
        // Remove the panel with the previous profile background
        $.RemovePanel('ProfileBackground');

        // 
        $.Schedule(0.3, function() {
            if ( backgroundid == 'none' ) {
                $.DispatchEvent('RemoveStyle', $('#ProfileContent'), 'HasBackground');
            }
            else {
                $.DispatchEvent('AddStyle', $('#ProfileContent'), 'HasBackground');
                $('#ProfileBackgroundContainer').BCreateChildren('<Panel id="ProfileBackground" style="background-image: url(\'file://{images}/loadingscreens/' + backgroundid + '/loadingscreen_tga.vtex\'), url(\'file://{images}/loadingscreens/' + backgroundid + '/loadingscreen.vtex\'), url(\'file://{resources}/videos/loadingscreens/' + backgroundid + '/loadingscreen.webm\');" />');
            }
        });
    }
};

function SetTopHeroesTab(type)
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
}

function SetViewPanel(viewPanel)
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
}

var ignoreMmrOption = false;

$.RegisterEventHandler('DropDownSelectionChanged', $('#MmrSectionOption'), function() 
{
    if( ignoreMmrOption ) {
        ignoreMmrOption = false;
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

    ExecuteWithPermissions(function() {
        SaveSetting(Profile.steamid, 'mmr_section', value);
    });
});