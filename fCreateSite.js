module.exports = fCreateSite;
var mPath = require("path"),
    fReadArticlesFromFolder = require("./fReadArticlesFromFolder"),
    fCreateArticles = require("./fCreateArticles"),
    fCreateMainPage = require("./fCreateMainPage"),
    fCreateRSSFeed = require("./fCreateRSSFeed");

function fCreateSite(oSite, dsTemplate_by_sName, fCallback) {
  fCreateArticles(oSite, dsTemplate_by_sName, function (oError) {
    if (oError) fCallback(oError);
    fCreateMainPage(oSite, dsTemplate_by_sName, function (oError) {
      if (oError) fCallback(oError);
      fCreateRSSFeed(oSite, dsTemplate_by_sName, fCallback);
    });
  });
};