module.exports = fsDate;

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
asDayPostfix = [
  "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th",
  "th", "th", "th", "th", "th", "th", "th", "th", "th", "th",
  "st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th",
  "th",
];

function fsDate(uYear, uMonth, uDay) {
  if (uDay === undefined) {
    return asMonths[uMonth - 1] + " " + uYear;
  };
  return asMonths[uMonth - 1] + " " + uDay + asDayPostfix[uDay - 1] + ", " + uYear;
};
