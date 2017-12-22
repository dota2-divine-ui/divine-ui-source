/**
 * Panel Loaded
 */
function OnLoad()
{
    // We can not edit the profile
    if( !CanEditProfile() ) {
        $.DispatchEvent('AddStyle', $('#SoloMMRValue'), 'UploadFailed');
        return;
    }

    // Obtain the necessary information
    var steamid = $('#ProfileName').steamid;
    var soloMmr = $('#SoloMMRValue').text.replace(',', '');
    var partyMmr = $('#PartyMMRValue').text.replace(',', '');

    // TBD
    if( isNaN(soloMmr) ) {
        soloMmr = 0;
    }

    // TBD
    if( isNaN(partyMmr) ) {
        partyMmr = 0;
    }

    SaveMMR(steamid, soloMmr, partyMmr);
}