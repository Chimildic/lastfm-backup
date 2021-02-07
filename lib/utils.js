const Combiner = (function () {
    return {
        replace: replace,
        push: push,
    };

    function replace(oldArray, newArray) {
        oldArray.length = 0;
        push(oldArray, newArray);
    }

    function push(sourceArray, ...additionalArray) {
        additionalArray.forEach((array) => {
            if (array.length < 1000) {
                sourceArray.push.apply(sourceArray, array);
            } else {
                array.forEach((item) => sourceArray.push(item));
            }
        });
        return sourceArray;
    }
})();


const File = (function () {
    const FOLDER_NAME = 'Lastfm backup';
    const rootFolder = getRootFolder();

    return {
        write: write,
    };

    function write(filename, content) {
        let file = getFile(filename);
        if (!file) {
            file = createFile(filename);
        }
        file.setContent(content);
    }

    function getFile(filename) {
        let files = getFileIterator(filename);
        if (files.hasNext()) {
            return files.next();
        }
    }

    function createFile(filename) {
        return rootFolder.createFile(filename, '');
    }

    function getFileIterator(filename) {
        return rootFolder.getFilesByName(filename);
    }

    function getRootFolder() {
        let folders = DriveApp.getFoldersByName(FOLDER_NAME);
        if (folders.hasNext()) {
            return folders.next();
        }
        return DriveApp.createFolder(FOLDER_NAME);
    }
})();
