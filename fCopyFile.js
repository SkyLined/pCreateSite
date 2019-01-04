module.exports = fCopyFile;
var fReadBinaryFile = require("./fReadBinaryFile"),
    fWriteFile = require("./fWriteFile");

function fCopyFile(sFromFilePath, sToFilePath, fCallback) {
  console.log("Copying file " + sFromFilePath + " to " + sToFilePath + " ...");
  fReadBinaryFile(sFromFilePath, function(oError, sData) {
    if (oError) {
      return fCallback(oError);
    };
    fWriteFile(sToFilePath, sData, function(oError) {
      if (oError) {
        return fCallback(oError);
      };
      fCallback();
    });
  });
};