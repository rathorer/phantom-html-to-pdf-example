'use strict';

var Path = require('path');
var fs = require('fs');

const converter = require("phantom-html-to-pdf")({
    /* number of allocated phantomjs processes */
    numberOfWorkers: 2,
    timeout: 10000,
    // portLeftBoundary: 1000,
    // portRightBoundary: 3000,
    host: '127.0.0.1',
	/* use rather dedicated process for every phantom printing
	  dedicated-process strategy is quite slower but can solve some bugs
	  with corporate proxy */
    //strategy: "phantom-server | dedicated-process",
	/* optional path to the phantomjs binary
	   NOTE: When using phantomjs 2.0, be aware of https://github.com/ariya/phantomjs/issues/12685 */
    phantomPath: "node_modules\\phantomjs\\lib\\phantom\\phantomjs.exe",
	/* see phantomjs arguments for proxy setting details 
	proxy,proxy-type,proxy-auth,*/
    /* the collected console.log messages are trimmed by default */
    maxLogEntrySize: 1000
});
function pdfGenerator() {

    return {
        createWithRawHtml: function (html, options, token) {
            //implement it using row html
        },
        createPdf: function (htmlUrl, createHere, token, cb) {
            var customHeaders = token ? [{ Authorization: 'Bearer ' + token }]: [];
            converter({
                url: htmlUrl,
                footer: '<div style="text-align:center">{#pageNum}/{#numPages}</div>',
                // injectJs:[Path.join(__dirname, '../public/bower_components/jquery/dist/jquery.min.js'),
                //      Path.join(__dirname, '../public/dynamic-documents/thePageJS.js')],
                //waitForJS: true,
                printDelay:3000,
                waitForJSVarName: "htmlReadyToBePrinted",
                settings: {
                    javascriptEnabled: true,
                    resourceTimeout:4000
                },
                customHeaders: customHeaders,
                format: {
                    quality: 100
                }
            }, function (err, pdf) {
                if (err) {
                    console.error('Error while printing pdf.', err);
                    return cb({status:false, err:err});
                }
                console.log(pdf.logs);
                console.log(pdf.numberOfPages);
                //pdf.stream.pipe(res);
                var filePath = fs.createWriteStream(createHere);
                pdf.stream.pipe(filePath);
                return cb({status:true, pages:pdf.numberOfPages});
            });
        }
    }
}
module.exports = pdfGenerator();