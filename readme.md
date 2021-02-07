# Lastfm backup
Backup your listening history on a schedule. Available `JSON` and `CSV` formats. Library for [Google Apps Script](https://developers.google.com/apps-script)

## Install
- Create [lastfm endpoint](https://www.last.fm/api/account/create)
- Create [new project](https://script.google.com/home/my) and add library with id: `1mXVb7yMnBn_lmImJG95TVmNQ1JEcpTcJmMWPHIMGgbdjuFPviXR8yTZW`
- Insert your `username` and `apiKey`

```js
function createBackup() {
    lastfmbackup.init({
        username: 'login',
        apiKey: 'key',
    });
    lastfmbackup.createBackup({ json: true, csv: true });
}
```