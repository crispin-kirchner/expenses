const CHF = '302dd3a2-3e84-4b56-ac99-3ddd66b686d7';
const EUR = 'e190e651-a073-449d-b674-8ececd2f096e';
const DKK = 'b1475394-2bfb-4993-a2e5-a4a61d761a6c';

const DEFAULT_CURRENCY = CHF;
const DEFAULT_EXCHANGE_RATE = '1.00000';

const currencies = {};

currencies[CHF] = {
    displayName: 'CHF',
    isoCode: 'CHF',
    id: CHF
};

currencies[EUR] = {
    displayName: '€',
    isoCode: 'EUR',
    id: EUR
};

currencies[DKK] = {
    displayName: 'kr.',
    isoCode: 'DKK',
    id: DKK
};

function isDefaultCurrency(currencyId) {
    return currencyId === DEFAULT_CURRENCY;
}

function getDefaultCurrency() {
    return currencies[DEFAULT_CURRENCY];
}

export default currencies;
export { isDefaultCurrency, getDefaultCurrency, DEFAULT_EXCHANGE_RATE };
