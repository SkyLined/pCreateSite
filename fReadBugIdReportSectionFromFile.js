module.exports = fReadBugIdReportSectionFromFile;
var fReadFile = require("./fReadFile");

var // BugId has changed over the years, so there are multiple formats we need to be able to parse:
    rBugIdSynopsis = /(<table>[\s\S]+?<\/table>)/i,
    rBugId = /<tr><td>Id:\s*&nbsp;<\/td><td><span class="Important">(.+?)<\/span><\/td><\/tr>/i,
    rBugLocation = /<tr><td>Location:\s*&nbsp;<\/td><td><span class="Important">(.+?)<\/span><\/td><\/tr>/i
    rBugIdSynopsisStrip = /\s+class="[^"]*"/gi,
    rOldBugIdSynopsis = /<FIELDSET[^>]*><LEGEND[^>]*>Cdb event information<\/LEGEND><SPAN>(<PRE>[\s\S]*?<\/PRE>)/i,
    rOldBugAndLocationId = /id:\s+(.+?)[\r\n]/i;

function fReadBugIdReportSectionFromFile(sSectionFilePath, dxSection, fCallback) {
  return fReadFile(sSectionFilePath, function (oError, sBugIdReportHTML) {
    if (oError) {
      return fCallback(oError);
    };
    var asBugIdSynopsisMatch = sBugIdReportHTML.match(rBugIdSynopsis),
        asOldBugIdSynopsisMatch = asBugIdSynopsisMatch ? null : sBugIdReportHTML.match(rOldBugIdSynopsis);
    if (asBugIdSynopsisMatch) {
      var sBugIdSynopsisHTML = asBugIdSynopsisMatch[1];
      var asBugIdMatch = sBugIdSynopsisHTML.match(rBugId),
          sBugId = asBugIdMatch ? asBugIdMatch[1] : null,
          asBugLocationMatch = sBugIdSynopsisHTML.match(rBugLocation),
          sBugLocation = asBugLocationMatch ? asBugLocationMatch[1] : null;
      if (!sBugId) {
        return fCallback(new Error("BugId report id does not appear to have a known format in " + sSectionFilePath));
      };
      if (!sBugLocation) {
        return fCallback(new Error("BugId report location does not appear to have a known format in " + sSectionFilePath));
      };
      sType = "BugId report";
      sName = sBugId + " @ " + sBugLocation;
      sBugIdSynopsisHTML = sBugIdSynopsisHTML.replace(rBugIdSynopsisStrip, "")
    } else if (asOldBugIdSynopsisMatch) {
      var sBugIdSynopsisHTML = asOldBugIdSynopsisMatch[1],
          asBugLocationAndIdMatch = sBugIdSynopsisHTML.match(rOldBugAndLocationId),
          sBugLocationAndId = asBugLocationAndIdMatch ? asBugLocationAndIdMatch[1] : null;
      if (!sBugLocationAndId) {
        return fCallback(new Error("Old BugId report id does not appear to have a known format in " + sSectionFilePath));
      };
      sType = "old BugId report";
      sName = sBugLocationAndId;
    } else {
      return fCallback(new Error("BugId report synopsis does not appear to have a known format in " + sSectionFilePath));
    };
    return fCallback(null, {
      "sType": sType,
      "sName": sName,
      "sContentHTML": sBugIdSynopsisHTML,
      "sAttachmentFileName": dxSection.sAttachmentFileName || dxSection.sFileName,
      "sAttachmentData": sBugIdReportHTML,
    });
  });
};
