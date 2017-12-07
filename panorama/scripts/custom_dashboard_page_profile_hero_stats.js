/**
 * 
 */
function OnLoad()
{
    var steamID64 = $('#ProfileName').steamid;
    var soloMmr = $('#SoloMMRValue').text.replace(',', '');
    var partyMmr = $('#PartyMMRValue').text.replace(',', '');

    if ( isNaN(soloMmr) ) {
        soloMmr = 0;
    }

    if ( isNaN(partyMmr) ) {
        partyMmr = 0;
    }

    UploadMMR(steamID64, soloMmr, partyMmr);
}