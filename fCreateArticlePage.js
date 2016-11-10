module.exports = fCreateArticlePage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile"),
    fsCreateTagIconsHTML = require("./fsCreateTagIconsHTML"),

function fCreateArticlePage(oArticle, dsTemplate_by_sFileName, fCallback) {
  var asSectionsHTML = oArticle.aoSections.map(function (oSection) {
        var sSectionHTML = dsTemplate_by_sFileName["Article section " + oSection.sType + ".html"];
        if (!sSectionHTML)
            return fCallback(new Error("No article section template found for section type " + JSON.stringify(oSection.sType)));
        if (oSection.sName) {
          sSectionHTML = sSectionHTML.replace(/<<sSectionName>>/g, fsHTMLEncodeEntities(oSection.sName));
        };
        if (oSection.sContentHTML) {
          sSectionHTML = sSectionHTML.replace(/<<sSectionContentHTML>>/g, oSection.sContentHTML);
        };
        if (oSection.sAttachmentData) {
          var sAttachmentRelativeURL = oArticle.sAttachmentsRelativeBaseURL + encodeURIComponent(oSection.sAttachmentFileName);
          sSectionHTML = sSectionHTML.replace(/<<sAttachmentURL>>/g, fsHTMLEncodeEntities(sAttachmentRelativeURL));
        };
        return sSectionHTML;
      });
      sPageContentHTML = dsTemplate_by_sFileName["Article.html"]
          .replace(/<<sArticleTagIconsHTML>>/g, fsCreateTagIconsHTML(oArticle.asTags))
          .replace(/<<sArticleSectionsHTML>>/g, asSectionsHTML.join("")),
      sPageHTML = dsTemplate_by_sFileName["Page.html"]
          .replace(/<<sTitle>>/g, fsHTMLEncodeEntities(oArticle.sTitle))
          .replace(/<<sSummary>>/g, fsHTMLEncodeEntities(oArticle.sSummary))
          .replace(/<<sAbsoluteSiteURL>>/g, fsHTMLEncodeEntities(oArticle.oSite.sAbsoluteURL))
          .replace(/<<sPageContentHTML>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in an article page.");
  fWriteFile(oArticle.sPageHTMLFilePath, sPageHTML, fCallback);
};