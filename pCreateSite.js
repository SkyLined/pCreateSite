var mPath = require("path"),
    fCopyFolder = require("./fCopyFolder"),
    fReadJSONFile = require("./fReadJSONFile"),
    fReadTemplatesFromFolder = require("./fReadTemplatesFromFolder"),
    fReadArticlesFromFolder = require("./fReadArticlesFromFolder"),
    fCreateSite = require("./fCreateSite"),
    sInputFolderPath,
    sOutputFolderPath;

process.argv.forEach(function (sArgument) {
  if (sArgument.toLowerCase().substr(0, 8) == "--input=") {
    sInputFolderPath = mPath.join(sArgument.substr(8));
  } else if (sArgument.toLowerCase().substr(0, 9) == "--output=") {
    sOutputFolderPath = mPath.join(sArgument.substr(9));
  };
});

if (!sInputFolderPath || !sOutputFolderPath) {
  console.log("Syntax:");
  console.log("  node pCreateSite.js --input=\"input folder path\" --output=\"output folder path\"");
} else {
  fReadJSONFile(mPath.join(sInputFolderPath, "Settings.json"), function (oError, dxSettings) {
    if (oError) throw oError;
    var sTemplatesFolderPath = mPath.join(sInputFolderPath, dxSettings["sTemplatesFolderPath"]),
        sArticlesFolderPath = mPath.join(sInputFolderPath, dxSettings["sArticlesFolderPath"]),
        sStaticFolderPath = mPath.join(sInputFolderPath, dxSettings["sStaticFolderPath"]),
        sAbsoluteBaseURL = dxSettings["sAbsoluteBaseURL"],
        sRelativeBaseURL = dxSettings["sRelativeBaseURL"];
    fReadTemplatesFromFolder(sTemplatesFolderPath, function (oError, dsTemplate_by_sFileName) {
      if (oError) throw oError;
      fReadArticlesFromFolder(sArticlesFolderPath, function (oError, aoArticles) {
        if (oError) throw oError;
        var oSite = {
              "sTitle": dxSettings["sTitle"],
              "sSummary": dxSettings["sSummary"],
              "sMainPageHTMLFilePath": mPath.join(sOutputFolderPath, "index.html"),
              "sRSSFeedXMLFilePath": mPath.join(sOutputFolderPath, "rss.xml"),
              "sAbsoluteURL": sAbsoluteBaseURL,
              "sMainPageAbsoluteURL": sAbsoluteBaseURL + "index.html",
              "sMainPageRelativeURL": sRelativeBaseURL + "index.html",
              "aoArticles": aoArticles
            };
        aoArticles.forEach(function (oArticle) {
          var sArticleID = oArticle.uSequenceNumber.toString();
          oArticle.oSite = oSite
          oArticle.sPageHTMLFilePath = mPath.join(sOutputFolderPath, sArticleID + ".html");
          oArticle.sPageAbsoluteURL = sAbsoluteBaseURL + encodeURIComponent(sArticleID + ".html");
          oArticle.sPageRelativeURL = sRelativeBaseURL + encodeURIComponent(sArticleID + ".html");
          oArticle.sAttachmentsFolderPath = mPath.join(sOutputFolderPath, sArticleID);
          oArticle.sAttachmentsAbsoluteBaseURL = sAbsoluteBaseURL + encodeURIComponent(sArticleID) + "/";
          oArticle.sAttachmentsRelativeBaseURL = sRelativeBaseURL + encodeURIComponent(sArticleID) + "/";
        });
        fCreateSite(oSite, dsTemplate_by_sFileName, function (oError) {
          if (oError) throw oError;
          fCopyFolder(sStaticFolderPath, sOutputFolderPath, function (oError) {
            if (oError) throw oError;
            console.log("Site created");
          });
        });
      });
    });
  });
};
