module.exports = fsInsertLineAndWordBreaksInHTML;

function fsInsertLineAndWordBreaksInHTML(sInputHTML) {
  // We want to give some hints as to where a line break or word break can be inserted in various programming related
  // character sequences that can be very long, such as "namespace::class::property", "object.property",
  // camelCaseWords or underscore_containing_words. This can be done in HTML using the <wbr/> tag and &shy; entity.
  // But in order not to have this affect the HTML markup, we need to parse the HTML and only apply this to the text.
  var uIndex = 0, sOutputHTML = "";
  function fbProcess(sElementname, rRegExp, fsProcess) {
    var asMatch = sInputHTML.match(rRegExp);
    if (asMatch) {
      var sMatch = asMatch[0];
      sInputHTML = sInputHTML.substr(sMatch.length);
      uIndex += sMatch.length;
      var sProcessedMatch = fsProcess ? fsProcess(sMatch) : sMatch;
      sOutputHTML += sProcessedMatch;
      return true;
    };
    return false;
  };
  while (sInputHTML.length > 0) {
    var uHTMLTagStartIndex = uIndex;
    if (fbProcess("start tag", /^<\!?\w+/g)) { // start of a HTML opening or self-closing tag (optional)
      while (1) {
        if (sInputHTML.length == 0) throw new Error("Unterminated HTML tag starts at index " + uHTMLTagStartIndex + ": " + sInputHTML.substr(uHTMLTagStartIndex, 50));
        if (fbProcess("attribute", /^\s+[^\s\=]+(=(\'[^\']*\'|\"[^\"]*\"|[^\s\/\>]+))?/g)) { // tag attribute (optional)
          // done processing attribute
        } else if (fbProcess("end tag", /^\s*\/?>/g)) { // end of a HTML tag. (required, but not immediately)
          break; // Done processing HTML tag
        } else {
          throw new Error("Syntax error in HTML at index " + uIndex + ": " + sInputHTML.substr(uIndex, 50));
        };
      };
    } else if (fbProcess("comment", /^<!\-\-.*\-\->/g)) { // HTML comment
      // Nothing is done for these.
    } else if (fbProcess("close tag", /^<\/\w+>/g)) { // HTML closing tag (optional)
      // Nothing is done for these.
    } else if (fbProcess("text", /[^<]+/g, function (sText) { // text between HTML tags.
      return (
        sText
          .replace(/(\w)(::|\.)(\w)/g, "$1$2<wbr/>$3") // line-break is possible in "cClass::*fMethod" and "oObject.*fMethod"
          .replace(/([a-z])([A-Z])/g, "$1&shy;$2") // word-break is possible in "camel*Case*Words"
          .replace(/([a-z]_+)([a-z])/gi, "$1&shy;$2") // word-break is possible in "underscore_*containing_*words"
          .replace(/([A-Z]_+)([A-Z])/gi, "$1&shy;$2") // word-break is possible in "UNDERSCORE_*CONTAINING_*WORDS"
      );
    })) {
      // Done processing text.
    } else {
      throw new Error("Syntax error in HTML at index " + uIndex + ": " + sInputHTML.substr(uIndex, 50));
    };
  };
  return sOutputHTML;
};