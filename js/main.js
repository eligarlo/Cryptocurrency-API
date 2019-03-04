var coinsToChart = [];

$(document).ready(function () {

    let getCryptoArray = localStorage.getItem('coins');
    let elLoader = $('.loader');

    // Navigate through the different pages
    $('#mainNav li>a').click(function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        $.ajax(`templates/${href}.html`)
            .done(htmlData => {
                $('#mainContent').html(htmlData);
                switch (href) {
                    case 'home':
                        getCryptoCurrencies('mainContent');
                        coinsToChart = [];
                        break;
                    case 'reports':
                        reports();
                        break;
                    case 'about':
                        break;
                    default:
                        break;
                }
            });
    });

    const loader = (arrayCrypto, input, callback) => {
        $('#mainContent').html('');
        elLoader.removeClass('d-none').addClass('d-block');
        setTimeout(() => {
            callback(arrayCrypto, input);
            elLoader.removeClass('d-block').addClass('d-none');
        }, 1500);
    }

    // Event Search Crypto 
    $('#searchCrypto').click(function (e) {
        e.preventDefault();
        const inputSearch = $('#inputSearchCrypto');
        if (inputSearch.val() !== '') {
            if (getCryptoArray) {
                let cryptoArray = JSON.parse(getCryptoArray);
                loader(cryptoArray, inputSearch, filterArray);
            } else {
                $.ajax({
                    url: 'https://api.coingecko.com/api/v3/coins/list',
                    method: 'GET'
                }).done(crypto => {
                    toLocalStorage(crypto);
                    loader(crypto, inputSearch, filterArray);
                });
            }
        }
    });

    let getCryptoCurrencies = (elementID) => {
        if (getCryptoArray) {
            let cryptoArray = JSON.parse(getCryptoArray);
            loader(cryptoArray, elementID, displayCryptoToDom);
            return;
        }
        $.ajax({
            url: 'https://api.coingecko.com/api/v3/coins/list',
            method: 'GET'
        }).done(crypto => {
            toLocalStorage(crypto);
            loader(crypto, elementID, displayCryptoToDom);
        });
    };

    const toLocalStorage = (crypto) => {
        let cryptoToJson = JSON.stringify(crypto);
        localStorage.setItem('coins', cryptoToJson);
    }

    let displayCryptoToDom = (array, elementID) => {
        for (let i = 0; i < array.length; i++) {
            $(`#${elementID}`).append(templateHome(array[i]));
        }
    };

    let filterArray = (array, inputSearch) => {
        const cryptoArray = array;
        let cryptoFilter = cryptoArray.filter(cryptoArray => cryptoArray.id.indexOf(inputSearch.val()) > -1);
        displayCryptoToDom(cryptoFilter, 'mainContent');
        // Clear the input
        inputSearch.val('');
    };
});

function templateHome(crypto) {
    return `
        <div class="pl-sm-0 col mb-2 mx-auto">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-sm-5">
                            <h5 class="card-title">${crypto.symbol.toUpperCase()}</h5>
                        </div>
                        <div class="offset-3 col-sm-4">
                            <label class="switch">
                                <input id="${crypto.symbol}" type="checkbox" onclick="addToChart('${crypto.symbol}')">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>    
                    <p class="card-text">${crypto.name}</p>
                    <button id="more-info${crypto.id}" onclick="moreInfo('more-info${crypto.id}', '${crypto.symbol}','crypto${crypto.id}', '${crypto.id}')" class="btn btn-info toggle mb-2" type="button" data-toggle="collapse" data-target="#crypto${crypto.id}" aria-expanded="false">
                        More Info
                    </button>
                    <div class="collapse" id="crypto${crypto.id}">
                        <div class="card card-body"></div>
                    </div>
                </div>
            </div>
        </div>
    `
}

// More Info Button
function moreInfo(btnId, symbol, elID, cryptoId) {
    let button = document.getElementById(`${btnId}`);
    button.innerHTML = button.innerHTML.includes('More Info') ? 'Less Info' : 'More Info';

    let getSessionStorage = sessionStorage.getItem(symbol);
    if (getSessionStorage) {
        getSessionStorage = JSON.parse(getSessionStorage);
        getMoreInfo(cryptoId, elID, getSessionStorage);
    } else {
        $.ajax(`https://api.coingecko.com/api/v3/coins/${cryptoId}`)
            .done(coindata => {
                let coin = new Coin(coindata['image']['large'], coindata['market_data']['current_price'].usd, coindata['market_data']['current_price'].eur, coindata['market_data']['current_price'].ils)
                getMoreInfo(cryptoId, elID, coin);
                let coinToJson = JSON.stringify(coin);
                sessionStorage.setItem(symbol, coinToJson);
            });
    }
}
// Gets the extra info
function getMoreInfo(cryptoId, elId, coin) {
    var tempMoreInfo = `
        <div class="card">
            <div class="card-header">
                <img class="card-img-top" src="${coin.image}" alt="${cryptoId}">
            </div>
            <div class="card-body">
                <h5 class="card-title">Price:</h5>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">${coin.dollar.toFixed(5)} $</li>
                    <li class="list-group-item">${coin.euro.toFixed(5)} &euro;</li>
                    <li class="list-group-item">${coin.nis.toFixed(5)} &#8362;</li>
                </ul> 
            </div>
        </div>`
    document.getElementById(elId).innerHTML = tempMoreInfo;
}

