module.exports = fReadTemplatesFromFolder;
var mPath = require("path"),
    fReadFolder = require("./fReadFolder"),
    fReadFile = require("./fReadFile");

var dsTemplateFileName_by_sName = {
      "Page": "Page.html",
      "Main page content": "Main page content.html",
      "Main page article": "Main page article.html",
      "Article page content": "Article page content.html",
      "Article BugId report section": "Article BugId report section.html",
      "Article source code section": "Article source code section.html",
      "Article text section": "Article text section.html",
      "RSS feed": "RSS feed.xml",
      "RSS feed article": "RSS feed article.xml",
    };

function fReadTemplatesFromFolder(sTemplatesFolderPath, fCallback) {
  var bErrorReported = false,
      uFilesRead = 0,
      dsTemplate_by_sName = {};
  function fReadTemplate(sTemplateName) {
    var sTemplateFileName = dsTemplateFileName_by_sName[sTemplateName],
        sTemplateFilePath = mPath.join(sTemplatesFolderPath, sTemplateFileName);
    fReadFile(sTemplateFilePath, function (oError, sTemplate) {
      if (bErrorReported) return;
      if (oError) {
        bErrorReported = true;
        return fCallback(oError);
      };
      dsTemplate_by_sName[sTemplateName] = sTemplate;
      // Record that one sub-folder was processed and call callback when all sub-folders have been processed.
      // Note: an error will result in an immediate callback and not in a call to this function, so the counter will
      // never reach the point where the callback is called again from this function.
      if (++uFilesRead == Object.keys(dsTemplateFileName_by_sName).length) {
        fCallback(oError, dsTemplate_by_sName);
      };
    });
  };
  for (var sTemplateName in dsTemplateFileName_by_sName) {
    if (bErrorReported) return; // Do not process any more files after an error has been detected.
    fReadTemplate(sTemplateName);
  };
};
