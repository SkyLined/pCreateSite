module.exports = fsHTMLDecodeEntities;

var dsChar_by_sName = { // Minimal implementation.
  "amp":  "&",
  "lt":   "<",
  "gt":   ">",
  "nbsp": " ",
  "quot": '"',
};

function fsHTMLDecodeEntities(sData) {
  return sData.replace(/&(?:#([0-9]+)|#x([0-9a-f]+)|(\w+));/g, function (sMatch, sDecimal, sHexadecimal, sName) {
    if (sDecimal) return String.fromCharCode(parseInt(sDecimal));
    if (sHexadecimal) return String.fromCharCode(parseInt(sHexadecimal, 16));
    if (sName in dsChar_by_sName) return dsChar_by_sName[sName];
    return "&" + sName + ";";
  });
}