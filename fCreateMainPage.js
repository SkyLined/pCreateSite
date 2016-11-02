module.exports = fCreateMainPage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile");

function fsCreateIconImages(asIcons) {
   return asIcons.map(function (sIcon) {
      return "<img class=\"icon\" src=\"/Images/" + fsHTMLEncodeEntities(sIcon) + "\"/>";
  }).join("");
}

function fCreateMainPage(oSite, dsTemplate_by_sName, fCallback) {
  var dsArticlesHTML_by_uSequenceNumber = {},
      auSequenceNumbers = [];
  oSite.aoArticles.forEach(function(oArticle) {
    if (oArticle.uSequenceNumber in dsArticlesHTML_by_uSequenceNumber)
        throw new Error("Two articles with sequence number " + oArticle.uSequenceNumber);
    var sArticleHTML = dsTemplate_by_sName["Main page article"]
        .replace(/<<Article icons>>/g, fsCreateIconImages(oArticle.asIcons))
        .replace(/<<Article title>>/g, fsHTMLEncodeEntities(oArticle.sTitle))
        .replace(/<<Article synopsis>>/g, oArticle.sSynopsisHTML)
        .replace(/<<Article date>>/g, fsHTMLEncodeEntities(oArticle.sDate))
        .replace(/<<Article URL>>/g, fsHTMLEncodeEntities(oArticle.sPageRelativeURL));
    auSequenceNumbers.push(oArticle.uSequenceNumber);
    dsArticlesHTML_by_uSequenceNumber[oArticle.uSequenceNumber] = sArticleHTML;
  });
  auSequenceNumbers.sort();
  auSequenceNumbers.reverse();
  var asArticlesHTML = auSequenceNumbers.map(function (uSequenceNumber) {
    return dsArticlesHTML_by_uSequenceNumber[uSequenceNumber];
  });
  var sPageContentHTML = dsTemplate_by_sName["Main page content"]
          .replace(/<<Index articles>>/g, asArticlesHTML.join("")),
      sPageHTML = dsTemplate_by_sName["Page"]
          .replace(/<<Title>>/g, oSite.sTitle)
          .replace(/<<Page content>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in the main page.");
  fWriteFile(oSite.sMainPageHTMLFilePath, sPageHTML, fCallback);
};