let formTagify, searchTagify;
let allTags = [];

function initializeTagify() {
    if (typeof Tagify === 'undefined') {
        console.error('Tagify is not loaded. Please ensure it is properly included in your HTML.');
        return;
    }

    const tagifySettings = {
        whitelist: allTags,
        dropdown: {
            maxItems: 20,
            classname: "tags-look",
            enabled: 0,
            closeOnSelect: false
        },
        sort: (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()) // Sort suggestions alphabetically
    };

    const formTagInput = document.getElementById('formTags');
    if (formTagInput) {
        formTagify = new Tagify(formTagInput, tagifySettings);
    }

    const searchTagInput = document.getElementById('tagSearch');
    if (searchTagInput) {
        searchTagify = new Tagify(searchTagInput, tagifySettings);
    }
}

function updateTagWhitelist(allGrooves) {
    allTags = [...new Set(allGrooves.flatMap(groove => groove.tags || []))];
    allTags.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Sort tags alphabetically
    if (formTagify) formTagify.settings.whitelist = allTags;
    if (searchTagify) searchTagify.settings.whitelist = allTags;
}

function getFormTags() {
    return formTagify ? formTagify.value.map(tag => tag.value) : [];
}

function getSearchTags() {
    return searchTagify ? searchTagify.value.map(tag => tag.value.toLowerCase()) : [];
}

function addTagListeners(callback) {
    if (searchTagify) {
        searchTagify.on('add', callback);
        searchTagify.on('remove', callback);
    }
}

export { initializeTagify, updateTagWhitelist, getFormTags, getSearchTags, addTagListeners, searchTagify };
