module.exports = fCreateArticles;
var mPath = require("path"),
    fCreateArticlePage = require("./fCreateArticlePage"),
    fCreateArticleAttachments = require("./fCreateArticleAttachments");

function fCreateArticles(oSite, dsTemplate_by_sName, fCallback) {
  if (oSite.aoArticles.length == 0) return fCallback();
  var bErrorReported = false,
      uArticlesCreated = 0;
  oSite.aoArticles.forEach(function (oArticle) {
    if (bErrorReported) return;
    fCreateArticlePage(oArticle, dsTemplate_by_sName, function (oError) {
      if (bErrorReported) return;
      if (oError) {
        bErrorReported = true;
        return fCallback(oError);
      };
      fCreateArticleAttachments(oArticle, function (oError) {
        if (bErrorReported) return;
        if (oError) {
          bErrorReported = true;
          return fCallback(oError);
        };
        if (++uArticlesCreated == oSite.aoArticles.length) {
          return fCallback();
        };
      });
    });
  });
};

