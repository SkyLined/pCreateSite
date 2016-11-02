module.exports = fReadFileAsHTML;
var mPath = require("path"),
    fReadMarkdownFileAsHTML = require("./fReadMarkdownFileAsHTML"),
    fReadFile = require("./fReadFile");

function fReadFileAsHTML(sArticleFilePath, fCallback) {
  switch (mPath.extname(sArticleFilePath)) {
    case ".md":
      return fReadMarkdownFileAsHTML(sArticleFilePath, function (oError, sContentHTML) {
        if (oError) return fCallback(oError);
        return fCallback(oError, sContentHTML);
      });
    case ".html":
      return fReadFile(sSectionFilePath, function (oError, sContentHTML) {
        if (oError) return fCallback(oError);
        return fCallback(oError, sContentHTML);
      });
  };
  return fCallback(new Error("Unhandled article file extension in  " + sArticleFilePath));
};
