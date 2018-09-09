/**
 * Created by pavlo.halan on 9/8/2018.
 */

const express = require('express');
const fs = require('fs');
const app = express();


app.get('/layout', function (req, res) {
    fs.readFile('./LandingPage.json', 'utf8', function (err, data) {
        if (err) throw err;
        res.send(data);
    });
});

app.use('/', express.static('./LayoutPanel/LayoutPanel/'));


app.listen(3000, () => console.log('Example app listening on port 3000!'));