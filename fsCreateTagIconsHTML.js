module.exports = fsCreateTagIconsHTML;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities");

function fsCreateTagIconsHTML(asTags) {
  return asTags.map(function (sTag) {
    var sTagHTML = fsHTMLEncodeEntities(sTag);
    return "<img class=\"icon\" title=\"" + sTagHTML + "\" src=\"/Images/" + sTagHTML + ".svg\"/>";
  }).join("");
}
