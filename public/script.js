const akImgPrefix = "https://slimages.macysassets.com";
const zyImgPrefix   = "https://zycada-slimages.macysassets.com";

const akUrlPrefix  = "/macys/api/discover/v1/search?keyword=";
const xhrUrlSuffix  = "&size=small&requestFacets=true&requestProducts=true&pathname=/shop/search&_application=MEW&_deviceType=PHONE&_navigationType=SEARCH&assortment=SITE&_regionCode=US&_customerState=GUEST";
const zyUrlPrefix =  "https://zycada-m.macys.com/api/discover/v1/search?keyword="

let akDataArr = [];
let zyDataArr = [];

let zyUnsortedDataArr = [];
let akUnsortedDataArr = [];

let lastKeyword;

let chart_duration;

const akContainer = document.getElementById('akamai');
const zyContainer = document.getElementById('zycada');

const requestXHR = (keyword, vendor) => {

    let xhrUrlPrefix;
    let url;

    if(vendor === 'akamai'){
        url = akUrlPrefix + keyword + xhrUrlSuffix;
    } else if(vendor === 'zycada') {
        url = zyUrlPrefix + keyword + xhrUrlSuffix + '&X-Zy-UUID=' + zyUuid;
    }
        

    fetch(url, {
        method: 'GET'
    })
        .then( response => {
            
            window.setTimeout(() => {
                document.getElementById('searchButton').innerHTML = 'SEARCH';
                document.getElementById('searchButton').disabled = false;    
            }, 500);
            
            
            return response.text();
        })
        .then( text => {
            const data = JSON.parse(text);
            populateVendorArray(data);
            render();
        })
        .catch( error => {
            console.log('Request failed', error);
        });
};

const populateVendorArray = data => {
    
    const collection = data.simpleCanvas[0].sortableGrid.collection;
    // const reducedCollectionSet = collection.slice(0, (collection.length) );

    collection.forEach( item => {
        const file = item.product.imagery.primaryImage.filePath;
        
        const akPath = akImgPrefix + '/is/image/MCY/products/' + file;
        const zyPath = zyImgPrefix + '/is/image/MCY/products/' + file;

        akDataArr.push({name: akPath, vendor: 'akamai'});
        zyDataArr.push({name: zyPath, vendor: 'zycada'});
    });
};

const render = () => {
    
    const unifiedArr = akDataArr.concat(zyDataArr);

    unifiedArr.forEach( (data, index) => {
        const image = new Image();

        image.onload = function () {
            if(data.vendor === 'akamai') {
                akContainer.appendChild(image);
            } else if (data.vendor === 'zycada') {
                zyContainer.appendChild(image);
            }
            if( index == unifiedArr.length - 1 ) {
                window.setTimeout(() => {
                    document.getElementById('metrics').disabled = false;    
                }, 500);
            }
        };
        
        image.src = data.name;

    });
};

const getMetrics = () => {
    const performance = window.performance;
    
    document.getElementById('chartOptions').style.display = 'block';

    const setEntries = item => {
        if(!performance.getEntriesByName(item.name)[0]) {
            throw new Error('Entry not found');
        }
        let duration = performance.getEntriesByName(item.name)[0].duration
        item.duration = Math.round( duration + 0.00001 ) * 100 / 100;
    }

    if(!zyDataArr || !akDataArr) {
        throw new Error('Data array not found');
    }

    zyDataArr.forEach( item => {
        setEntries(item);
    });

    akDataArr.forEach( item => {
        setEntries(item);
    });

    zyUnsortedDataArr = zyDataArr.slice();
    akUnsortedDataArr = akDataArr.slice();

    
    zyDataArr.sort(function (a, b) {
        return a.duration - b.duration;
    });

    akDataArr.sort(function (a, b) {
        return a.duration - b.duration;
    });
    

    setStats();
    draw(zyDataArr, akDataArr);
};

