module.exports = fReadFolder;
var mFS = require("fs");

function fReadFolder(sFolderPath, fCallback) {
  console.log("Reading folder " + sFolderPath + " ...");
  mFS.readdir(sFolderPath, function (oError, asFileAndFolderNames) {
    if (oError) return fCallback(oError);
    fCallback(oError, asFileAndFolderNames);
  });
};