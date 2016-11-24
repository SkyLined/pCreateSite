module.exports = fCreateMainPage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile"),
    fsCreateTagIconsHTML = require("./fsCreateTagIconsHTML"),
    fsInsertLineAndWordBreaksInHTML = require("./fsInsertLineAndWordBreaksInHTML");

function fCreateMainPage(oSite, dsTemplate_by_sFileName, fCallback) {
  var dsArticlesHTML_by_uSequenceNumber = {},
      auSequenceNumbers = [];
  oSite.aoArticles.forEach(function(oArticle) {
    if (oArticle.uSequenceNumber in dsArticlesHTML_by_uSequenceNumber)
        throw new Error("Two articles with sequence number " + oArticle.uSequenceNumber);
    var sArticleHTML = dsTemplate_by_sFileName["Main page article.html"]
        .replace(/<<sArticleTagIconsHTML>>/g, fsCreateTagIconsHTML(oArticle.asTags))
        .replace(/<<sArticleTitle>>/g, fsHTMLEncodeEntities(oArticle.sTitle))
        .replace(/<<sArticleSynopsisHTML>>/g, oArticle.sSynopsisHTML)
        .replace(/<<sArticleDate>>/g, fsHTMLEncodeEntities(oArticle.sDate))
        .replace(/<<sArticleURL>>/g, fsHTMLEncodeEntities(oArticle.sPageRelativeURL));
    auSequenceNumbers.push(oArticle.uSequenceNumber);
    dsArticlesHTML_by_uSequenceNumber[oArticle.uSequenceNumber] = sArticleHTML;
  });
  auSequenceNumbers.sort();
  auSequenceNumbers.reverse();
  var asArticlesHTML = auSequenceNumbers.map(function (uSequenceNumber) {
    return dsArticlesHTML_by_uSequenceNumber[uSequenceNumber];
  });
  var sPageContentHTML = dsTemplate_by_sFileName["Main page.html"]
          .replace(/<<sArticlesHTML>>/g, asArticlesHTML.join("")),
      sBannerImageRelativeURL = oSite.asBannerImageRelativeURLs[Math.floor(Math.random() * oSite.asBannerImageRelativeURLs.length)],
      sPageHTML = dsTemplate_by_sFileName["Page.html"]
          .replace(/<<sSiteCopyrightYear>>/g, fsHTMLEncodeEntities(oSite.sSiteCopyrightYear))
          .replace(/<<sSitelastUpdatedDate>>/g, fsHTMLEncodeEntities(oSite.sSitelastUpdatedDate))
          .replace(/<<sSiteName>>/g, fsHTMLEncodeEntities(oSite.sName))
          .replace(/<<sPageTitle>>/g, fsHTMLEncodeEntities(oSite.sName))
          .replace(/<<sAuthorName>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sName))
          .replace(/<<sAuthorTwitterHandle>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sTwitterHandle))
          .replace(/<<sAuthorGitHubHandle>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sGitHubHandle))
          .replace(/<<sAuthorEmailAddress>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sEmailAddress))
          .replace(/<<sAuthorBitcoin>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sBitcoin))
          .replace(/<<sLicenseDescription>>/g, fsHTMLEncodeEntities(oSite.oLicense.sDescription))
          .replace(/<<sLicenseImageRelativeURL>>/g, fsHTMLEncodeEntities(oSite.oLicense.sImageRelativeURL))
          .replace(/<<sLicenseDetailsAbsoluteURL>>/g, fsHTMLEncodeEntities(oSite.oLicense.sDetailsAbsoluteURL))
          .replace(/<<sSummary>>/g, fsHTMLEncodeEntities(oSite.sSummary))
          .replace(/<<sSiteAbsoluteURL>>/g, fsHTMLEncodeEntities(oSite.sAbsoluteURL))
          .replace(/<<sBannerImageRelativeURL>>/g, fsHTMLEncodeEntities(sBannerImageRelativeURL))
          .replace(/<<sPageAvatarRelativeURL>>/g, fsHTMLEncodeEntities(oSite.sSiteAvatarRelativeURL))
          .replace(/<<sPageContentHTML>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in the main page.");
  fWriteFile(oSite.sMainPageHTMLFilePath, fsInsertLineAndWordBreaksInHTML(sPageHTML), fCallback);
};