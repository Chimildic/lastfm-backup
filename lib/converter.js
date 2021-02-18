const Converter = (function () {
    return {
        toJSONFormat: toJSONFormat,
        toCSVFormat: toCSVFormat,
    };

    function toJSONFormat(pages) {
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
            row = row.map((r) => r.replace(regex, ' '));
            content.push(row.join(separator));
        });
        return content.join('\n');
    }

    function toJSONObj(pages) {
        let content = [];
        let type = Object.keys(pages[0])[0];
        pages.forEach((page) => {
            page[type].track.forEach((t) => {
                content.push({
                    artist: (t.artist ? t.artist.name || t.artist['#text'] : EMPTY).toLowerCase(),
                    track: (t.name ? t.name : EMPTY).toLowerCase(),
                    album: (t.album && t.album['#text'] ? t.album['#text'] : EMPTY).toLowerCase(),
                    date: (t.date && t.date['#text'] ? t.date['#text'] : EMPTY).toLowerCase(),
                });
            });
        });
        return content;
    }
})();
