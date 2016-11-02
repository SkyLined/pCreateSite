module.exports = fWriteFile;
var mFS = require("fs");

function fWriteFile(sFilePath, sData, fCallback) {
  console.log("Writing file " + sFilePath + " ...");
  mFS.writeFile(sFilePath, sData, {"encoding": "utf8"}, function (oError, sData) {
    if (oError) return fCallback(oError);
    fCallback(oError, sData);
  });
};