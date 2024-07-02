import { readdir, readFile } from 'fs/promises';

const dirMonthRegex = /[0-9]{4}/;
const journalRegex = /[0-9]{4}\.html/;
const dateRegex = {
  date: /b(l|L)og ?#([0-9]{6}.([0-9]{4}|xxxx|[0-9]{2}h[0-9]{2}))/,
};

function getDate(entry) {
  const date = entry.match(dateRegex.date)[2];

  const year = `20${date.slice(0, 2)}`;
  const month = date.slice(2, 4);
  const day = date.slice(4, 6);
  const thisDate = `${year}-${month}-${day}`;

  const time = date.slice(7, 9) === 'xx'
    ? ''
    : `${date.slice(7, 9)}:${date.slice(9, 11)}:00 -07:00`;

  const isoDate = `${thisDate} ${time}`;
  return isoDate;
}

async function getJournalData() {
  const journalData = [];
  const months = await readdir('/Users/travishorton/blog');

  for (let i = 0; i < months.length; i += 1) {
    const daysInThisMonth = months[i].match(dirMonthRegex)
      ? await readdir(`/Users/travishorton/blog/${months[i]}/`)
      : null;

    if (months[i].match(dirMonthRegex)) {
      for (let j = 0; j < daysInThisMonth.length; j += 1) {
        // get Date
        const date = `/Users/travishorton/blog/${months[i]}/${daysInThisMonth[j]}`;
        const dayText = daysInThisMonth[j].match(journalRegex)
          ? await readFile(date, 'utf8')
          : null;
        if (dayText?.match(dateRegex.date)) {
          const thisDay = {};
          if (Number.isNaN(Date.parse(getDate(dayText)))) {
          } else {
            thisDay.date = Date.parse(getDate(dayText));
          }

          // add sex
          const sexRegex = /(>| )(S|s): ?[0-9]/;
          if (dayText.match(sexRegex)) {
            thisDay.s = dayText.match(sexRegex)[0].slice(-1);
          }

          // add mental health
          const feltRegex = /how (i|I) felt: ?(\d\.?\d?)/;
          if (dayText.match(feltRegex)) {
            thisDay.mental_health = dayText.match(feltRegex)[2]
          }

          journalData.push(thisDay);
        } else {
        }
      }
    }
  }

  return journalData;
}

let fileContents = 'const journalData = ';
fileContents += JSON.stringify(await getJournalData());
fileContents += '\n\n export default journalData;';

console.log(fileContents);
/*
writeFile(
  '/Users/travishorton/www/src/pages/Journal/journal_data.js',
  JSON.stringify(fileContents),
  (err) => {
    if (err) console.log(err);
  },
);
*/
