import { MONTH_DISPLAY } from "../enums/ViewMode";

function isSubCent(amount) {
    return Math.abs(amount) < 0.005;
}

function isNewButtonVisible(viewMode) {
    return viewMode === MONTH_DISPLAY;
}

export { isNewButtonVisible, isSubCent };
