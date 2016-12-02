module.exports = fReadTextSectionFromFile;
var fReadFileAsHTML = require("./fReadFileAsHTML");

function fReadTextSectionFromFile(sSectionFilePath, dxSection, fCallback) {
  fReadFileAsHTML(sSectionFilePath, function (oError, sContentHTML) {
    if (oError) return fCallback(oError);
    var oSection = {
      "sType": "text",
      "sContentHTML": sContentHTML
    };
    fCallback(null, oSection);
  });
};
