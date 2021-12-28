const all = {
    blue: {
        name: 'Blau',
        classes: ['bg-primary', 'text-light']
    },
    green: {
        name: 'Grün',
        classes: ['bg-success', 'text-light']
    },
    white: {
        name: 'Weiss',
        classes: ['bg-light', 'text-dark', 'border']
    },
    yellow: {
        name: 'Gelb',
        classes: ['bg-warning', 'text-dark']
    },
    black: {
        name: 'Schwarz',
        classes: ['bg-dark', 'text-light', 'border']
    },
    red: {
        name: 'Rot',
        classes: ['bg-danger', 'text-light']
    },
    turquoise: {
        name: 'Türkis',
        classes: ['bg-info', 'text-light']
    },
    gray: {
        name: 'Grau',
        classes: ['bg-secondary', 'text-light']
    }
};

function getClasses(color) {
    if (typeof color === 'string') {
        color = get(color);
    }
    if (!color) {
        return '';
    }
    return color.classes;
}

function get(colorName) {
    return all[colorName];
}

export { all, getClasses, get };
