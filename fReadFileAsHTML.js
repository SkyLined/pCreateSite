module.exports = fReadFileAsHTML;
var mPath = require("path"),
    fReadMarkdownFileAsHTML = require("./fReadMarkdownFileAsHTML"),
    fReadFile = require("./fReadFile");

function fReadFileAsHTML(sFilePath, fCallback) {
  switch (mPath.extname(sFilePath)) {
    case ".md":
      return fReadMarkdownFileAsHTML(sFilePath, function (oError, sContentHTML) {
        if (oError) return fCallback(oError);
        return fCallback(oError, sContentHTML);
      });
    case ".html":
      return fReadFile(sFilePath, function (oError, sContentHTML) {
        if (oError) return fCallback(oError);
        return fCallback(oError, sContentHTML);
      });
  };
  return fCallback(new Error("Unhandled file extension in  " + sFilePath));
};
