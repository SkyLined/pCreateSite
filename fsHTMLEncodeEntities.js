module.exports = fsHTMLEncodeEntities;

function fsHTMLEncodeEntities(sData, bPreserveSpaces) {
  // Minimal implementation.
  return sData.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /g, bPreserveSpaces ? "&nbsp;" : " ");
}