module.exports = fReadMarkdownFileAsHTML;
var mPath = require("path"),
    fReadFile = require("./fReadFile"),
    mMarked = require("marked"),
    mHighlight = require("highlight.js");

var dxMarkedOptions = { // See https://github.com/chjj/marked for details.
      "gfm": true,         // Enable GitHub flavored Markdown
        "tables": false,    // Enable GitHub flavored Markdown tables (requires "gfm" == true)
        "breaks": false,    // Enable GitHub flavored Markdown line breaks (requires "gfm" == true)
      "headerPrefix": "",   // inserted before the id of any heading.
      "highlight": function (sCode, sLanguage, fCallback) {
        if (sLanguage) {
          return mHighlight.highlight(sLanguage, sCode, false).value; // Source code highlighting engine
        } else {
          return sCode;
        }
      },
      "pedantic": false,    // Enable strict adherence to original Markdown standard
      "sanitize": true,     // Escape(?) HTML from input files.
      "smartLists": true,   // Enable "smarter" lists than the original Markdown standard
      "smartypants": false, // Enable "smarter" typograhic punctuation (quotes, dashes).
    };
dxMarkedOptions["renderer"] = new mMarked.Renderer(dxMarkedOptions);
var oMarkedLexer = new mMarked.Lexer(dxMarkedOptions);

function fReadMarkdownFileAsHTML(sFilePath, fCallback) {
  fReadFile(sFilePath, function (oError, sData) {
    if (oError) return fCallback(oError);
    try {
      var aoDataMarkerTokens = oMarkedLexer.lex(sData);
    } catch (oError) {
      oError.message += " while lexing " + sFilePath;
      fCallback(oError);
    };
    try {
      var sDataHTML = mMarked.parser(aoDataMarkerTokens, dxMarkedOptions);
    } catch (oError) {
      oError.message += " while parsing " + sFilePath;
      fCallback(oError);
    };
    var asMissingLink = sDataHTML.match(/\[.*?\]\[\]/);
    if (asMissingLink)
        throw new Error("The link " + asMissingLink[0] + " is not defined in markdown file " + sFilePath);
    fCallback(oError, sDataHTML);
  });
};
