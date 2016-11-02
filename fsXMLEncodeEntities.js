module.exports = fsXMLEncodeEntities;

function fsXMLEncodeEntities(sData) {
  // Minimal implementation.
  return sData.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}