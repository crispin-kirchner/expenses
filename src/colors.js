const baseColors = [
    {
        id: 'black',
        name: 'Schwarz',
        class: 'dark',
        rgb: '33,37,41'
    },
    {
        id: 'blue',
        name: 'Blau',
        class: 'primary',
        rgb: '13,110,253'
    },
    {
        id: 'gray',
        name: 'Grau',
        class: 'secondary',
        rgb: '108,117,125'
    },
    {
        id: 'turquoise',
        name: 'Türkis',
        class: 'info',
        rgb: '13,202,240'
    },
    {
        id: 'yellow',
        name: 'Gelb',
        class: 'warning',
        rgb: '255,193,7'
    },
    {
        id: 'red',
        name: 'Rot',
        class: 'danger',
        rgb: '220,53,69'
    },
    {
        id: 'green',
        name: 'Grün',
        class: 'success',
        rgb: '25,135,84'
    },
    {
        id: 'white',
        name: 'Weiss',
        class: 'light',
        rgb: '248,249,250'
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
                classes: ['bg-' + bgColor.class, 'text-' + textColor.class, 'border', 'border-' + textColor.class],
                foreground: textColor,
                background: bgColor
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
