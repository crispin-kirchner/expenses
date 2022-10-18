import * as constants from './constants.js';

const CHF = '302dd3a2-3e84-4b56-ac99-3ddd66b686d7';
const EUR = 'e190e651-a073-449d-b674-8ececd2f096e';
const DKK = 'b1475394-2bfb-4993-a2e5-a4a61d761a6c';

const definitions = {};

definitions[CHF] = {
    displayName: 'CHF',
    isoCode: 'CHF',
    id: CHF
};

definitions[EUR] = {
    displayName: '€',
    isoCode: 'EUR',
    id: EUR
};

definitions[DKK] = {
    displayName: 'kr.',
    isoCode: 'DKK',
    id: DKK
};

function isDefault(currencyId) {
    return currencyId === constants.DEFAULT_CURRENCY;
}

function getDefault() {
    return definitions[constants.DEFAULT_CURRENCY];
}

export { CHF, definitions, isDefault, getDefault };
