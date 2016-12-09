var mPath = require("path"),
    fCopyFolder = require("./fCopyFolder"),
    fReadJSONFile = require("./fReadJSONFile"),
    fReadTemplatesFromFolder = require("./fReadTemplatesFromFolder"),
    fReadArticlesFromFolder = require("./fReadArticlesFromFolder"),
    fCreateArticles = require("./fCreateArticles"),
    fCreateMainPage = require("./fCreateMainPage"),
    fCreateRSSFeed = require("./fCreateRSSFeed");

var sInputFolderPath, sOutputFolderPath;
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
  fReadJSONFile(mPath.join(sInputFolderPath, "dxSite.json"), function (oError, dxSite) {
    if (oError) throw oError;
    var sTemplatesFolderPath = mPath.join(sInputFolderPath, dxSite["sTemplatesFolderPath"]),
        sArticlesFolderPath = mPath.join(sInputFolderPath, dxSite["sArticlesFolderPath"]),
        sStaticFolderPath = mPath.join(sInputFolderPath, dxSite["sStaticFolderPath"]),
        sBaseAbsoluteURL = dxSite["sBaseAbsoluteURL"],
        sBaseRelativeURL = dxSite["sBaseRelativeURL"];
    fReadTemplatesFromFolder(sTemplatesFolderPath, function (oError, dsTemplate_by_sFileName) {
      if (oError) throw oError;
      fReadArticlesFromFolder(sArticlesFolderPath, function (oError, aoArticles) {
        if (oError) throw oError;
        var oDate = new Date(),
            oSite = {
              "sSiteCopyrightYear": oDate.getFullYear().toString(),
              "sSitelastUpdatedDate": [oDate.getFullYear().toString(), oDate.getMonth().toString(), oDate.getDate().toString()].join("-"),
              "sName": dxSite["sName"],
              "oAuthor": {
                "sName": dxSite["dxAuthor"]["sName"],
                "sTwitterHandle": dxSite["dxAuthor"]["sTwitterHandle"],
                "sGitHubHandle": dxSite["dxAuthor"]["sGitHubHandle"],
                "sEmailAddress": dxSite["dxAuthor"]["sEmailAddress"],
                "sBitcoin": dxSite["dxAuthor"]["sBitcoin"],
              },
              "sAuthorTwitterHandle": dxSite["sAuthorTwitterHandle"],
              "oLicense": {
                "sDescription": dxSite["dxLicense"]["sDescription"],
                "sImageRelativeURL": dxSite["dxLicense"]["sImageRelativeURL"],
                "sDetailsAbsoluteURL": dxSite["dxLicense"]["sDetailsAbsoluteURL"],
              },
              "sSummary": dxSite["sSummary"],
              "sMainPageHTMLFilePath": mPath.join(sOutputFolderPath, "index.html"),
              "sRSSFeedXMLFilePath": mPath.join(sOutputFolderPath, "rss.xml"),
              "sBaseAbsoluteURL": sBaseAbsoluteURL,
              "sMainPageRelativeURL": sBaseRelativeURL + "index.html",
              "asBannerImageRelativeURLs": dxSite["asBannerImageRelativeURLs"],
              "sTwitterAvatarRelativeURL": dxSite["sTwitterAvatarRelativeURL"],
              "aoArticles": aoArticles
            };
        aoArticles.forEach(function (oArticle) {
          var sArticleID = oArticle.uSequenceNumber.toString();
          oArticle.oSite = oSite
          oArticle.sPageHTMLFilePath = mPath.join(sOutputFolderPath, sArticleID + ".html");
          oArticle.sPageAbsoluteURL = sBaseAbsoluteURL + encodeURIComponent(sArticleID + ".html");
          oArticle.sPageRelativeURL = sBaseRelativeURL + encodeURIComponent(sArticleID + ".html");
          oArticle.sAttachmentsFolderPath = mPath.join(sOutputFolderPath, sArticleID);
          oArticle.sAttachmentsBaseAbsoluteURL = sBaseAbsoluteURL + encodeURIComponent(sArticleID) + "/";
          oArticle.sAttachmentsBaseRelativeURL = sBaseRelativeURL + encodeURIComponent(sArticleID) + "/";
        });
        fCreateArticles(oSite, dsTemplate_by_sFileName, function (oError) {
          if (oError) fCallback(oError);
          fCreateMainPage(oSite, dsTemplate_by_sFileName, function (oError) {
            if (oError) fCallback(oError);
            fCreateRSSFeed(oSite, dsTemplate_by_sFileName, function (oError) {
              if (oError) throw oError;
              fCopyFolder(sStaticFolderPath, sOutputFolderPath, function (oError) {
                if (oError) throw oError;
                console.log("Site created");
              });
            });
          });
        });
      });
    });
  });
};
