const express = require('express');
const request = require('request');
require('request').debug = true
const app = express();


const port = process.env.PORT || 3000;

app.get('/macys/api/discover/v1/search', (req, res) => {
    request({
        url: 'https://api.macys.com/discover/v1/search?keyword=' + req.query.keyword + '&size=small&requestFacets=true&requestProducts=true&pathname=/shop/search&_application=MEW&_deviceType=PHONE&_navigationType=SEARCH&assortment=SITE&_regionCode=US&_customerState=GUEST',
        headers: {
            'Accept': 'application/json',
            'x-macys-webservice-client-id': 'wzuuhtwrrpegszaehcu6ey2n',
            'Content-Type': 'application/json',
        }
    },
    function (error, response, body) {
            console.log('******** response ********')
            console.log(response);
            console.log('******** END response ********')

        if(!error && response.statusCode === 200) {
            console.log('******** response body ********')
            console.log(body);
            console.log('******** END response body ********')
            res.json(JSON.parse(body));
        } else {
            console.log(error);
            res.json(error);
        }
    });
});

app.use(express.static('public'));

app.listen(port, () => console.log('App listening on port!' + port));