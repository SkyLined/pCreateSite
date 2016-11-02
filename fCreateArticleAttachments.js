module.exports = fCreateArticleAttachments;
var mPath = require("path"),
    fCreateFolderIfNotExists = require("./fCreateFolderIfNotExists"),
    fWriteFile = require("./fWriteFile");

function fCreateArticleAttachments(oArticle, fCallback) {
  var aoAttachmentSections = oArticle.aoSections.filter(function (oSection) { return oSection.sAttachmentData; });
  if (aoAttachmentSections.length == 0) return fCallback();
  fCreateFolderIfNotExists(oArticle.sAttachmentsFolderPath, function (oError) {
    if (oError) return fCallback(oError);
    var bErrorReported = false,
        uAttachmentsProcessed = 0;
    aoAttachmentSections.forEach(function (oSection) {
      var sAttachmentFilePath = mPath.join(oArticle.sAttachmentsFolderPath, oSection.sAttachmentFileName);
      // TODO: Check if two attachments share the same file name.
      fWriteFile(sAttachmentFilePath, oSection.sAttachmentData, function (oError) {
        if (bErrorReported) return;
        if (oError) {
          bErrorReported = true;
          return fCallback(oError);
        };
        if (++uAttachmentsProcessed == aoAttachmentSections.length) {
          fCallback();
        };
      });
    });
  });
};