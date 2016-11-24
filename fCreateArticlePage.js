module.exports = fCreateArticlePage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile"),
    fsCreateTagIconsHTML = require("./fsCreateTagIconsHTML"),
    fsInsertLineAndWordBreaksInHTML = require("./fsInsertLineAndWordBreaksInHTML");

function fCreateArticlePage(oArticle, dsTemplate_by_sFileName, fCallback) {
  var oSite = oArticle.oSite,
      asSectionsHTML = oArticle.aoSections.map(function (oSection) {
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
      sBannerImageRelativeURL = oSite.asBannerImageRelativeURLs[Math.floor(Math.random() * oSite.asBannerImageRelativeURLs.length)],
      sPageHTML = dsTemplate_by_sFileName["Page.html"]
          .replace(/<<sSiteCopyrightYear>>/g, fsHTMLEncodeEntities(oSite.sSiteCopyrightYear))
          .replace(/<<sSitelastUpdatedDate>>/g, fsHTMLEncodeEntities(oSite.sSitelastUpdatedDate))
          .replace(/<<sSiteName>>/g, fsHTMLEncodeEntities(oSite.sName))
          .replace(/<<sPageTitle>>/g, fsHTMLEncodeEntities(oArticle.sTitle))
          .replace(/<<sAuthorName>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sName))
          .replace(/<<sAuthorTwitterHandle>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sTwitterHandle))
          .replace(/<<sAuthorGitHubHandle>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sGitHubHandle))
          .replace(/<<sAuthorEmailAddress>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sEmailAddress))
          .replace(/<<sAuthorBitcoin>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sBitcoin))
          .replace(/<<sLicenseDescription>>/g, fsHTMLEncodeEntities(oSite.oLicense.sDescription))
          .replace(/<<sLicenseImageRelativeURL>>/g, fsHTMLEncodeEntities(oSite.oLicense.sImageRelativeURL))
          .replace(/<<sLicenseDetailsAbsoluteURL>>/g, fsHTMLEncodeEntities(oSite.oLicense.sDetailsAbsoluteURL))
          .replace(/<<sSummary>>/g, fsHTMLEncodeEntities(oArticle.sSummary))
          .replace(/<<sSiteAbsoluteURL>>/g, fsHTMLEncodeEntities(oArticle.oSite.sAbsoluteURL))
          .replace(/<<sBannerImageRelativeURL>>/g, fsHTMLEncodeEntities(sBannerImageRelativeURL))
          .replace(/<<sPageAvatarRelativeURL>>/g, fsHTMLEncodeEntities(oSite.sSiteAvatarRelativeURL))
          .replace(/<<sPageContentHTML>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in an article page.");
  fWriteFile(oArticle.sPageHTMLFilePath, fsInsertLineAndWordBreaksInHTML(sPageHTML), fCallback);
};