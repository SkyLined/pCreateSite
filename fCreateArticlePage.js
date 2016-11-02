module.exports = fCreateArticlePage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile");

function fCreateArticlePage(oArticle, dsTemplate_by_sName, fCallback) {
  var dsSectionTemplate_by_sTypeName = {
        "Text": dsTemplate_by_sName["Article text section"],
        "Source code": dsTemplate_by_sName["Article source code section"],
        "BugId report": dsTemplate_by_sName["Article BugId report section"],
      },
      asSectionsHTML = oArticle.aoSections.map(function (oSection) {
        var sSectionHTML = dsSectionTemplate_by_sTypeName[oSection.sType];
        if (!sSectionHTML)
            return fCallback(new Error("No article section template found for section type " + JSON.stringify(oSection.sType)));
        if (oSection.sName) {
          sSectionHTML = sSectionHTML.replace(/<<Section name>>/g, fsHTMLEncodeEntities(oSection.sName));
        };
        if (oSection.sContentHTML) {
          sSectionHTML = sSectionHTML.replace(/<<Section content>>/g, oSection.sContentHTML);
        };
        if (oSection.sAttachmentData) {
          var sAttachmentRelativeURL = oArticle.sAttachmentsRelativeBaseURL + encodeURIComponent(oSection.sAttachmentFileName);
          sSectionHTML = sSectionHTML.replace(/<<Attachment URL>>/g, sAttachmentRelativeURL);
        };
        return sSectionHTML;
      });
      sPageContentHTML = dsTemplate_by_sName["Article page content"]
          .replace(/<<Article sections>>/g, asSectionsHTML.join("")),
      sPageHTML = dsTemplate_by_sName["Page"]
          .replace(/<<Title>>/g, oArticle.oSite.sTitle + " - " + oArticle.sTitle)
          .replace(/<<Page content>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in an article page.");
  fWriteFile(oArticle.sPageHTMLFilePath, sPageHTML, fCallback);
};