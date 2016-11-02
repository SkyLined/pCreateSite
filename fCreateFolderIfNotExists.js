module.exports = fCreateFolderIfNotExists;
var mFS = require("fs");

function fCreateFolderIfNotExists(sFolderPath, fCallback) {
  mFS.lstat(sFolderPath, function (oError, oStats) {
    if (!oError) {
      if (!oStats.isDirectory()) { // Something with this name exists, but it is not a folder.
        return fCallback(new Error("The folder " + JSON.stringify(sFolderPath) + " could not be created"));
      }
      return fCallback(); // already exist.
    };
    console.log("Creating folder " + sFolderPath + " ...");
    mFS.mkdir(sFolderPath, function (oError) {
      if (oError) { // An error happened while creating the folder.
        return fCallback(new Error("Cannot create folder " + sFolderPath + ": " + oError.message));
      };
      fCallback(); // Successfully created
    });
  });
};