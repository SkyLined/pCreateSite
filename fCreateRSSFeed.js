module.exports = fCreateRSSFeed;
var fsXMLEncodeEntities = require("./fsXMLEncodeEntities"),
    fWriteFile = require("./fWriteFile");

function fCreateRSSFeed(oSite, dsTemplate_by_sName, fCallback) {
  var dsArticleItemXML_by_uSequenceNumber = {},
      auSequenceNumbers = [];
  oSite.aoArticles.forEach(function(oArticle) {
    if (oArticle.uSequenceNumber in dsArticleItemXML_by_uSequenceNumber)
        throw new Error("Two articles with sequence number " + oArticle.uSequenceNumber);
    var sArticleXML = dsTemplate_by_sName["RSS feed article"]
            .replace(/<<Article title>>/g, fsXMLEncodeEntities(oArticle.sTitle))
            .replace(/<<Article description>>/g, fsXMLEncodeEntities(oArticle.sSynopsisHTML))
            .replace(/<<Article absolute URL>>/g, fsXMLEncodeEntities(oArticle.sPageAbsoluteURL))
            .replace(/<<Article date>>/g, fsXMLEncodeEntities(oArticle.oDate.toString()));
    auSequenceNumbers.push(oArticle.uSequenceNumber);
    dsArticleItemXML_by_uSequenceNumber[oArticle.uSequenceNumber] = sArticleXML;
  });
  auSequenceNumbers.sort();
  auSequenceNumbers = auSequenceNumbers.slice(0, 15);
  var asArticleItemXML = auSequenceNumbers.map(function (uSequenceNumber) {
    return dsArticleItemXML_by_uSequenceNumber[uSequenceNumber];
  });
  var sRSSFeedXML = dsTemplate_by_sName["RSS feed"]
          .replace(/<<Site title>>/g, fsXMLEncodeEntities(oSite.sTitle))
          .replace(/<<Site description>>/g, fsXMLEncodeEntities(oSite.sDescription))
          .replace(/<<Site absolute URL>>/g, fsXMLEncodeEntities(oSite.sMainPageAbsoluteURL))
          .replace(/<<Articles>>/g, asArticleItemXML.join("\r\n"));
  if (sRSSFeedXML.indexOf("<<") != -1)
      throw new Error("Some template substitutions failed in the RSS feed: " + JSON.stringify(sRSSFeedXML));
  fWriteFile(oSite.sRSSFeedXMLFilePath, sRSSFeedXML, fCallback);
};