function Coin(img, usd, eur, ils) {
    this.image = img;
    this.dollar = usd;
    this.euro = eur;
    this.nis = ils;
}

function addToChart(id) {
    let selectedCoin = $(`#${id}`).prop('checked');
    if (coinsToChart.length === 5) {
        let inChart = true;
        for (let i = 0; i < coinsToChart.length; i++) {
            if (coinsToChart[i] === id.toUpperCase()) {
                coinsToChart.splice(i, 1);
                inChart = false;
            } else {
                $('#alert-chart-message').removeClass('d-block').addClass('d-none');
                $(`#${id}`).prop('checked', false);
            }
        }
        if (inChart) {
            $('#alert-chart-message').removeClass('d-none').addClass('d-block');
            $(`#${id}`).prop('checked', false);
        }
    } else if (selectedCoin === true) {
        coinsToChart.push(id.toUpperCase());
    }
    else {
        for (let i = 0; i < coinsToChart.length; i++) {
            if (coinsToChart[i] === id.toUpperCase()) {
                coinsToChart.splice(i, 1);
            }
        }
    }
}

function reports() {
    if (coinsToChart.length === 0) {
        $('#alertChart').removeClass('d-none').addClass('d-block');
    } else {
        const coins = [
            dataCoin1 = [],
            dataCoin2 = [],
            dataCoin3 = [],
            dataCoin4 = [],
            dataCoin5 = [],
        ]
        let chart = new CanvasJS.Chart("chart", {
            animationEnabled: true,
            title: {
                text: 'Live Chart'
            },
            asisX: {
                title: 'Two seconds update chart!'
            },
            axisY: {
                prefix: '$',
                includeZero: false
            },
            tooltip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "top",
                fontSize: 13,
                fontColor: "dimGrey",
                itemclick: toggleDataSeries
            },
            data: []
        });

        for (let i = 0; i < coinsToChart.length; i++) {
            chart.options.data.push({
                type: 'stackedArea',
                showInLegend: true,
                toolTipContent: "<span style=\"color:#4F81BC\"><strong>{name}: </strong></span> {y}",
                xValueType: 'dateTime',
                yValueFormatString: "$####.0000",
                name: coinsToChart[i],
                dataPoints: coins[i]
            })
        }

        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            }
            else {
                e.dataSeries.visible = true;
            }
            chart.render();
        }

        $.ajax(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToChart}&tsyms=USD`)
            .done((data) => {
                price(data);
            });

        function price(data) {
            var values = [
                yValue1 = 0,
                yValue2 = 0,
                yValue3 = 0,
                yValue4 = 0,
                yValue5 = 0,]
            for (let i = 0; i < coinsToChart.length; i++) {
                if (data[`${coinsToChart[i]}`] !== undefined) {
                    var price = data[`${coinsToChart[i]}`]['USD'];
                } else {
                    var price = 0;
                }
                values[i] = price;
            }
        }
        var time = new Date;
        time.getHours();
        time.getMinutes();
        time.getSeconds();
        time.getMilliseconds();
        var yValues = [
            yValue1 = 0,
            yValue2 = 0,
            yValue3 = 0,
            yValue4 = 0,
            yValue5 = 0,
        ]

        function updateChart(count) {
            count = count || 1;
            for (var i = 0; i < count; i++) {
                time.setTime(time.getTime() + 2000);
                $.ajax(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsToChart}&tsyms=USD`)
                    .done((data) => {
                        yPrice(data);
                    });
                function yPrice(data) {
                    for (let i = 0; i < coinsToChart.length; i++) {
                        if (data[`${coinsToChart[i]}`] !== undefined) {
                            var price = data[`${coinsToChart[i]}`]['USD'];
                        } else {
                            var price = 0;
                        }
                        yValues[i] = price;
                    }
                    dataCoin1.push({
                        x: time.getTime(),
                        y: yValues[0]
                    });
                    dataCoin2.push({
                        x: time.getTime(),
                        y: yValues[1]
                    });
                    dataCoin3.push({
                        x: time.getTime(),
                        y: yValues[2]
                    });
                    dataCoin4.push({
                        x: time.getTime(),
                        y: yValues[3]
                    });
                    dataCoin5.push({
                        x: time.getTime(),
                        y: yValues[4]
                    });
                    chart.render();
                }
            }
        }
        updateChart(0);
        setInterval(function () { updateChart() }, 2000);
    }
}