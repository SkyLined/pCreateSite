module.exports = fReadTemplatesFromFolder;
var mPath = require("path"),
    fReadFolder = require("./fReadFolder"),
    fReadFile = require("./fReadFile");

function fReadTemplatesFromFolder(sTemplatesFolderPath, fCallback) {
  return fReadFolder(sTemplatesFolderPath, function (oError, asFileAndFolderNames) {
    if (oError) {
      return fCallback(oError);
    };
    var bErrorReported = false,
        uFilesRead = 0,
        dsTemplate_by_sFileName = {};
    if (asFileAndFolderNames.length == 0) {
      return fCallback(null, dsTemplate_by_sFileName);
    };
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
