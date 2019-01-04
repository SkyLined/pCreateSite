module.exports = fCreateArticleAttachments;
var mPath = require("path"),
    fCreateFolderIfNotExists = require("./fCreateFolderIfNotExists"),
    fWriteFile = require("./fWriteFile");

function fCreateArticleAttachments(oSite, oArticle, fCallback) {
  // Save all attachments that can be downloaded to files.
  var aoAttachmentSections = oArticle.aoSections.filter(function (oSection) {
    // Select attachments; these have data.
    return oSection.sAttachmentData;
  });
  if (aoAttachmentSections.length == 0) return fCallback();
  var sArticleID = oArticle.uSequenceNumber.toString(),
      sAttachmentsFolderPath = mPath.join(oSite.sOutputFolderPath, sArticleID);
  fCreateFolderIfNotExists(sAttachmentsFolderPath, function (oError) {
    if (oError) return fCallback(oError);
    var bErrorReported = false,
        uAttachmentsProcessed = 0;
    aoAttachmentSections.forEach(function (oSection) {
      var sAttachmentFilePath = mPath.join(sAttachmentsFolderPath, oSection.sAttachmentFileName);
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