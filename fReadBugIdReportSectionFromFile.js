module.exports = fReadBugIdReportSectionFromFile;
var fReadFile = require("./fReadFile"),
    fsHTMLDecodeEntities = require("./fsHTMLDecodeEntities.js");

var // BugId has changed over the years, so there are multiple formats we need to be able to parse:
    rBugIdSynopsis = /(<table>[\s\S]+?<\/table>)/i,
    rBugId = /<tr><td>(?:Bug)?Id:\s*(?:&nbsp;)?<\/td><td>(?:<span class="Important">)?(?:<b>)?(.+?)(?:<\/b>)?(?:<\/span>)?<\/td><\/tr>/i,
    rBugLocation = /<tr><td>Location:\s*(?:&nbsp;)?<\/td><td>(?:<span class="Important">)?(.+?)(?:<\/span>)?<\/td><\/tr>/i
    rBugIdSynopsisStrip = /\s+class="[^"]*"/gi,
    rOldBugIdSynopsis1 = /<FIELDSET[^>]*><LEGEND[^>]*>Cdb event information<\/LEGEND><SPAN>(<PRE>[\s\S]*?<\/PRE>)/i,
    rOldBugAndLocationId1 = /id:\s+(.+?)[\r\n]/i,
    rOldBugIdSynopsis2 = /<h1 class="Header">Details<\/h1>[ \r\n]+<div class="Content">([\s\S]*?)<\/div>/i,
    rOldBugAndLocationId2 = /id:\s+(.+?)[\r\n]/i,
    rOldBugIdSynopsisStrip2 = /<[^>]+>/gi;

function fReadBugIdReportSectionFromFile(sSectionFilePath, dxSection, fCallback) {
  return fReadFile(sSectionFilePath, function (oError, sBugIdReportHTML) {
    if (oError) {
      return fCallback(oError);
    };
    var asBugIdSynopsisMatch = sBugIdReportHTML.match(rBugIdSynopsis),
        asOldBugIdSynopsisMatch1 = asBugIdSynopsisMatch ? null : sBugIdReportHTML.match(rOldBugIdSynopsis1),
        asOldBugIdSynopsisMatch2 = asBugIdSynopsisMatch || asOldBugIdSynopsisMatch1 ? null : sBugIdReportHTML.match(rOldBugIdSynopsis2);
    if (asBugIdSynopsisMatch) {
      var sBugIdSynopsisHTML = asBugIdSynopsisMatch[1];
      var asBugIdMatch = sBugIdSynopsisHTML.match(rBugId),
          sBugId = asBugIdMatch ? fsHTMLDecodeEntities(asBugIdMatch[1]) : null,
          asBugLocationMatch = sBugIdSynopsisHTML.match(rBugLocation),
          sBugLocation = asBugLocationMatch ? fsHTMLDecodeEntities(asBugLocationMatch[1]) : null;
      if (!sBugId) {
        return fCallback(new Error("BugId report id does not appear to have a known format in " + sSectionFilePath));
      };
      if (!sBugLocation) {
        return fCallback(new Error("BugId report location does not appear to have a known format in " + sSectionFilePath));
      };
      sType = "BugId report";
      if (sBugId.match(/\.(exe|dll)!/)) {
        // Originally BugId's had the topmost relevant function name in the ID, which means it can be used as the name
        sName = sBugId;
      } else {
        // Newer BugId's only have the hash, so we add the location for readability:
        sName = sBugId + " @ " + sBugLocation;
      };
      sBugIdSynopsisHTML = sBugIdSynopsisHTML.replace(rBugIdSynopsisStrip, "")
    } else if (asOldBugIdSynopsisMatch1) {
      var sBugIdSynopsisHTML = asOldBugIdSynopsisMatch1[1],
          asBugLocationAndIdMatch = sBugIdSynopsisHTML.match(rOldBugAndLocationId1),
          sBugLocationAndId = asBugLocationAndIdMatch ? fsHTMLDecodeEntities(asBugLocationAndIdMatch[1]) : null;
      if (!sBugLocationAndId) {
        return fCallback(new Error("BugId report id does not appear to have a known format in " + sSectionFilePath));
      };
      sType = "old BugId report";
      sName = sBugLocationAndId;
    } else if (asOldBugIdSynopsisMatch2) {
      var sBugIdSynopsisHTML = fsHTMLDecodeEntities(asOldBugIdSynopsisMatch2[1].replace(rOldBugIdSynopsisStrip2, "")),
          asBugLocationAndIdMatch = sBugIdSynopsisHTML.match(rOldBugAndLocationId2),
          sBugLocationAndId = asBugLocationAndIdMatch ? fsHTMLDecodeEntities(asBugLocationAndIdMatch[1]) : null;
      if (!sBugLocationAndId) {
        return fCallback(new Error("BugId report id does not appear to have a known format in " + sSectionFilePath));
      };
      sType = "old BugId report";
      sName = sBugLocationAndId;
    } else {
      return fCallback(new Error("BugId report synopsis does not appear to have a known format in " + sSectionFilePath));
    };
    return fCallback(null, {
      "sType": sType,
      "sName": "BugId report: " + sName,
      "sContentHTML": sBugIdSynopsisHTML,
      "sAttachmentFileName": dxSection.sAttachmentFileName || dxSection.sFileName,
      "sAttachmentData": sBugIdReportHTML,
    });
  });
};
