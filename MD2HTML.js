var mPath = require("path"),
    fReadMarkdownFileAsHTML = require("./fReadMarkdownFileAsHTML"),
    fWriteFile = require("./fWriteFile");

var sInputFilePath, sOutputFilePath;
process.argv.slice(2).forEach(function (sArgument) {
  if (sArgument.toLowerCase().substr(0, 8) == "--input=") {
    sInputFilePath = mPath.join(sArgument.substr(8));
  } else if (sArgument.toLowerCase().substr(0, 9) == "--output=") {
    sOutputFilePath = mPath.join(sArgument.substr(9));
  } else if (!sInputFilePath) {
    sInputFilePath = mPath.join(sArgument);
  } else if (!sOutputFilePath) {
    sOutputFilePath = mPath.join(sArgument);
  } else {
    console.log("* Ignored superflous argument: " + sArgument);
  };
});

if (!sInputFilePath) {
  console.log("Syntax:");
  console.log("  MD2HTML.js [--input=]\"input file path\" [[--output=]\"output file path\"]");
} else {
  if (!sOutputFilePath) {
    if (sInputFilePath.toLowerCase().substr(sInputFilePath.length - 3) == ".md") {
      sOutputFilePath = sInputFilePath.substr(0, sInputFilePath.length - 3) + ".html";
    } else {
      sOutputFilePath = sInputFilePath + ".html";
    };
  };
  fReadMarkdownFileAsHTML(sInputFilePath, function (oError, sDataHTML) {
    if (oError) throw oError;
    fWriteFile(sOutputFilePath, sDataHTML, function (oError) {
      if (oError) throw oError;
      console.log("+ Created " + sOutputFilePath + ".");
    });
  });
};
