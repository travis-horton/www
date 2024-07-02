const fs = require('fs');

const dirMonthRegex = new RegExp('[0-9]{4}');
const journalRegex = new RegExp('[0-9]{4}\.html');
const dateRegex = {
  date: new RegExp('b(l|L)og ?\#([0-9]{6}\.([0-9]{4}|xxxx|[0-9]{2}h[0-9]{2}))'),
};

const getDate = (entry) => {
  const date=entry.match(dateRegex.date)[2];
  const year = "20" + date.slice(0,2);
  const month = date.slice(2,4);
  const day = date.slice(4,6);
  const thisDate = year + "-" + month + "-" + day;
  const time = date.slice(7, 9) === "xx"
    ? "00:00:00 -07:00"
    : date.slice(7, 9) + ":" + date.slice(9, 11) + ":00 -07:00";
  let isoDate = thisDate + " " + time;
  return isoDate;
}

fs.readdir('/Users/travishorton/blog', (err, months) => {
  if (err) {
    console.error(err);
    return;
  }
  for (let i=0; i < months.length; i++) {
    if (months[i].match(dirMonthRegex)) {
      fs.readdir('/Users/travishorton/blog/' + months[i] + '/', (err, days) => {
        if (err) {
          console.log(err);
          return;
        }
        for (let j=0; j < days.length; j++) {
          let date =
            '/Users/travishorton/blog/' + months[i]
            + '/' +
            days[j];

          if (days[j].match(journalRegex)) {
            fs.readFile(date, 'utf8' , (err, data) => {
              if (err) {
                console.error(err);
                return;
              }
              if (data.match(dateRegex.date)) {
                console.log(getDate(data));
              } else {
                console.log(days[j]);
              }
            })
          }
        }
      });
    }
  }
});
