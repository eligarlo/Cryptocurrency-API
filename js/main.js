$(document).ready(function () {

    window.getCryptoArray = [];

    let getCryptoCurrencies = (elementID) => {
        if (window.getCryptoArray.length > 0) {
            displayCryptoToDom(window.getCryptoArray, elementID);
            return;
        }
        $.ajax({
            url: 'https://api.coingecko.com/api/v3/coins/list',
            method: 'GET'
        }).done(crypto => {
            window.getCryptoArray = crypto;
            displayCryptoToDom(crypto, elementID);
        });
    };

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

    // Navigate through the different pages
    $('#mainNav li>a').click(function (e) {
        e.preventDefault();
        const href = $(this).attr('href');
        $.ajax(`templates/${href}.html`)
            .done(htmlData => {
                $('#mainContent').html(htmlData);
                switch (href) {
                    case 'home':
                        getCryptoCurrencies('home-API-list');
                        break;
                    default:
                        break;
                }
            });
    });

    // Event Search Crypto 
    $('#searchCrypto').click(function (e) {
        e.preventDefault();
        const inputSearch = $('#inputSearchCrypto');
        if (inputSearch.val() !== '') {
            if (window.getCryptoArray.length > 0) {
                $('#mainContent').html('');
                filterArray(window.getCryptoArray, inputSearch);
                return;
            }
            $.ajax({
                url: 'https://api.coingecko.com/api/v3/coins/list',
                method: 'GET'
            }).done(crypto => {
                $('#mainContent').html('');
                filterArray(crypto, inputSearch);
            });
        }
    });
});

function templateHome(crypto) {
    return `
        <div class="col mb-2">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <h5 class="card-title">${crypto.symbol.toUpperCase()}</h5>
                    <p class="card-text">${crypto.name}</p>
                    <button class="btn btn-primary toggle" type="button" data-toggle="collapse" data-target="#crypto${crypto.id}" aria-expanded="false">
                        More Info
                    </button>
                    <div class="collapse" id="crypto${crypto.id}">
                        <div class="card card-body">
                            esciunt sapiente ea proident.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

// https://api.coingecko.com/api/v3/coins/list