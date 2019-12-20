module.exports = fCreateArticlePage;
var mPath = require("path"),
    fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile"),
    fsCreateTagIconsHTML = require("./fsCreateTagIconsHTML"),
    fsInsertLineAndWordBreaksInHTML = require("./fsInsertLineAndWordBreaksInHTML");

function fCreateArticlePage(oSite, oArticle, dsTemplate_by_sFileName, fCallback) {
  var sJavaScriptsHTML = oSite.asJavaScripts.map(sURL => {
        return "<script src=\"" + fsHTMLEncodeEntities(sURL) + "\"></script>";
      }).join(""),
      asSectionsHTML = oArticle.aoSections.map(function (oSection) {
        var sSectionHTML = dsTemplate_by_sFileName["Article page section " + oSection.sType + ".html"];
        if (!sSectionHTML)
            return fCallback(new Error("No article section template found for section type " + JSON.stringify(oSection.sType)));
        if (oSection.sName) {
          sSectionHTML = sSectionHTML.replace(/<<sSectionName>>/g, fsHTMLEncodeEntities(oSection.sName));
        };
        if (oSection.sContentHTML) {
          sSectionHTML = sSectionHTML.replace(/<<sSectionContentHTML>>/g, oSection.sContentHTML);
        };
        if (oSection.sAttachmentData) {
          var sAttachmentRelativeURL = oArticle.sAttachmentsBaseRelativeURL + encodeURIComponent(oSection.sAttachmentFileName);
          sSectionHTML = sSectionHTML.replace(/<<sAttachmentRelativeURL>>/g, fsHTMLEncodeEntities(sAttachmentRelativeURL));
        };
        return sSectionHTML;
      }),
      sPageContentHTML = dsTemplate_by_sFileName["Article page.html"]
          .replace(/<<sArticleDate>>/g, fsHTMLEncodeEntities(oArticle.sDate))
          .replace(/<<sArticleTitle>>/g, fsHTMLEncodeEntities(oArticle.sTitle))
          .replace(/<<sArticleTagIconsHTML>>/g, fsCreateTagIconsHTML(oArticle.asTags))
          .replace(/<<sArticleSectionsHTML>>/g, asSectionsHTML.join("")),
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
          .replace(/<<sBaseAbsoluteURL>>/g, fsHTMLEncodeEntities(oSite.sBaseAbsoluteURL))
          .replace(/<<sMainPageRelativeURL>>/g, fsHTMLEncodeEntities(oSite.sMainPageRelativeURL))
          .replace(/<<sTwitterAvatarRelativeURL>>/g, fsHTMLEncodeEntities(oSite.sTwitterAvatarRelativeURL))
          .replace(/<<sJavaScriptsHTML>>/g, sJavaScriptsHTML)
          .replace(/<<sPageContentHTML>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in an article page.");
  var sArticleID = oArticle.uSequenceNumber.toString(),
      sPageHTMLFilePath = mPath.join(oSite.sOutputFolderPath, sArticleID + ".html");
  fWriteFile(sPageHTMLFilePath, fsInsertLineAndWordBreaksInHTML(sPageHTML), fCallback);
};