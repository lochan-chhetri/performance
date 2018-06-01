const express = require('express');
const request = require('request');
// require('request').debug = true
const app = express();


const port = process.env.PORT || 3000;

app.get('/macys/api/discover/v1/search', (req, res) => {
    request({
        url: 'https://origin-api.macys.com/discover/v1/search?keyword=' + req.query.keyword + '&size=small&requestFacets=false&requestProducts=true&pathname=/shop/search&_application=MEW&_deviceType=PHONE&_navigationType=SEARCH&assortment=SITE&_regionCode=US&_customerState=GUEST',
        headers: {
            'Accept': 'application/json',
            'x-macys-webservice-client-id': 'wzuuhtwrrpegszaehcu6ey2n',
            'Content-Type': 'application/json',
        }
    },
    function (error, response, body) {
        if(!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            console.log(error);
            res.json(error);
        }
    });
});

app.get('/zycada/api/discover/v1/search', (req, res) => {
    request({
        url: 'https://zycada-m.macys.com/api/discover/v1/search?keyword=' + req.query.keyword + '&size=small&requestFacets=false&requestProducts=true&pathname=/shop/search&_application=MEW&_deviceType=PHONE&_navigationType=SEARCH&assortment=SITE&_regionCode=US&_customerState=GUEST',
        headers: {
            'Accept': 'application/json',
            // 'x-macys-webservice-client-id': 'wzuuhtwrrpegszaehcu6ey2n',
            'Content-Type': 'application/json',
        }
    },
    function (error, response, body) {
        if(!error && response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            console.log(error);
            res.json(error);
        }
    });
});

app.get('/macys-image/*', (req, res) => {
    var url = 'https://slimages.macysassets.com/' + req.params[0];
    request.get(url).pipe(res);
});

app.get('/zycada-image/*', (req, res) => {
    var url = 'https://zycada-slimages.macysassets.com/' + req.params[0];
    request.get(url).pipe(res);
});


app.use(express.static('public'));

app.listen(port, () => console.log('App listening on port!' + port));