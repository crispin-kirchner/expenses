const baseColors = [
    {
        id: 'black',
        name: 'Schwarz',
        class: 'dark'
    },
    {
        id: 'blue',
        name: 'Blau',
        class: 'primary'
    },
    {
        id: 'gray',
        name: 'Grau',
        class: 'secondary'
    },
    {
        id: 'turquoise',
        name: 'Türkis',
        class: 'info'
    },
    {
        id: 'yellow',
        name: 'Gelb',
        class: 'warning'
    },
    {
        id: 'red',
        name: 'Rot',
        class: 'danger'
    },
    {
        id: 'green',
        name: 'Grün',
        class: 'success'
    },
    {
        id: 'white',
        name: 'Weiss',
        class: 'light'
    }
];

const exceptions = [
    'blueGray',
    'blueGreen',
    'grayGreen',
    'greenBlue',
    'greenGray'
];

const all = (() => {
    const result = {};
    for (const bgColor of baseColors) {
        for (const textColor of baseColors) {
            if (bgColor.id === textColor.id) {
                continue;
            }

            const id = bgColor.id + textColor.id.charAt(0).toUpperCase() + textColor.id.slice(1);
            if (exceptions.includes(id)) {
                continue;
            }

            result[id] = {
                name: `${bgColor.name}-${textColor.name}`,
                classes: ['bg-' + bgColor.class, 'text-' + textColor.class, 'border', 'border-' + textColor.class]
            };
        }
    }

    return result;
})();

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
