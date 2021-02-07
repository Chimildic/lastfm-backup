const Converter = (function () {
    const key = '#text';
    return {
        toJSONFormat: toJSONFormat,
        toCSVFormat: toCSVFormat,
    };

    function toJSONFormat(pages){
        return JSON.stringify(toJSONObj(pages));
    }

    function toCSVFormat(pages, separator = ',') {
        let content = [];
        let titleRow = ['artist', 'track', 'album', 'date'];
        content.push(titleRow.join(separator));

        let regex = new RegExp(separator, 'g');
        let jsonData = toJSONObj(pages);
        jsonData.forEach((item) => {
            let row = [item.artist, item.track, item.album, item.date];
            row = row.map(r => r.replace(regex, ' '));
            content.push(row.join(separator));
        });
        return content.join('\n');
    }

    function toJSONObj(pages) {
        let content = [];
        pages.forEach((page) => {
            page.recenttracks.track.forEach((t) => {
                content.push({
                    artist: (t.artist && t.artist[key] ? t.artist[key] : EMPTY).toLowerCase(),
                    track: (t.name ? t.name : EMPTY).toLowerCase(),
                    album: (t.album && t.album[key] ? t.album[key] : EMPTY).toLowerCase(),
                    date: (t.date && t.date[key] ? t.date[key] : EMPTY).toLowerCase(),
                });
            });
        });
        return content;
    }
})();
