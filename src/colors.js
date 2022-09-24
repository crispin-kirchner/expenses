import t from "./texts";

const baseColors = {
    black: {
        name: t('Black'),
        class: 'dark',
        rgb: '33,37,41'
    },
    blue: {
        name: t('Blue'),
        class: 'primary',
        rgb: '13,110,253'
    },
    gray: {
        name: t('Gray'),
        class: 'secondary',
        rgb: '108,117,125'
    },
    turquoise: {
        name: t('Turquoise'),
        class: 'info',
        rgb: '13,202,240'
    },
    yellow: {
        name: t('Yellow'),
        class: 'warning',
        rgb: '255,193,7'
    },
    red: {
        name: t('Red'),
        class: 'danger',
        rgb: '220,53,69'
    },
    green: {
        name: t('Green'),
        class: 'success',
        rgb: '25,135,84'
    },
    white: {
        name: t('White'),
        class: 'light',
        rgb: '248,249,250'
    }
};

const exceptions = [
    'blueGray',
    'blueGreen',
    'grayGreen',
    'greenBlue',
    'greenGray'
];

const all = (() => {
    const result = {};
    for (const bgColorEntry of Object.entries(baseColors)) {
        for (const textColorEntry of Object.entries(baseColors)) {
            if (bgColorEntry[0] === textColorEntry[0]) {
                continue;
            }

            const id = bgColorEntry[0] + textColorEntry[0].charAt(0).toUpperCase() + textColorEntry[0].slice(1);
            if (exceptions.includes(id)) {
                continue;
            }

            result[id] = {
                name: `${bgColorEntry[1].name}-${textColorEntry[1].name}`,
                classes: ['bg-' + bgColorEntry[1].class, 'text-' + textColorEntry[1].class, 'border', 'border-' + textColorEntry[1].class],
                foreground: textColorEntry[1],
                background: bgColorEntry[1]
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

export { all, getClasses, get, baseColors };
