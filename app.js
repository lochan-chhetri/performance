const express = require('express');
const request = require('request');
// require('request').debug = true
const app = express();
const sa = require('superagent');


const port = process.env.PORT || 3000;

app.get('/macys/api/discover/v1/search', (req, res) => {
    request({
        //https://www.macys.com/xapi/discover/v1/page?pathname=/shop/featured/shoes&_application=SITE&_navigationType=SEARCH&_deviceType=PC&_shoppingMode=SITE&_regionCode=US&_customerState=GUEST
        // url: 'https://www.macys.com/api/discover/v1/search?keyword=' + req.query.keyword + '&size=small&requestFacets=false&requestProducts=true&pathname=/shop/search&_application=MEW&_deviceType=PHONE&_navigationType=SEARCH&assortment=SITE&_regionCode=US&_customerState=GUEST',
        url: 'https://www.macys.com/xapi/discover/v1/page?pathname=/shop/featured/' + req.query.keyword + '&_application=SITE&_navigationType=SEARCH&_deviceType=PC&_shoppingMode=SITE&_regionCode=US&_customerState=GUEST',
        headers: {
            'Accept': 'application/json',
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
    // request({
    //     url: 'https://zycada-m.macys.com/xapi/discover/v1/page?pathname=/shop/featured/' + req.query.keyword + '&_application=SITE&_navigationType=SEARCH&_deviceType=PC&_shoppingMode=SITE&_regionCode=US&_customerState=GUEST',
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json'
    //     }
    // },
    // function (error, response, body) {
    //     console.log(response.headers);
    //     if(!error && response.statusCode === 200) {
    //         res.json(JSON.parse(body));
    //     } else {
    //         console.log(error);
    //         res.json(error);
    //     }
    // });
    
    sa.get('https://zycada-m.macys.com/xapi/discover/v1/page?pathname=/shop/featured/' + req.query.keyword + '&_application=SITE&_navigationType=SEARCH&_deviceType=PC&_shoppingMode=SITE&_regionCode=US&_customerState=GUEST&X-Zy-UUID=' + req.query['X-Zy-UUID'])
    .set('Accept', 'application/json')
    .end((err, response) => {
        console.log('https://zycada-m.macys.com/xapi/discover/v1/page?pathname=/shop/featured/' + req.query.keyword + '&_application=SITE&_navigationType=SEARCH&_deviceType=PC&_shoppingMode=SITE&_regionCode=US&_customerState=GUEST&X-Zy-UUID=' + req.query['X-Zy-UUID']);
        if(!err && response.statusCode === 200) {
            // console.log(JSON.parse(response.body.body));
            // res.header({Link: response.headers.link})
            res.json(response.body.body);
        } else {
            console.log(err);
            res.json(err);
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