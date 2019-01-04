module.exports = fCopyFolder;
var mPath = require("path"),
    fCopyFile = require("./fCopyFile"),
    fCreateFolderIfNotExists = require("./fCreateFolderIfNotExists"),
    fReadFolder = require("./fReadFolder"),
    fReadFolder = require("./fReadFolder"),
    fIsFolder = require("./fIsFolder");

function fCopyFolder(sFromFolderPath, sToFolderPath, fCallback) {
  console.log("Copying folder " + sFromFolderPath + " to " + sToFolderPath + " ...");
  fCreateFolderIfNotExists(sToFolderPath, function (oError) {
    if (oError) return fCallback(oError);
    fReadFolder(sFromFolderPath, function (oError, asFileAndFolderNames) {
      if (oError) return fCallback(oError);
      var uFilesAndFoldersCopied = 0, bErrorReported = false;
      asFileAndFolderNames.forEach(function (sFileOrFolderName) {
        if (bErrorReported) return;
        var sFileOrFolderPath = mPath.join(sFromFolderPath, sFileOrFolderName);
        fIsFolder(sFileOrFolderPath, function (oError, bIsFolder) {
          if (bErrorReported) return;
          if (oError) {
            bErrorReported = true;
            return fCallback(oError);
          };
          if (bIsFolder) {
            var sFromSubFolderPath = mPath.join(sFromFolderPath, sFileOrFolderName),
                sToSubFolderPath = mPath.join(sToFolderPath, sFileOrFolderName);
            fCreateFolderIfNotExists(sToSubFolderPath, function (oError) {
              if (bErrorReported) return;
              if (oError) {
                bErrorReported = true;
                return fCallback(oError);
              };
              fCopyFolder(sFromSubFolderPath, sToSubFolderPath, function(oError, sData) {
                if (bErrorReported) return;
                if (oError) {
                  bErrorReported = true;
                  return fCallback(oError);
                };
                if (++uFilesAndFoldersCopied == asFileAndFolderNames.length) {
                  fCallback();
                };
              });
            });
          } else {
            var sFromFilePath = mPath.join(sFromFolderPath, sFileOrFolderName),
                sToFilePath = mPath.join(sToFolderPath, sFileOrFolderName);
            fCopyFile(sFromFilePath, sToFilePath, function(oError) {
              if (bErrorReported) return;
              if (oError) {
                bErrorReported = true;
                return fCallback(oError);
              };
              if (++uFilesAndFoldersCopied == asFileAndFolderNames.length) {
                fCallback();
              };
            });
          };
        });
      });
    });
  });
};