const setStats = () => {

    const akLength = akDataArr.length;
    const zyLength = zyDataArr.length;

    const akDurations = akDataArr.map( item => item.duration);
    const zyDurations = zyDataArr.map( item => item.duration);
    
    const akSum = akDurations.reduce( (acc, current) => acc + current, 0 );
    const zySum = zyDurations.reduce( (acc, current) => acc + current, 0 );

    const totalImages = [akLength, zyLength];
    const min = [akDurations[0], zyDurations[0]];
    const max = [akDurations[akLength-1], zyDurations[zyLength-1]];
    const mean = [(akSum/akLength).toFixed(2), (zySum/zyLength).toFixed(2)];
    const p25 = [akDurations[parseInt(akLength * 25 / 100)], zyDurations[parseInt(zyLength * 25 / 100)]];
    const p50 = [akDurations[parseInt(akLength * 50 / 100)], zyDurations[parseInt(zyLength * 50 / 100)]];
    const p75 = [akDurations[parseInt(akLength * 75 / 100)], zyDurations[parseInt(zyLength * 75 / 100)]];
    const p95 = [akDurations[parseInt(akLength * 95 / 100)], zyDurations[parseInt(zyLength * 95 / 100)]];

if(akLength === zyLength) {
        populateTable(totalImages, min, max, mean, p25, p50, p75, p95);
    } else {
        throw new Error('Length does not match between vendors');
    }

};

const populateTable = (totalImages, min, max, mean, p25, p50, p75, p95) => {

        const longest = (max) ? (max[0] > max[1] ? max[0] : max[1]) : 0;

        if(akDataArr.length) {
            console.log('Sorted Akamai');
            console.log(akDataArr);
        }

        if(zyDataArr.length) {
            console.log('Sorted Zycada');
            console.log('zycada', zyDataArr);
        }
        
        if(akUnsortedDataArr.length) {
            console.log('Unsorted Akamai');
            console.log(akUnsortedDataArr);
        }

        if(zyUnsortedDataArr.length) {
            console.log('Unsorted Zycada');
            console.log(zyUnsortedDataArr);
        }

                
        document.getElementById('total_images').children[1].innerHTML = totalImages ? totalImages[0] : '';
        document.getElementById('total_images').children[2].innerHTML = totalImages ? totalImages[1] : '';

        document.getElementById('min').children[1].innerHTML = min ? min[0] + ' ms' : '';
        document.getElementById('min').children[2].innerHTML = min ? min[1] + ' ms' : '';

        document.getElementById('max').children[1].innerHTML = max ? max[0] + ' ms' : '';
        document.getElementById('max').children[2].innerHTML = max ? max[1] + ' ms' : '';

        document.getElementById('mean').children[1].innerHTML = mean ? mean[0] + ' ms' : '';
        document.getElementById('mean').children[2].innerHTML = mean ? mean[1] + ' ms' : '';

        document.getElementById('p25').children[1].innerHTML = p25 ? getImageThreshold('akamai', longest/4 ) + '%': '';
        document.getElementById('p25').children[2].innerHTML = p25 ? getImageThreshold('zycada', longest/4 ) + '%': '';

        document.getElementById('p50').children[1].innerHTML = p50 ? getImageThreshold('akamai', longest/2 ) + '%': '';
        document.getElementById('p50').children[2].innerHTML = p50 ? getImageThreshold('zycada', longest/2 ) + '%': '';

        document.getElementById('p75').children[1].innerHTML = p75 ? getImageThreshold('akamai', longest/1.333 ) + '%': '';
        document.getElementById('p75').children[2].innerHTML = p75 ? getImageThreshold('zycada', longest/1.333 ) + '%': '';
}

const getImageThreshold = (vendor, threshold) => {
        let count = 0;

        let vendorData;
        if (vendor === 'zycada') {
            vendorData = zyDataArr;
        } else if (vendor === 'akamai') {
            vendorData = akDataArr;
        }

       for(let i = 0; i < vendorData.length; i++) {
         if (vendorData[i].duration >= threshold) {
            count = count + 1;
        }
       }

       const numImagesLoaded = vendorData.length - count;
       const percentage = numImagesLoaded / vendorData.length;
       return (percentage * 100).toFixed(2);
};

