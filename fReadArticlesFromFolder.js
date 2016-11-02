module.exports = fReadArticlesFromFolder;
var mPath = require("path"),
    fReadFolder = require("./fReadFolder"),
    fReadArticleFromFolder = require("./fReadArticleFromFolder");

function fReadArticlesFromFolder(sArticlesFolderPath, fCallback) {
  fReadFolder(sArticlesFolderPath, function (oError, asArticleFolderNames) {
    if (oError) return fCallback(oError);
    if (asArticleFolderNames.length == 0)
        fCallback(new Error("No articles folders found in " + JSON.stringify(sArticlesFolderPath)));
    var bErrorReported = false,
        aoArticles = [];
    asArticleFolderNames.forEach(function (sArticleFolderName) {
      if (bErrorReported) return; // Do not process any more files after an error has been detected.
      fReadArticleFromFolder(sArticlesFolderPath, sArticleFolderName, function (oError, oArticle) {
        if (bErrorReported) return;
        if (oError) {
          bErrorReported = true;
          return fCallback(oError);
        };
        aoArticles.push(oArticle);
        // Record that one sub-folder was processed and call callback when all sub-folders have been processed.
        // Note: an error will result in an immediate callback and not in a call to this function, so the counter will
        // never reach the point where the callback is called again from this function.
        if (aoArticles.length == asArticleFolderNames.length) {
          fCallback(oError, aoArticles);
        };
      });
    });
  });
};
