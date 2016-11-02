module.exports = fReadFile;
var mFS = require("fs");

function fReadFile(sFilePath, fCallback) {
  console.log("Reading file " + sFilePath + " ...");
  mFS.readFile(sFilePath, {"encoding": "utf8"}, function (oError, sData) {
    if (oError) return fCallback(oError);
    fCallback(oError, sData);
  });
};