module.exports = fReadJSONFile;
var fReadFile = require("./fReadFile");

function fReadJSONFile(
    sFilePath, fCallback) {
  fReadFile(sFilePath, function (oError, sData) {
    if (oError) return fCallback(oError);
    try {
      var xData = JSON.parse(sData);
    } catch (oError) {
      fCallback(new Error("Error parsing " + sFilePath + ": " + oError.message));
    };
    fCallback(oError, xData);
  });
};