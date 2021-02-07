function createBackup(params) {
    if (!params || Object.keys(params).length == 0){
        return;
    }

    let countPages = Lastfm.getCountPages(USERNAME);
    if (countPages == 0) {
        return;
    }

    let pages = Lastfm.getRecentTracks(USERNAME, countPages);
    
    if (params.json){
        let jsonData = Converter.toJSONFormat(pages);
        File.write('lastfm-backup.json', jsonData);
    }
    
    if (params.csv){
        let csvData = Converter.toCSVFormat(pages);
        File.write('lastfm-backup.csv', csvData);
    }
}
