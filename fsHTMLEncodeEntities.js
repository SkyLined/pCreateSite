module.exports = fsHTMLEncodeEntities;

function fsHTMLEncodeEntities(sText, bPreserveSpaces) {
  return (
    sText
      .replace(/&/g, "&amp;")
      .replace(/\"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/ /g, bPreserveSpaces ? "&nbsp;" : " ")
  );
};
