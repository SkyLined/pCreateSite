module.exports = fReadImageSectionFromFile;
var fReadBinaryFile = require("./fReadBinaryFile");

function fReadImageSectionFromFile(sSectionFilePath, dxSection, fCallback) {
  fReadBinaryFile(sSectionFilePath, function (oError, sImageFileData) {
    if (oError) return fCallback(oError);
    var oSection = {
      "sType": "image",
      "sAttachmentFileName": dxSection.sAttachmentFileName || dxSection.sFileName,
      "sAttachmentData": sImageFileData,
    };
    fCallback(null, oSection);
  });
};
