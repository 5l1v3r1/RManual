const request = require('request');
const htmlparser = require('htmlparser2');
const mongoose = require('mongoose');

const Manual = mongoose.model('manuals');

const CRAN_URL = 'https://cran.r-project.org/manuals.html';
const BASE_URL = 'https://cran.r-project.org/';
const docHtmlRegex = /doc\/manuals\/r-release\/(.*)\.html/g;

const parser = new htmlparser.Parser({
  onopentag(name, attribs) {
    const url = docHtmlRegex.exec(attribs.href);
    if (name === 'a' && url !== null) {
      const docName = url[1];
      Manual.update(
        {
          name: docName,
        },
        {
          name: docName,
          url: BASE_URL + attribs.href,
        },
        {
          upsert: true,
        },
        (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log(`${attribs.href} saved!`);
          }
        },
      );
    }
  },
}, { decodeEntities: true });

const findCranHTMLFiles = () => {
  request(CRAN_URL, (error, response, body) => {
    if (error || response.statusCode !== 200) return 'Looks like something wrong. Please check URL.';
    parser.write(body);
    return parser.end();
  });
};

module.exports = findCranHTMLFiles;
