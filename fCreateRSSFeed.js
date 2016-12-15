module.exports = fCreateRSSFeed;
var fsHTMLToText = require("./fsHTMLToText"),
    fsXMLEncodeEntities = require("./fsXMLEncodeEntities"),
    fWriteFile = require("./fWriteFile");

function fCreateRSSFeed(oSite, dsTemplate_by_sFileName, fCallback) {
  var dsArticleItemXML_by_uSequenceNumber = {},
      auSequenceNumbers = [];
  oSite.aoArticles.forEach(function(oArticle) {
    if (oArticle.uSequenceNumber in dsArticleItemXML_by_uSequenceNumber)
        throw new Error("Two articles with sequence number " + oArticle.uSequenceNumber);
    var sArticleXML = dsTemplate_by_sFileName["RSS feed article.xml"]
            .replace(/<<sArticleTitle>>/g, fsXMLEncodeEntities(oArticle.sTitle))
            .replace(/<<sArticleDescription>>/g, fsXMLEncodeEntities(oArticle.sSynopsisHTML))
            .replace(/<<sArticleDescriptionText>>/g, fsXMLEncodeEntities(fsHTMLToText(oArticle.sSynopsisHTML)))
            .replace(/<<sBaseAbsoluteURL>>/g, fsXMLEncodeEntities(oSite.sBaseAbsoluteURL))
            .replace(/<<sArticleRelativeURL>>/g, fsXMLEncodeEntities(oArticle.sRelativeURL))
            .replace(/<<sArticleDate>>/g, fsXMLEncodeEntities(oArticle.oDate.toString()));
    auSequenceNumbers.push(oArticle.uSequenceNumber);
    dsArticleItemXML_by_uSequenceNumber[oArticle.uSequenceNumber] = sArticleXML;
  });
  auSequenceNumbers.sort();
  auSequenceNumbers = auSequenceNumbers.slice(0, 15);
  var asArticleItemXML = auSequenceNumbers.map(function (uSequenceNumber) {
    return dsArticleItemXML_by_uSequenceNumber[uSequenceNumber];
  });
  var sRSSFeedXML = dsTemplate_by_sFileName["RSS feed.xml"]
          .replace(/<<sSiteTitle>>/g, fsXMLEncodeEntities(oSite.sName))
          .replace(/<<sSiteSummary>>/g, fsXMLEncodeEntities(oSite.sSummary))
          .replace(/<<sMainPageRelativeURL>>/g, fsXMLEncodeEntities(oSite.sMainPageRelativeURL))
          .replace(/<<sBaseAbsoluteURL>>/g, fsXMLEncodeEntities(oSite.sBaseAbsoluteURL))
          .replace(/<<sArticlesXML>>/g, asArticleItemXML.join("\r\n"));
  if (sRSSFeedXML.indexOf("<<") != -1)
      throw new Error("Some template substitutions failed in the RSS feed: " + JSON.stringify(sRSSFeedXML));
  fWriteFile(oSite.sRSSFeedXMLFilePath, sRSSFeedXML, fCallback);
};