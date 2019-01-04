module.exports = fCreateArticles;
var mPath = require("path"),
    fCreateArticlePage = require("./fCreateArticlePage"),
    fCreateArticleAttachments = require("./fCreateArticleAttachments");

function fCreateArticles(oSite, aoArticles, dsTemplate_by_sFileName, fCallback) {
  if (aoArticles.length == 0) return fCallback();
  var bErrorReported = false,
      uArticlesCreated = 0;
  console.log("Creating " + aoArticles.length + " articles for sub-domain " + oSite.sSubdomain + "...");
  aoArticles.forEach(function (oArticle) {
    if (bErrorReported) return;
    fCreateArticlePage(oSite, oArticle, dsTemplate_by_sFileName, function (oError) {
      if (bErrorReported) return;
      if (oError) {
        bErrorReported = true;
        return fCallback(oError);
      };
      fCreateArticleAttachments(oSite, oArticle, function (oError) {
        if (bErrorReported) return;
        if (oError) {
          bErrorReported = true;
          return fCallback(oError);
        };
        if (++uArticlesCreated == aoArticles.length) {
          return fCallback();
        };
      });
    });
  });
};

