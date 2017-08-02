var express = require('express'),
    app = express(),
    root = __dirname,
    url = require('url'),
    Path = require('path'),
    proxy = require('proxy-middleware'),
    server = require('http').createServer(app),
    fs = require('fs'),
    pdfGenerator = require('./pdfGenerator');
var agreementFolder = '../agreements';

var getAgreementDir = function () {
    var agreementDir = Path.join(root, agreementFolder);
    if (!fs.existsSync(agreementDir)) {
        fs.mkdirSync(agreementDir);
    }
    return agreementDir;
};

app.use(function (req, res, next) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    next();
});
app.get('/', function (req, res, next) {
    res.sendFile(root + '/index.html');
});
app.get('/pdfgenerated', function (req, res, next) {
    res.sendFile(root + '/pdfgenerated.html');
});
app.get('/:id([a-z0-9a-z]+)', function (req, res, next) {
    var userId = req.params.id,
        userToken = null;
    var callback = function (result) {
        if (result.status) {
            res.redirect('/pdfgenerated?msg=' + userId + '.pdf&pages=' + result.pages);
        } else {
            res.redirect('/pdfgenerated.html?msg=' + result.err.toString());
        }
    };
    pdfGenerator.createPdf('http://localhost:' + port + '/agreement.html?id=' + userId,
        Path.join(getAgreementDir(), userId + '.pdf'), userToken, callback);
});
app.use(express.static(root));
var port = process.env.PORT || 3000;
server.listen(port, function (err) {
    if (!err) {
        console.log('Listening at port:', port);
    }
});


