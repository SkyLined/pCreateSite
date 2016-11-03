module.exports = fReadArticleFromFolder;
var mPath = require("path"),
    fReadFile = require("./fReadFile"),
    fReadFileAsHTML = require("./fReadFileAsHTML"),
    fsHTMLDecodeEntities = require("./fsHTMLDecodeEntities"),
    fReadJSONFile = require("./fReadJSONFile"),
    mHighlight = require("highlight.js"),
    fReadBugIdReportSectionFromFile = require("./fReadBugIdReportSectionFromFile");

// Each article folder should follow the format "YYYY-MM-DD#I ...", where "YYYY" is the year, "MM" is the month, "DD"
// is the day, and "I" is an index (optional, defaults to 1, useful if you have more than one post in one day).
// A sequence number is generated from this information and used to create a unique file name for, and thus a link to,
// the article.
var rArticleFolderNameSequenceNumber = /^((\d{4})\-(\d{2})\-(\d{2}))(?:\#(\d+))?\s/i,
    rArticleTitleSynopsis = /^\s*<h\d(?:\s+[^>]*)>(.+?)<\/h\d>\s+([\s\S]+?)\s*$/i,
    dsLanguage_by_sSourceFileExtention = {
      ".html":    "HTML",
      ".xhtml":   "HTML",
      ".svg":     "SVG",
      ".js":      "Javascript",
      ".py":      "Python",
    };

function fReadArticleFromFolder(sBaseFolderPath, sArticleFolderName, fCallback) {
  var sArticleFolderPath = mPath.join(sBaseFolderPath, sArticleFolderName),
      asSequenceNumberComponents = sArticleFolderName.match(rArticleFolderNameSequenceNumber);
  if (!asSequenceNumberComponents) {
    return fCallback(new Error("Article folder file name does not start with a valid date/index in " + sArticleFolderPath));
  };
  var uYear = parseInt(asSequenceNumberComponents[2]),
      uMonth = parseInt(asSequenceNumberComponents[3]),
      uDay = parseInt(asSequenceNumberComponents[4]),
      uIndex = asSequenceNumberComponents[5] ? parseInt(asSequenceNumberComponents[5]) : 1,
      uArticleSequenceNumber = ((uYear * 100 + uMonth) * 100 + uDay) * 1000 + uIndex,
      oArticle = {
        "sSource": sArticleFolderName,
        "sDate": asSequenceNumberComponents[1],
        "oDate": new Date(uYear, uMonth, uDay),
        "uYear": uYear, "uMonth": uMonth, "uDay": uDay, "uIndex": uIndex,
        "uSequenceNumber": uArticleSequenceNumber,
        "sTitle": void 0,
        "sSummary": void 0,
        "sSynopsisHTML": void 0,
        "asIcons": [],
        "aoSections": [],
      };
  var sArticleJSONFilePath = mPath.join(sArticleFolderPath, "dxArticle.json");
  fReadJSONFile(sArticleJSONFilePath, function (oError, dxArticle) {
    if (oError) return fCallback(oError);
    // dxArticle
    if (typeof dxArticle != "object") return fCallback(new Error("dxArticle is not an object in " + sArticleJSONFilePath));
    for (sSetting in dxArticle) {
      if (!(sSetting in {"sTitle":0, "sSummary":0, "asIcons":0, "sSynopsisFileName":0, "adxSections":0})) {
        return fCallback(new Error("dxArticle." + sSetting + " is not a known article setting in " + sArticleJSONFilePath));
      };
    };
    // dxArticle.sTitle
    if (typeof dxArticle.sTitle != "string") return fCallback(new Error("dxArticle.sTitle is not a string in " + sArticleJSONFilePath));
    oArticle.sTitle = dxArticle.sTitle;
    // dxArticle.sSummary
    if (typeof dxArticle.sSummary != "string") return fCallback(new Error("dxArticle.sSummary is not a string in " + sArticleJSONFilePath));
    oArticle.sSummary = dxArticle.sSummary;
    // dxArticle.asIcons
    if (!(dxArticle.asIcons instanceof Array)) return fCallback(new Error("dxArticle.asIcons is not an array in " + sArticleJSONFilePath));
    var bErrorReported = false;
    dxArticle.asIcons.forEach(function (sIcon, uIndex) {
      if (typeof sIcon != "string") {
        bErrorReported = true;
        return fCallback(new Error("dxArticle.asIcons[" + uIndex + "] is not a string in " + sArticleJSONFilePath));
      };
    });
    if (bErrorReported) return;
    oArticle.asIcons = dxArticle.asIcons;
    // dxArticle.sSynopsisFileName
    if (typeof dxArticle.sSynopsisFileName != "string") return fCallback(new Error("dxArticle.sSynopsisFileName is not a string in " + sArticleJSONFilePath));
    var sSynopsisFilePath = mPath.join(sArticleFolderPath, dxArticle.sSynopsisFileName);
    return fReadFileAsHTML(sSynopsisFilePath, function (oError, sContentHTML) {
      if (oError) return fCallback(oError);
      oArticle.sSynopsisHTML = sContentHTML;
      if (!(dxArticle.adxSections instanceof Array)) return fCallback(new Error("dxArticle.adxSections is not an array in " + sArticleJSONFilePath));
      var uSectionFilesRead = 0;
      dxArticle.adxSections.forEach(function (dxSection, uIndex) {
        if (bErrorReported) return;
        // dxSection
        if (typeof dxSection != "object") {
          bErrorReported = true;
          return fCallback(new Error("dxArticle.adxSections[" + uIndex + "] is not a string in " + sArticleJSONFilePath));
        };
        for (sSetting in dxSection) {
          if (!(sSetting in {"sType":0, "sFileName":0, "sAttachmentFileName":0})) {
            bErrorReported = true;
            return fCallback(new Error("dxArticle.adxSections[" + uIndex + "]." + sSetting + " is not a known article section setting in " + sArticleJSONFilePath));
          };
        };
        // dxSection.sType
        if (typeof dxSection.sType != "string") {
          bErrorReported = true;
          return fCallback(new Error("dxArticle.adxSections[" + uIndex + "].sType is not a string in " + sArticleJSONFilePath));
        };
        // dxSection.sFileName
        if (typeof dxSection.sFileName != "string") {
          bErrorReported = true;
          return fCallback(new Error("dxArticle.adxSections[" + uIndex + "].sFileName is not a string in " + sArticleJSONFilePath));
        };
        // dxSection.sAttachmentFileName
        if ("sAttachmentFileName" in dxSection && typeof dxSection.sAttachmentFileName != "string") {
          bErrorReported = true;
          return fCallback(new Error("dxArticle.adxSections[" + uIndex + "].sAttachmentFileName is not a string in " + sArticleJSONFilePath));
        };
        var sSectionFilePath = mPath.join(sArticleFolderPath, dxSection.sFileName),
            sSectionFileExtention = mPath.extname(dxSection.sFileName);
        switch (dxSection.sType) {
          case "Text":
            return fReadFileAsHTML(sSectionFilePath, function (oError, sContentHTML) {
              if (bErrorReported) return;
              if (oError) {
                bErrorReported = true;
                return fCallback(oError);
              }
              oArticle.aoSections[uIndex] = {
                "sType": "text",
                "sContentHTML": sContentHTML
              };
              if (++uSectionFilesRead == dxArticle.adxSections.length) return fCallback(null, oArticle);
            });
          case "Source code":
            var sLanguage = dsLanguage_by_sSourceFileExtention[sSectionFileExtention];
            if (!sLanguage) {
              bErrorReported = true;
              return fCallback(new Error("dxArticle.adxSections[" + uIndex + "].sFileName has an unknown extention (" + sSectionFileExtention + ") in " + sArticleJSONFilePath));
            };
            return fReadFile(sSectionFilePath, function (oError, sSourceCode) {
              if (bErrorReported) return;
              if (oError) {
                bErrorReported = true;
                return fCallback(oError);
              };
              try {
                sSourceCodeHTML = mHighlight.highlight(sLanguage, sSourceCode, false).value;
              } catch (oError) {
                bErrorReported = true;
                return fCallback(oError);
              };
              oArticle.aoSections[uIndex] = {
                "sType": "source code",
                "sName": dxSection.sAttachmentFileName || dxSection.sFileName,
                "sContentHTML": sSourceCodeHTML,
                "sAttachmentFileName": dxSection.sAttachmentFileName || dxSection.sFileName,
                "sAttachmentData": sSourceCode,
              };
              if (++uSectionFilesRead == dxArticle.adxSections.length) return fCallback(null, oArticle);
            });
          case "BugId report":
            return fReadBugIdReportSectionFromFile(sSectionFilePath, dxSection, function (oError, oSection) {
              if (bErrorReported) return;
              if (oError) {
                bErrorReported = true;
                return fCallback(oError);
              };
              oArticle.aoSections[uIndex] = oSection;
              if (++uSectionFilesRead == dxArticle.adxSections.length) return fCallback(null, oArticle);
            });
          default:
            bErrorReported = true;
            return fCallback(new Error("dxArticle.adxSections[" + uIndex + "].sType (" + dxSection.sType + ") is not a known type in " + sArticleJSONFilePath));
        };
      });
    });
  });
};