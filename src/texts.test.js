import * as texts from './texts.js';

function getSupportedLanguages() {
    const supportedLanguages = texts.getSupportedLocales()
        .map(texts.getLanguage);
    return [...new Set(supportedLanguages)];
}

it('removes unknown languages and uses english as default', () => {
    expect(texts.computeLocales(['tl'])).toEqual(['en']);
});

it('always adds the plain language to the search order', () => {
    expect(texts.computeLocales(['de-CH', 'de-DE', 'en'])).toEqual(['de-CH', 'de', 'en']);
});

it('knows what to do with really many locales in random orders', () => {
    expect(texts.computeLocales(['de-CH', 'en-GB', 'de-DE', 'en-US'])).toEqual(['de-CH', 'de', 'en-GB', 'en']);
});

it('has a text for each key', () => {
    for (const language of texts.getSupportedLocales()) {
        for (const entry of Object.entries(texts.texts[language])) {
            expect(entry[1]).toBeTruthy();
        }
    }
});

it('has the same texts in each language as in english', () => {
    const supportedLanguages = getSupportedLanguages()
        .filter(el => el !== 'en');

    const englishKeys = Object.keys(texts.texts.en);

    for (const language of supportedLanguages) {
        const languageTexts = texts.texts[language];

        expect(Object.keys(languageTexts)).toEqual(englishKeys);
    }
});

test('all texts of all locales exist in english', () => {
    const supportedLanguages = getSupportedLanguages();

    const locales = texts.getSupportedLocales()
        .filter(item => !supportedLanguages.includes(item));

    for (const locale of locales) {
        expect(Object.keys(texts.texts.en)).toEqual(expect.arrayContaining(Object.keys(texts.texts[locale])));
    }
});

it('has the same placeholders in each language as in english', () => {
    for (const entry of Object.entries(texts.texts.en)) {
        const englishMatches = entry[1].match(texts.placeholderRegex);
        if (!englishMatches) {
            continue;
        }
        const key = entry[0];
        for (const localeTexts of Object.values(texts.texts)) {
            const localeText = localeTexts[key];
            if (!localeText) {
                continue;
            }
            const localeMatches = localeText.match(texts.placeholderRegex);
            expect(localeMatches).toBeTruthy();
            expect(localeMatches.length).toBe(englishMatches.length);
        }
    }
});
