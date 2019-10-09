var mPath = require("path"),
    fCopyFile = require("./fCopyFile"),
    fCopyFolder = require("./fCopyFolder"),
    fCreateFolderIfNotExists = require("./fCreateFolderIfNotExists"),
    fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fReadJSONFile = require("./fReadJSONFile"),
    fReadTemplatesFromFolder = require("./fReadTemplatesFromFolder"),
    fReadArticlesFromFolder = require("./fReadArticlesFromFolder"),
    fCreateArticles = require("./fCreateArticles"),
    fCreateMainPage = require("./fCreateMainPage"),
    fCreateRSSFeed = require("./fCreateRSSFeed"),
    fsDate = require("./fsDate");

var sInputFolderPath, sOutputFolderPath;
process.argv.forEach(function (sArgument) {
  if (sArgument.toLowerCase().substr(0, 8) == "--input=") {
    sInputFolderPath = mPath.join(sArgument.substr(8));
  } else if (sArgument.toLowerCase().substr(0, 9) == "--output=") {
    sOutputFolderPath = mPath.join(sArgument.substr(9));
  };
});

if (!sInputFolderPath || !sOutputFolderPath) {
  console.log("Invalid arguments: " + process.argv.join(" "));
  console.log("Syntax:");
  console.log("  node pCreateSite.js --input=\"input folder path\" --output=\"output folder path\"");
  process.exit(1);
};
fReadJSONFile(mPath.join(sInputFolderPath, "dxSite.json"), function (oError, dxSite) {
  if (oError) throw oError;
  var sTemplatesFolderPath = mPath.join(sInputFolderPath, dxSite["sTemplatesFolderPath"]),
      sArticlesFolderPath = mPath.join(sInputFolderPath, dxSite["sArticlesFolderPath"]),
      sStaticFolderPath = mPath.join(sInputFolderPath, dxSite["sStaticFolderPath"]);
  fReadTemplatesFromFolder(sTemplatesFolderPath, function (oError, dsTemplate_by_sFileName) {
    if (oError) throw oError;
    fReadArticlesFromFolder(sArticlesFolderPath, function (oError, aoArticles) {
      if (oError) throw oError;
      var oDate = new Date();
      Object.keys(dxSite["dxSubdomains"]).forEach(function (sSubdomain) {
        var dxSubdomain = dxSite["dxSubdomains"][sSubdomain],
            asStaticFilePaths = dxSubdomain["asStaticFilePaths"],
            sBaseAbsoluteURL = dxSubdomain["sBaseAbsoluteURL"],
            sBaseRelativeURL = dxSubdomain["sBaseRelativeURL"],
            oSite = {
              "sSubdomain": sSubdomain,
              "sOutputFolderPath": mPath.join(sOutputFolderPath, sSubdomain),
              "sSiteCopyrightYear": oDate.getFullYear().toString(),
              "sSitelastUpdatedDate": fsDate(oDate.getFullYear(), oDate.getMonth(), oDate.getDate()),
              "sName": dxSubdomain["sName"],
              "oAuthor": {
                "sName": dxSubdomain["dxAuthor"]["sName"],
                "sTwitterHandle": dxSubdomain["dxAuthor"]["sTwitterHandle"],
                "sGitHubHandle": dxSubdomain["dxAuthor"]["sGitHubHandle"],
                "sEmailAddress": dxSubdomain["dxAuthor"]["sEmailAddress"],
                "sBitcoin": dxSubdomain["dxAuthor"]["sBitcoin"],
              },
              "sAuthorTwitterHandle": dxSubdomain["sAuthorTwitterHandle"],
              "oLicense": {
                "sDescription": dxSubdomain["dxLicense"]["sDescription"],
                "sImageRelativeURL": dxSubdomain["dxLicense"]["sImageRelativeURL"],
                "sDetailsAbsoluteURL": dxSubdomain["dxLicense"]["sDetailsAbsoluteURL"],
              },
              "sSummary": dxSubdomain["sSummary"],
              "sBaseAbsoluteURL": sBaseAbsoluteURL,
              "sMainPageRelativeURL": sBaseRelativeURL + "index.html",
              "asBannerImageRelativeURLs": dxSubdomain["asBannerImageRelativeURLs"],
              "sTwitterAvatarRelativeURL": dxSubdomain["sTwitterAvatarRelativeURL"],
              "asJavaScripts": dxSubdomain["asJavaScripts"],
            },
            aoSiteArticles = [];
        // Add all articles that are relevant to this sub-domain.
        aoArticles.forEach(function (oArticle) {
          if (oArticle.asSubdomains.indexOf(sSubdomain) != -1) {
            var sArticleID = oArticle.uSequenceNumber.toString();
            oArticle.sRelativeURL = sBaseRelativeURL + encodeURIComponent(sArticleID + ".html");
            oArticle.sAttachmentsBaseRelativeURL = sBaseRelativeURL + encodeURIComponent(sArticleID) + "/";
            aoSiteArticles.push(oArticle);
          };
        });
        fCreateFolderIfNotExists(oSite.sOutputFolderPath, function (oError) {
          fCreateArticles(oSite, aoSiteArticles, dsTemplate_by_sFileName, function (oError) {
            if (oError) throw oError;
            fCreateMainPage(oSite, aoSiteArticles, dsTemplate_by_sFileName, function (oError) {
              if (oError) throw oError;
              fCreateRSSFeed(oSite, aoSiteArticles, dsTemplate_by_sFileName, function (oError) {
                if (oError) throw oError;
                var uStaticFilesAndFoldersCopied = 0;
                asStaticFilePaths.forEach(function (sStaticFilePath) {
                  if (sStaticFilePath.substr(-2) == "\\*") {
                    var sStaticFolderPath = sStaticFilePath.substr(0, sStaticFilePath.length - 2),
                        sStaticInputFolderPath = mPath.join(sInputFolderPath, "Static", sStaticFolderPath),
                        sStaticOutputFolderPath = mPath.join(oSite.sOutputFolderPath, sStaticFolderPath);
                    fCopyFolder(sStaticInputFolderPath, sStaticOutputFolderPath, function (oError) {
                      if (oError) throw oError;
                      uStaticFilesAndFoldersCopied += 1;
                      if (uStaticFilesAndFoldersCopied == asStaticFilePaths.length) {
                        console.log("Site " + sSubdomain + " created");
                      };
                    });
                  } else {
                    var sStaticInputFilePath = mPath.join(sInputFolderPath, "Static", sStaticFilePath),
                        sStaticOutputFilePath = mPath.join(oSite.sOutputFolderPath, sStaticFilePath),
                        sStaticOutputFolderPath = mPath.dirname(sStaticOutputFilePath);
                    fCreateFolderIfNotExists(sStaticOutputFolderPath, function (oError) {
                      if (oError) throw oError;
                      fCopyFile(sStaticInputFilePath, sStaticOutputFilePath, function (oError) {
                        if (oError) throw oError;
                        uStaticFilesAndFoldersCopied += 1;
                        if (uStaticFilesAndFoldersCopied == asStaticFilePaths.length) {
                          console.log("Site " + sSubdomain + " created");
                        };
                      });
                    });
                  };
                });
              });
            });
          });
        });
      });
    });
  });
});

