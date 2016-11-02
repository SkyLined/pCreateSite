module.exports = fReadBinaryFile;
var mFS = require("fs");

function fReadBinaryFile(sFilePath, fCallback) {
  console.log("Reading file " + sFilePath + " ...");
  mFS.readFile(sFilePath, {"encoding": null}, function (oError, sData) {
    if (oError) return fCallback(oError);
    fCallback(oError, sData);
  });
};