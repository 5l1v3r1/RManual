const syncRequest = require("sync-request")
const request = require("request")
const express = require('express');
const mongoose = require('mongoose');
const TurndownService = require('../turndown');
const fs = require('fs');
const _ = require("lodash")
var tables = require('turndown-plugin-gfm').tables
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();

const REPLACE_REGEX = /^\s?> /


const turndownService = new TurndownService({ linkStyle: 'referenced' });

turndownService.keep(["pre"])


turndownService.addRule('image', {
  filter: ['img'],
  replacement() {
    return '';
  },
});
turndownService.remove((node, opt) => {
    if (node.nodeName == 'DIV') {
      return node.getAttribute('class') == 'contents' || node.getAttribute('class') == 'header'; 
    }else if(node.nodeName == 'A') {
      return node.getAttribute('class') == 'summary-letter';
    }
  }
);
turndownService.addRule('title', {
  /*filter: (node, opt) => {
    return true;
  }, */
  filter: (node, opt) => {
    return node.nodeName == 'TITLE';
  },

  replacement(content) {
    return '';
  },
});
/* Title ve settitle kaldırılacak */
turndownService.addRule('settitle', {
  /*filter: (node, opt) => {
    return true;
  }, */
  filter: (node, opt) => {
    return node.nodeName == 'H1' && node.getAttribute('class') == 'settitle';
  },

  replacement(content) {
    let regex = /^(.*)/;
    return content.replace(regex,'\n---\ntitle: '+content+'  \noutput:\n html_notebook:\n   theme: united\n   highlight: tango\n   toc: true\n   toc_float:\n    collapsed: true\n    smooth_scroll: true\n toc_depth: 5\n---')
    
  },
});


turndownService.addRule('rCode', {
 /* filter: (node, opt) => {
    return node.nodeName == 'P' && node.getAttribute('class') == 'ownPre';
  }, */
  filter: ['pre'],
  replacement(content) {

    regex = />\s*q\(\)|>\ssource\W.*|>\ssink\W.*/g; // eval=FALSE regex.
    if(regex.test(content)) {
      return `\`\`\`{r eval=FALSE}\n${content.replace(/\>|\\(?!n)/g, '')}\`\`\``;
    }

    var lines = content.split("\n")
      .map(line => line./*trim().*/replace(REPLACE_REGEX, ""))
      .filter(line => !!line)

    var { result, code } = parseCode(lines)

    console.log("CODE:")
    console.log(code.join("\n"))
    console.log("RESULT:")
    console.log(result.join("\n"))

    //console.log("```{r}"+ code.join("\n") +"```")
    if(code.length){
      // console.log(code.join("\n"))
      return "```{r}\n"+ code.join("\n") +"\n```"
    }

    /*
    regex = /> (.*)/g;   // 
    if (regex.test(content)) {
   return `\`\`\`{r}\n${content.replace(/^.*?>|\\(?!n)/g, '')\`\`\``;
    
    */
    regex = /[$]\s*R|[$]\smkdir\swork|[$]\scd\swork/g;
    if(regex.test(content)){
      return `\`\`\`{bash eval=FALSE}\n${content.replace(/[$](?!n)/g, '')}\`\`\``;
    }
    regex = /([$])(.*)/g; // $ varsa silen regex
    if (!regex.test(content)) return content;
    return `\`\`\`{bash}\n${content.replace(/[$](?!n)/g, '')}\`\`\`\``; 

  },
});
turndownService.use([tables]);  
turndownService.addRule('Table', {
  filter: ['table'],
  replacement(content, node) {
      if(node.className=='menu'){
        return ``;
      }/*else if(node.className=='index-vr'){
        return ``;
      } else if(node.className=='index-cp'){
        return ``; } */
      return content;
  },
}); 
const router = express.Router();
const Manual = mongoose.model('manuals');

router.get('/', (req, res) => {
  Manual.find({}, (err, manuals) => {
    if (err) return res.sendStatus(500);
    return res.render('manual', { title: 'R Manual', manuals });
  });
});


router.get('/:documentName', (req, res) => {
  Manual.findOne({ name: req.params.documentName }, (err, manual) => {
    if (err) return res.sendStatus(500);
    request(manual.url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return 'Looks like something wrong. Please check URL.';
      }
      
      const markdown = turndownService
        .remove(['script', 'style', ''])
        .turndown(entities.decode(body));

      res.set({ 'Content-Disposition': `attachment; filename=${req.params.documentName}.Rmd` });
      return res.send(markdown);
    });
  });
});

module.exports = router;

function parseCode(code = [], result = []) {
// 
  
  var response = syncRequest("POST", "POST ADRESS", {
    headers: { "content-type": "application/json" },
    json: { text: '"' + code.join("\n").replace(/"/g, '\\"') + '"' }
  })

  var valid = true

  try {
    JSON.parse(response.getBody("utf8"))
  } catch(e) {
    valid = false
  }
 
  // if (response.statusCode > 200) {
  if ( ! valid ) {
    result.unshift( code.splice(code.length - 1, 1)[0] )

    if (code.length) {
      return parseCode(code, result)
    }
  }

  return { code, result }
}
