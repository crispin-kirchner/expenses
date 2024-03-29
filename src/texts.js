const texts = {
    "de": {
        "Amount": "Betrag",
        "and": "und",
        "Beneficiary": "Empfänger:in",
        "Black": "Schwarz",
        "Blue": "Blau",
        "Calendar": "Kalender",
        "Chart": "Diagramm",
        "Color": "Farbe",
        "Currency": "Währung",
        "Date": "Datum",
        "Delete": "Löschen",
        "DeleteConfirmation": "Bist du sicher, dass du {0} löschen möchtest?",
        "Description": "Beschreibung",
        "Earning": "Einnahme",
        "Earnings": "Einnahmen",
        "Edit": "Bearbeiten",
        "EditTags": "Tags bearbeiten",
        "End": "Ende",
        "ExchangeRate": "Wechselkurs",
        "Expense": "Ausgabe",
        "Expenses": "Ausgaben",
        "Gray": "Grau",
        "Green": "Grün",
        "Monthly": "Monatlich",
        "New": "Neu",
        "Overview": "Übersicht",
        "Parent": "Übergeordnet",
        "Payer": "Zahler:in",
        "PleaseFillX": "Bitte {0} ausfüllen",
        "Recurring": "Wiederkehrend",
        "Red": "Rot",
        "Remaining": "Verbleibend",
        "Save": "Speichern",
        "Search": "Suchen",
        "Start": "Start",
        "ThisEarning": "diese Einnahme",
        "ThisExpense": "diese Ausgabe",
        "Today": "Heute",
        "Turquoise": "Türkis",
        "Type": "Typ",
        "White": "Weiß",
        "Yearly": "Jährlich",
        "Yellow": "Gelb",
    },
    "de-CH": {
        "White": "Weiss",
    },
    "nl": {
        "Amount": "Bedrag",
        "and": "en",
        "Beneficiary": "Ontvanger",
        "Black": "Zwart",
        "Blue": "Blauw",
        "Calendar": "Kalender",
        "Chart": "Diagram",
        "Color": "Kleur",
        "Currency": "Munt",
        "Date": "Datum",
        "Delete": "Wissen",
        "DeleteConfirmation": "Ben je zeker, dat je {0} wilt wissen?",
        "Description": "Beschrijving",
        "Earning": "Inkomst",
        "Earnings": "Inkomsten",
        "Edit": "Bewerken",
        "EditTags": "Tags bewerken",
        "End": "Eind",
        "ExchangeRate": "Wisselkoers",
        "Expense": "Besteding",
        "Expenses": "Bestedingen",
        "Gray": "Grijs",
        "Green": "Groen",
        "Monthly": "Maandelijk",
        "New": "Nieuw",
        "Overview": "Overzicht",
        "Parent": "Ouder",
        "Payer": "Betaler",
        "PleaseFillX": "Alsjeblieft {0} invullen",
        "Recurring": "Herhalend",
        "Red": "Rood",
        "Remaining": "Verblijvend",
        "Save": "Opslaan",
        "Search": "Zoeken",
        "Start": "Begin",
        "ThisEarning": "deze inkomst",
        "ThisExpense": "deze besteding",
        "Today": "Vandaag",
        "Turquoise": "Turquoise",
        "Type": "Type",
        "White": "Wit",
        "Yearly": "Jaarlijks",
        "Yellow": "Geel",
    },
    "en": {
        "Amount": "Amount",
        "and": "and",
        "Beneficiary": "Beneficiary",
        "Black": "Black",
        "Blue": "Blue",
        "Calendar": "Calendar",
        "Chart": "Chart",
        "Color": "Color",
        "Currency": "Currency",
        "Date": "Date",
        "Delete": "Delete",
        "DeleteConfirmation": "Are you sure that you want to delete {0}?",
        "Description": "Description",
        "Earning": "Earning",
        "Earnings": "Earnings",
        "Edit": "Edit",
        "EditTags": "Edit tags",
        "End": "End",
        "ExchangeRate": "Exchange rate",
        "Expense": "Expense",
        "Expenses": "Expenses",
        "Gray": "Gray",
        "Green": "Green",
        "Monthly": "Monthly",
        "New": "New",
        "Overview": "Overview",
        "Parent": "Parent",
        "Payer": "Payer",
        "PleaseFillX": "Please fill {0}",
        "Recurring": "Recurring",
        "Red": "Red",
        "Remaining": "Remaining",
        "Save": "Save",
        "Search": "Search",
        "Start": "Start",
        "ThisEarning": "this earning",
        "ThisExpense": "this expense",
        "Today": "Today",
        "Turquoise": "Turquoise",
        "Type": "Type",
        "White": "White",
        "Yearly": "Yearly",
        "Yellow": "Yellow",
    },
    "en-GB": {
        "Color": "Colour",
        "Gray": "Grey"
    }
}

const languages = computeLocales(navigator.languages);

const placeholderRegex = /\{(\d+)\}/g;

function t(key) {
    for (const locale of languages) {
        const text = texts[locale]?.[key];
        if (text) {
            return text.replaceAll(placeholderRegex, (_, index) => arguments[Number(index) + 1]);
        }
    }
    return `Undefined text {${key}}`;
}

function getLanguage(locale) {
    return locale.match(/[a-z]+/)[0];
}

function getSupportedLocales() {
    return Object.keys(texts);
}

function computeLocales(inputLocales) {
    const supportedLocales = getSupportedLocales();
    const appLocales = [];
    let previousLanguage = getLanguage(inputLocales[0]);
    for (const locale of inputLocales) {
        const language = getLanguage(locale);
        if (previousLanguage !== language && !appLocales.includes(previousLanguage)) {
            appLocales.push(previousLanguage);
        }
        previousLanguage = language;

        if (supportedLocales.includes(locale) && !appLocales.includes(locale)) {
            appLocales.push(locale);
        }
    }
    if (supportedLocales.includes(previousLanguage) && !appLocales.includes(previousLanguage)) {
        appLocales.push(previousLanguage);
    }

    // English as fallback
    if (!appLocales.includes('en')) {
        appLocales.push('en');
    }
    return appLocales;
}

export default t;
export { languages, computeLocales, getLanguage, texts, placeholderRegex, getSupportedLocales };
