module.exports = fIsFolder;
var mFS = require("fs");

function fIsFolder(sFolderPath, fCallback) {
  mFS.stat(sFolderPath, function (oError, oStatus) {
    if (oError) return fCallback(oError);
    fCallback(oError, oStatus.isDirectory());
  });
};