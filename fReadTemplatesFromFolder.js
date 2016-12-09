module.exports = fReadTemplatesFromFolder;
var mPath = require("path"),
    fReadFolder = require("./fReadFolder"),
    fReadFile = require("./fReadFile");

var dsTemplateFileName_by_sName = {
      "Page": "Page.html",
      "Main page content": "Main page content.html",
      "Main page articles group": "Main page articles group.html",
      "Main page article": "Main page article.html",
      "Article page content": "Article page content.html",
      "Article BugId report section": "Article BugId report section.html",
      "Article source code section": "Article source code section.html",
      "Article text section": "Article text section.html",
      "RSS feed": "RSS feed.xml",
      "RSS feed article": "RSS feed article.xml",
    };

function fReadTemplatesFromFolder(sTemplatesFolderPath, fCallback) {
  return fReadFolder(sTemplatesFolderPath, function (oError, asFileAndFolderNames) {
    if (oError) {
      return fCallback(oError);
    };
    if (asFileAndFolderNames.length == 0) {
      return fCallback(null, dsTemplate_by_sFileName);
    };
    var bErrorReported = false,
        uFilesRead = 0,
        dsTemplate_by_sFileName = {};
    // Assume only files exist in this folder:
    asFileAndFolderNames.forEach(function fReadTemplate(sTemplateFileName) {
      if (bErrorReported) return;
      var sTemplateFilePath = mPath.join(sTemplatesFolderPath, sTemplateFileName);
      fReadFile(sTemplateFilePath, function (oError, sTemplate) {
        if (bErrorReported) return;
        if (oError) {
          bErrorReported = true;
          return fCallback(oError);
        };
        dsTemplate_by_sFileName[sTemplateFileName] = sTemplate;
        if (++uFilesRead == asFileAndFolderNames.length) {
          fCallback(oError, dsTemplate_by_sFileName);
        };
      });
    });
  });
};
