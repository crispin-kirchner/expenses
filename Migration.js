function migrate(loadedData) {
    if (!loadedData.categories.length || loadedData.categories[0].parent) {
        return [false, loadedData];
    }

    // add misc parent to all categories
    loadedData.categories.forEach(category => category.parent = 'Andere');

    return [true, loadedData];
}

export { migrate };
