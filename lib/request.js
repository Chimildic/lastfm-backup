const Lastfm = (function () {
    const URL_BASE = 'http://ws.audioscrobbler.com/2.0';
    return {
        getCountPages: getCountPages,
        getLovedTracks: getLovedTracks,
        getRecentTracks: getRecentTracks,
    };

    function getCountPages(user, type) {
        let response = CustomUrlFetchApp.fetch(
            createUrl({
                method: `user.get${type}`,
                user: user,
                limit: PER_PAGE,
                page: 1,
            })
        );
        if (response && response[type]) {
            return parseInt(response[type]['@attr'].totalPages);
        }
        return 0;
    }

    function getLovedTracks(user, countPage) {
        let requests = [];
        for (let i = 1; i <= countPage; i++) {
            requests.push({
                url: createUrl({
                    method: 'user.getlovedtracks',
                    user: user,
                    limit: PER_PAGE,
                    page: i,
                }),
            });
        }
        return CustomUrlFetchApp.fetchAll(requests) || [];
    }

    function getRecentTracks(user, countPage) {
        let requests = [];
        for (let i = 1; i <= countPage; i++) {
            requests.push({
                url: createUrl({
                    method: 'user.getrecenttracks',
                    user: user,
                    limit: PER_PAGE,
                    page: i,
                }),
            });
        }
        let responses = CustomUrlFetchApp.fetchAll(requests) || [];
        removeNowPlaying(responses, 'recenttracks');
        return responses;
    }

    function createUrl(queryObj) {
        queryObj.api_key = API_KEY;
        queryObj.format = 'json';
        return Utilities.formatString('%s/?%s', URL_BASE, CustomUrlFetchApp.parseQuery(queryObj));
    }

    function removeNowPlaying(responses, key) {
        responses.forEach((response) => {
            if (isNowPlayling(response[key].track[0])) {
                response[key].track.splice(0, 1);
            }
        });
    }

    function isNowPlayling(track) {
        return track['@attr'] && track['@attr'].nowplaying === 'true';
    }
})();

const CustomUrlFetchApp = (function () {
    let countRequest = 0;
    return {
        fetch: fetch,
        fetchAll: fetchAll,
        parseQuery: parseQuery,
        getCountRequest: () => countRequest,
    };

    function fetch(url, params = {}) {
        countRequest++;
        params.muteHttpExceptions = true;
        let response = UrlFetchApp.fetch(url, params);
        return readResponse(response, url, params);
    }

    function fetchAll(requests) {
        countRequest += requests.length;
        requests.forEach((request) => (request.muteHttpExceptions = true));
        let responseArray = [];
        let limit = ASYNC_REQUEST_COUNT;
        let count = Math.ceil(requests.length / limit);
        for (let i = 0; i < count; i++) {
            let requestPack = requests.splice(0, limit);
            let responseRaw = sendPack(requestPack);
            let responses = responseRaw.map((response, index) => {
                return readResponse(response, requestPack[index].url, {
                    headers: requestPack[index].headers,
                    payload: requestPack[index].payload,
                    muteHttpExceptions: requestPack[index].muteHttpExceptions,
                });
            });
            Combiner.push(responseArray, responses);
        }
        return responseArray;

        function sendPack(requests) {
            let raw = UrlFetchApp.fetchAll(requests);
            let result = [];
            let failed = [];
            let seconds = 0;
            raw.forEach((response, index) => {
                if (response.getResponseCode() == 429) {
                    seconds = response.getHeaders()['Retry-After'] || 2;
                    failed.push(requests[index]);
                } else {
                    result.push(response);
                }
            });
            if (seconds > 0) {
                Utilities.sleep(seconds * 1000);
                Combiner.push(result, sendPack(failed));
            }
            return result;
        }
    }

    function readResponse(response, url, params = {}) {
        if (isSuccess(response.getResponseCode())) {
            return onSuccess();
        }
        return onError();

        function onRetryAfter() {
            let value = response.getHeaders()['Retry-After'] || 5;
            Utilities.sleep(value * 1000);
            return fetch(url, params);
        }

        function tryFetchOnce() {
            Utilities.sleep(3000);
            countRequest++;
            response = UrlFetchApp.fetch(url, params);
            if (isSuccess(response.getResponseCode())) {
                return onSuccess();
            }
            writeErrorLog();
        }

        function onSuccess() {
            let type = response.getHeaders()['Content-Type'] || '';
            if (type.includes('json')) {
                return parseJSON(response);
            }
            return response;
        }

        function onError() {
            writeErrorLog();
            let responseCode = response.getResponseCode();
            if (responseCode == 429 || responseCode == 500) {
                return onRetryAfter();
            } else if (responseCode > 500) {
                return tryFetchOnce();
            }
        }

        function isSuccess(code) {
            return code >= 200 && code < 300;
        }

        function writeErrorLog() {
            console.error(
                'URL:',
                url,
                '\nCode:',
                response.getResponseCode(),
                '\nParams:',
                params,
                '\nHeaders:',
                response.getHeaders(),
                '\nContent:',
                response.getContentText()
            );
        }
    }

    function parseJSON(response) {
        let content = response.getContentText();
        return content.length > 0 ? tryParseJSON(content) : { msg: 'Пустое тело ответа', status: response.getResponseCode() };
    }

    function tryParseJSON(content) {
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error(e, e.stack, content);
            return [];
        }
    }

    function parseQuery(obj) {
        return Object.keys(obj)
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`)
            .join('&');
    }
})();
