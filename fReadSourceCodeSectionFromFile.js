module.exports = fReadSourceCodeSectionFromFile;
var mPath = require("path"),
    fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fReadFile = require("./fReadFile"),
    mHighlight = require("highlight.js");

var dsLanguage_by_sSourceFileExtention = {
      ".asm":     "x86asm",
      ".asp":     "VBScript-HTML",
      ".cmd":     null,
      ".cpp":     "CPP",
      ".html":    "HTML",
      ".http":    "HTTP",
      ".js":      "Javascript",
      ".py":      "Python",
      ".svg":     "HTML",
      ".txt":     null,
      ".vbs":     "VBScript",
      ".xhtml":   "HTML",
      ".xml":     "XML",
    };

function fReadSourceCodeSectionFromFile(sSectionFilePath, dxSection, fCallback) {
  var sSectionFileExtention = mPath.extname(dxSection.sFileName);
  if (!(sSectionFileExtention in dsLanguage_by_sSourceFileExtention)) {
    return fCallback(new Error("dxSection.sFileName has an unknown extention (" + sSectionFileExtention + ") in " + sSectionFilePath));
  };
  fReadFile(sSectionFilePath, function (oError, sSourceCode) {
    if (oError) return fCallback(oError);
    var sLanguage = dsLanguage_by_sSourceFileExtention[sSectionFileExtention];
    if (sLanguage) {
      try {
        sSourceCodeHTML = mHighlight.highlight(sLanguage, sSourceCode, false).value;
      } catch (oError) {
        return fCallback(oError);
      };
    } else {
      sSourceCodeHTML = fsHTMLEncodeEntities(sSourceCode);
    };
    var oSection = dxSection.sType == "Source code" ? {
      "sType": "source code",
      "sName": dxSection.sAttachmentFileName || dxSection.sFileName,
      "sContentHTML": sSourceCodeHTML,
      "sAttachmentFileName": dxSection.sAttachmentFileName || dxSection.sFileName,
      "sAttachmentData": sSourceCode,
    } : {
      "sType": "source code snippet",
      "sContentHTML": sSourceCodeHTML,
    };
    fCallback(null, oSection);
  });
};