const draw = (zyDataArr_scoped, akDataArr_scoped) => {

    const ctx = document.getElementById("chart_duration");
    document.getElementById('table_metrics').style.display = 'block'; 

    let imageCountArr = [], count = 1;


    while(count <= akDataArr_scoped.length ) {
        imageCountArr.push(count);
        count++;
    }

    const akDurations = akDataArr_scoped.map( item => item.duration);
    const zyDurations = zyDataArr_scoped.map( item => item.duration);
    
    chart_duration = new Chart(ctx, {
        type: 'line',
        data: {
         labels: imageCountArr,

         datasets: [
             {
                 data: akDurations,
                 label: 'Akamai',
                 borderColor: '#39937e',
                 fill: false
             },
             {
                 data: zyDurations,
                 label: 'Zycada',
                 borderColor: '#d34554',
                 fill: false
             }
         ]
        },
        options: {
            tooltips: {
                callbacks: {
                    title: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem[0].datasetIndex].label || '';
                        var fullImagePath, imageName;

                        if(label === 'Akamai') {
                            fullImagePath = akDataArr_scoped[tooltipItem[0].index].name.split('/');
                            imageName = fullImagePath[fullImagePath.length-1]
                        }

                        if(label === 'Zycada') {
                            fullImagePath = zyDataArr_scoped[tooltipItem[0].index].name.split('/');
                            imageName = fullImagePath[fullImagePath.length-1]
                        }
                        return imageName;
                    },
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
                        
                        var imgIndex = parseInt(tooltipItem.xLabel);
                        
                        if (label) {
                            label = 'Duration: ';
                        }
            
                        label += tooltipItem.yLabel + ' ms';           
                        label += '\n';
                            
                        return label;
                }
                }
            }
        }
    });
};

document.getElementById('searchForm').addEventListener('submit', evt => {
    evt.preventDefault();

    document.getElementById('searchButton').innerHTML = 'LOADING';
    document.getElementById('searchButton').disabled = true;
    document.getElementById('metrics').disabled = true;
    document.getElementById('chartOptions').style.display = 'none';
    document.getElementById('warning').classList.remove('show');
    
    // clear stale data
    akDataArr = []; // to make sure array is empty
    zyDataArr = [];
    
    populateTable(); // empty call clears the table
    document.getElementById('table_metrics').style.display = 'none'; // hide table

    if( lastKeyword !== document.getElementById('searchText').value) {
        window.performance.clearResourceTimings(); // clear existing numbers
        // document.getElementById('warning').style.display = 'none'
        document.getElementById('warning').classList.remove('show');
    } else {
    //    document.getElementById('warning').style.display = 'block'
       document.getElementById('warning').classList.add('show');
       window.setTimeout( function() { window.location.reload(true); }, 1000 );
    }
    
    lastKeyword = document.getElementById('searchText').value;

    // clear DOM container
    while (akContainer.firstChild) {
        akContainer.removeChild(akContainer.firstChild);
    }
    while (zyContainer.firstChild) {
        zyContainer.removeChild(zyContainer.firstChild);
    }


    if( chart_duration ) {
        chart_duration.destroy();
    }
    
    const keyword = document.getElementById('searchText').value;
    
    if(document.getElementById('radionOptionCurrent').checked) {
        requestXHR(keyword, 'akamai');
    } else if(document.getElementById('radioOptionZycada').checked) {
        loadPhantomAsset(uuidv4());
        requestXHR(keyword, 'zycada');
    }
    
});

const uuidv4 = () => {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
};

const loadPhantomAsset = (uuid) => {
    let img = new Image();
    zyUuid = uuid;
    console.log('OnLoad Zy UUID is ', uuid);
    var hash = 'zycadize';
    
    var ghost_url = zyImgPrefix + "/" + hash + "?X-Zy-UUID=" + uuid;
    
    var container = document.getElementById("bImage");

    img.onload = function () { container.appendChild(img); };
    img.src = ghost_url;
};

window.onload = () => {
    document.getElementById('searchButton').disabled = false;
    const params = getParams();

    if(params.keyword) {

        if(params.server === 'akamai' || !params.server) {
            requestXHR(params.keyword, 'akamai');
        }

        if(params.server === 'zycada') {
            loadPhantomAsset(uuidv4());
            document.getElementById('radioOptionZycada').checked = true;
            requestXHR(params.keyword, 'zycada');
        }

    }
}

const getParams = () => {
    let search = window.location.search;
    let params = {};

    search = search.substr(1);
    let split = search.split('&');

    split.forEach( param => {
        let p = param.split('=');
        params[p[0]] = p[1];
    });

    return {
      keyword: params.keyword,
      server: params.server
    };
};

document.getElementById('metrics').addEventListener('click', getMetrics);

document.getElementById('radioOptionUnsorted').addEventListener('click', () => {
    if( chart_duration ) {
        chart_duration.destroy();
    }

    draw(zyUnsortedDataArr, akUnsortedDataArr);
});

document.getElementById('radionOptionSorted').addEventListener('click', () => {
    if( chart_duration ) {
        chart_duration.destroy();
    }

    draw(zyDataArr, akDataArr);
});