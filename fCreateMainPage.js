module.exports = fCreateMainPage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile"),
    fsCreateIconImagesHTML = require("./fsCreateIconImagesHTML");

function fCreateMainPage(oSite, dsTemplate_by_sFileName, fCallback) {
  var dsArticlesHTML_by_uSequenceNumber = {},
      auSequenceNumbers = [];
  oSite.aoArticles.forEach(function(oArticle) {
    if (oArticle.uSequenceNumber in dsArticlesHTML_by_uSequenceNumber)
        throw new Error("Two articles with sequence number " + oArticle.uSequenceNumber);
    var sArticleHTML = dsTemplate_by_sFileName["Main page article.html"]
        .replace(/<<sArticleIconsHTML>>/g, fsCreateIconImagesHTML(oArticle.asIcons))
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
      sPageHTML = dsTemplate_by_sFileName["Page.html"]
          .replace(/<<sTitle>>/g, fsHTMLEncodeEntities(oSite.sTitle))
          .replace(/<<sSummary>>/g, fsHTMLEncodeEntities(oSite.sSummary))
          .replace(/<<sAbsoluteSiteURL>>/g, fsHTMLEncodeEntities(oSite.sAbsoluteURL))
          .replace(/<<sPageContentHTML>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in the main page.");
  fWriteFile(oSite.sMainPageHTMLFilePath, sPageHTML, fCallback);
};