module.exports = fCreateMainPage;
var fsHTMLEncodeEntities = require("./fsHTMLEncodeEntities"),
    fWriteFile = require("./fWriteFile"),
    fsCreateTagIconsHTML = require("./fsCreateTagIconsHTML"),
    fsInsertLineAndWordBreaksInHTML = require("./fsInsertLineAndWordBreaksInHTML");

var asMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fauReverseSortedNumericKeys(dxValues_by_uNumber) {
  // The object keys a string representations of the numbers: get them and convert them back to numbers
  var auNumbers = Object.keys(dxValues_by_uNumber).map(function (sValue) { return parseInt(sValue); });
  auNumbers.sort(function (uNumber1, uNumber2) {
    return uNumber2 - uNumber1;
  });
  return auNumbers;
};

function fCreateMainPage(oSite, dsTemplate_by_sFileName, fCallback) {
  // Create a tree of HTML for articles by year by month by sequencenumber
  var dddsArticlesHTML_by_uSequenceNumber_by_uMonth_by_uYear = {};
  oSite.aoArticles.forEach(function(oArticle) {
    if (!(oArticle.uYear in dddsArticlesHTML_by_uSequenceNumber_by_uMonth_by_uYear)) {
      dddsArticlesHTML_by_uSequenceNumber_by_uMonth_by_uYear[oArticle.uYear] = {};
    };
    var ddsArticlesHTML_by_uSequenceNumber_by_uMonth = dddsArticlesHTML_by_uSequenceNumber_by_uMonth_by_uYear[oArticle.uYear];
    if (!(oArticle.uMonth in ddsArticlesHTML_by_uSequenceNumber_by_uMonth)) {
      ddsArticlesHTML_by_uSequenceNumber_by_uMonth[oArticle.uMonth] = {};
    };
    var dsArticlesHTML_by_uSequenceNumber = ddsArticlesHTML_by_uSequenceNumber_by_uMonth[oArticle.uMonth];
    if (oArticle.uSequenceNumber in dsArticlesHTML_by_uSequenceNumber)
        throw new Error("Two articles with sequence number " + oArticle.uSequenceNumber);
    var sArticleHTML = dsTemplate_by_sFileName["Main page article.html"]
        .replace(/<<sArticleTagIconsHTML>>/g, fsCreateTagIconsHTML(oArticle.asTags))
        .replace(/<<sArticleTitle>>/g, fsHTMLEncodeEntities(oArticle.sTitle))
        .replace(/<<sArticleSynopsisHTML>>/g, oArticle.sSynopsisHTML)
        .replace(/<<sArticleDate>>/g, fsHTMLEncodeEntities(oArticle.sDate))
        .replace(/<<sArticleRelativeURL>>/g, fsHTMLEncodeEntities(oArticle.sRelativeURL));
    dsArticlesHTML_by_uSequenceNumber[oArticle.uSequenceNumber] = sArticleHTML;
  });
  // Create HTML for articles grouped by year and month
  var auYears = fauReverseSortedNumericKeys(dddsArticlesHTML_by_uSequenceNumber_by_uMonth_by_uYear, true);
  var sArticlesGroupsHTML = auYears.map(function (uYear) {
    var ddsArticlesHTML_by_uSequenceNumber_by_uMonth = dddsArticlesHTML_by_uSequenceNumber_by_uMonth_by_uYear[uYear],
        auMonths = fauReverseSortedNumericKeys(ddsArticlesHTML_by_uSequenceNumber_by_uMonth);
    return auMonths.map(function (uMonth) {
      var sGroupTitle = asMonths[uMonth - 1] + " " + uYear,
          dsArticlesHTML_by_uSequenceNumber = ddsArticlesHTML_by_uSequenceNumber_by_uMonth[uMonth];
          auSequenceNumbers = fauReverseSortedNumericKeys(dsArticlesHTML_by_uSequenceNumber);
      var sArticlesHTML = auSequenceNumbers.map(function (uSequenceNumber) {
            return dsArticlesHTML_by_uSequenceNumber[uSequenceNumber];
          }).join(""),
          sArticlesGroupHTML = dsTemplate_by_sFileName["Main page articles group.html"]
              .replace(/<<sArticlesGroupTitle>>/g, fsHTMLEncodeEntities(sGroupTitle))
              .replace(/<<sArticlesHTML>>/g, sArticlesHTML);
      return sArticlesGroupHTML;
    }).join("");
  }).join("");
  // Create the page
  var sPageContentHTML = dsTemplate_by_sFileName["Main page.html"]
          .replace(/<<sArticlesGroupsHTML>>/g, sArticlesGroupsHTML),
      sBannerImageRelativeURL = oSite.asBannerImageRelativeURLs[Math.floor(Math.random() * oSite.asBannerImageRelativeURLs.length)],
      sPageHTML = dsTemplate_by_sFileName["Page.html"]
          .replace(/<<sSiteCopyrightYear>>/g, fsHTMLEncodeEntities(oSite.sSiteCopyrightYear))
          .replace(/<<sSitelastUpdatedDate>>/g, fsHTMLEncodeEntities(oSite.sSitelastUpdatedDate))
          .replace(/<<sSiteName>>/g, fsHTMLEncodeEntities(oSite.sName))
          .replace(/<<sPageTitle>>/g, fsHTMLEncodeEntities(oSite.sName))
          .replace(/<<sAuthorName>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sName))
          .replace(/<<sAuthorTwitterHandle>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sTwitterHandle))
          .replace(/<<sAuthorGitHubHandle>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sGitHubHandle))
          .replace(/<<sAuthorEmailAddress>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sEmailAddress))
          .replace(/<<sAuthorBitcoin>>/g, fsHTMLEncodeEntities(oSite.oAuthor.sBitcoin))
          .replace(/<<sLicenseDescription>>/g, fsHTMLEncodeEntities(oSite.oLicense.sDescription))
          .replace(/<<sLicenseImageRelativeURL>>/g, fsHTMLEncodeEntities(oSite.oLicense.sImageRelativeURL))
          .replace(/<<sLicenseDetailsAbsoluteURL>>/g, fsHTMLEncodeEntities(oSite.oLicense.sDetailsAbsoluteURL))
          .replace(/<<sSummary>>/g, fsHTMLEncodeEntities(oSite.sSummary))
          .replace(/<<sBaseAbsoluteURL>>/g, fsHTMLEncodeEntities(oSite.sBaseAbsoluteURL))
          .replace(/<<sMainPageRelativeURL>>/g, fsHTMLEncodeEntities(oSite.sMainPageRelativeURL))
          .replace(/<<sBannerImageRelativeURL>>/g, fsHTMLEncodeEntities(sBannerImageRelativeURL))
          .replace(/<<sTwitterAvatarRelativeURL>>/g, fsHTMLEncodeEntities(oSite.sTwitterAvatarRelativeURL))
          .replace(/<<sPageContentHTML>>/g, sPageContentHTML);
  var asFailedSubstitution = sPageHTML.match(/<<.*?>>/);
  if (asFailedSubstitution)
      throw new Error("The substition failed for " + asFailedSubstitution[0] + " in the main page.");
  fWriteFile(oSite.sMainPageHTMLFilePath, fsInsertLineAndWordBreaksInHTML(sPageHTML), fCallback);
};