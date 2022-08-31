const process = require('process');
const cliArgs = [...process.argv.slice(2)]
const dataPath = cliArgs[0];
const path = require('path');
const fs = require('fs/promises');
(async function () {

    const dataFile = (await fs.readFile(path.join('.', 'data.json'))).toString();
    const localeFile = (await fs.readFile(path.join('.', 'locales.json'))).toString();
    const localeData = {};
    JSON.parse(localeFile).forEach((item) => {
        if (item) {
            localeData[item[0]] = item[1];
        }
    });

    const dataObj = JSON.parse(dataFile);
    //console.log(dataObj);

    const fileName = `${dataPath.replace(/\.|\,/g, '_')}.csv`;
    const columnHeaders = [];
    const rows = [];

    let objToConvert = {};
    dataPath.split(',').forEach((dataPath) => {
        objToConvert = {...objToConvert, ...getObjectPath(dataObj, dataPath)}
    });
    //console.log(objToConvert);
    //it's annoying to loop twice, but get all the column headers looping over all the data... in case objects aren't the same...


    columnHeaders.push('key');
    let rowKeys = Object.keys(objToConvert);

    //the maxRoll Data file is objects of objects (instead of arrays) so we will use the properties of the final object as the "key" column
    rowKeys.forEach((key) => {
        let innerDataKeys = Object.keys(objToConvert[key]);
        innerDataKeys.forEach((key) => {
            if (columnHeaders.indexOf(key) == -1) columnHeaders.push(`${key}`);
        })
    });

    rows.push(columnHeaders.join(';'));

    //build our rows!
    rowKeys.forEach((key) => {
        let rowObj = objToConvert[key];
        let row = [];
        columnHeaders.forEach((headerKey) => {
            if (headerKey === 'key') {
                row.push(key);
            } else {
                row.push(getLocaleMap(localeData, rowObj[headerKey] || ""));
            }

        })
        rows.push(row.join(';'));
    });

    await fs.writeFile(path.join('.', fileName), rows.join('\n'));

    //console.log(columnHeaders);
})()

function getObjectPath(obj, path) {
    if (!path) {
        return obj;
    }
    if (path.indexOf('.') == -1) {
        return obj[path];
    } else if (path.indexOf('.') > -1) {
        var paths = path.split('.');
        var currentPath = paths[0];
        paths.splice(0, 1);
        return getObjectPath(obj[currentPath], paths);
    }
}

function getLocaleMap(localeData, value) {
    return localeData[value] ? localeData[value] : value;
}