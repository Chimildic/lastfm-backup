function saveHistory(params) {
    params.method = Lastfm.getRecentTracks;
    params.type = 'recenttracks';
    params.filename = 'lastfm-backup';
    createBackup_(params);
}

function saveLoved(params) {
    params.method = Lastfm.getLovedTracks;
    params.type = 'lovedtracks';
    params.filename = 'lastfm-backup-loved';
    createBackup_(params);
}

function createBackup_(params) {
    let countPages = Lastfm.getCountPages(USERNAME, params.type);
    if (countPages == 0) {
        console.info(`No pages for type ${params.type}`);
        return;
    }

    let pages = params.method(USERNAME, countPages);

    if (params.hasOwnProperty('json') && params.json) {
        let jsonData = Converter.toJSONFormat(pages);
        File.write(`${params.filename}.json`, jsonData);
    }

    if (params.hasOwnProperty('csv') && params.csv) {
        let csvData = Converter.toCSVFormat(pages);
        File.write(`${params.filename}.csv`, csvData);
    }
}
