module.exports = fsCreateIconImagesHTML;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities");

function fsCreateIconImagesHTML(asIcons) {
   return asIcons.map(function (sIcon) {
      return "<img class=\"icon\" src=\"/Images/" + fsHTMLEncodeEntities(sIcon) + "\"/>";
  }).join("");
}
