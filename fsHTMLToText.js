module.exports = fsHTMLToText;
var fsHTMLDecodeEntities = require("./fsHTMLDecodeEntities");

function fsHTMLToText(sInputHTML) {
  var uIndex = 0, sUnprocessedHTML = sInputHTML, sOutputText = "", sLastProcessed = null;
  function fbProcess(sElementName, rRegExp, bIsText) {
    var asMatch = sUnprocessedHTML.match(rRegExp);
    if (asMatch) {
      var sMatch = asMatch[0];
      sUnprocessedHTML = sUnprocessedHTML.substr(sMatch.length);
      uIndex += sMatch.length;
//      console.log(sElementName + " at index " + uIndex + " = " + JSON.stringify(sMatch));
      sLastProcessed = sMatch;
      // Strip CR LFs; replace with spaces.
      if (bIsText) sOutputText += fsHTMLDecodeEntities(sMatch.replace(/\s*[\r\n]+\s*/g, " "));
      return true;
    };
    return false;
  };
  while (sUnprocessedHTML.length > 0) {
    var uTagStartIndex = uIndex;
    if (fbProcess("start tag", /^<\!?\w+/g)) { // start of a HTML opening or self-closing tag (optional)
      var sTagName = sLastProcessed.replace(/^<\!?/, "");
      while (1) {
        if (sUnprocessedHTML.length == 0) {
          throw new Error("Unterminated " + sTagName +" tag starts at index " + uTagStartIndex + ": " + 
              JSON.stringify(sInputHTML.substr(uTagStartIndex, 50) + "..."));
        } else if (fbProcess("attribute", /^\s+[^\s\=]+(=(\'[^\']*\'|\"[^\"]*\"|[^\s\/\>]+))?/g)) { // tag attribute (optional)
          // done processing attribute
        } else if (fbProcess("end tag", /^\s*\/?>/g)) { // end of a HTML tag. (required, but not immediately)
          break; // Done processing HTML tag
        } else {
          throw new Error("Syntax error in HTML at index " + uIndex + ": " + sInputHTML.substr(uIndex, 50));
        };
      };
      switch (sTagName) {
        // anything inside these tags is not rendered as text on the page and should not be processed:
        case "script": case "style": case "title":
          if (fbProcess("end tag", new RegExp("^[\\s\\S]*?<\\/" + sTagName + ">"))) {
            break;
          } else {
            throw new Error("Unclosed " + sTagName + " tag starts at index " + uTagStartIndex + ": " + 
                JSON.stringify(sInputHTML.substr(uTagStartIndex, 50) + "..."));
          };
        case "br": case "p":
          sOutputText += "\r\n";
      };
    } else if (fbProcess("comment", /^<!\-\-.*\-\->/g)) { // HTML comment
      // Nothing is done for comments.
    } else if (fbProcess("close tag", /^<\/\w+>/g)) { // HTML closing tag (optional)
      var sTagName = sLastProcessed.replace(/^<\/|>$/g, "");
      switch (sTagName) {
        case "p":
          sOutputText += "\r\n";
      };
    } else if (fbProcess("text", /[^<]+/g, true)) {
      // Text is added.
    } else {
      throw new Error("Syntax error in HTML at index " + uIndex + ": " + JSON.stringify(sInputHTML.substr(uIndex, 50) + "..."));
    };
  };
  // There may be a leading or trailing CR LF if the HTML started or ended with a <p> which should be removed.
  return sOutputText.replace(/^\r\n|\r\n$/, "");
};