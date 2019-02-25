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
                        break;
                    case 'reports':
                        console.log('adsfg');
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
        <div class="col mb-2">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <div class="row">
                        <div class="col-sm-5">
                            <h5 class="card-title">${crypto.symbol.toUpperCase()}</h5>
                        </div>
                        <div class="col-sm-4 ml-auto">
                            <button type="button" class="btn btn-sm btn-toggle" data-toggle="button" aria-pressed="false"
                                autocomplete="off">
                                <div class="handle"></div>
                            </button>
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
// https://api.coingecko.com/api/v3/coins/list
// https://api.coingecko.com/api/v3/coins/{id}