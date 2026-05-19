//https://stackoverflow.com/questions/69566306/cannot-find-module-fs-promises-even-when-i-use-the-fs-code-only-inside-getsta
//import { promises as fsP } from 'node:fs';

import {segment, split, release, set} from "./classData.js";
import segments from '../data_segments.txt';
import splits from '../data_splits.txt';
import releases from '../data_releases.txt';
import sets from '../data_sets.txt';

const regexSplit = /\r?\n/;
const regexHexColor = /^#[0-9A-F]{6}$/i;                                //https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation
//const regexWhiteSpace = /\s+/g;                                       //https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
const regexTimeFormat = /^(?:([01]?\d|2[0-3]):([0-5]?\d):)?([0-5]\d)$/; //https://stackoverflow.com/questions/24347895/regex-for-hour-minute-and-second-format-hhmmss

//prepare the data structures for storing our data
const segmentMap = new Map();
const splitMap = new Map();
const releaseMap = new Map();
const setMap = new Map();
/*const dataColorsObject = {
    sets: {},
    segments: {}
};*/

//==================================
//
//      EXTRA FUNCTIONS
//
//==================================

//trims all trailing white spaces from the entries in the array
function trimArrayEntries(array) {
    for (let i = 0; i < array.length; i ++){
        array[i] = array[i].trim();
    }
}

/*
//takes a key and a value and builds a custom css property as a string
//https://css-irl.info/creating-css-variables-from-a-js-file/
const buildCssProperties = ([key, value]) => {
    //if value is a string, return the result
    if (typeof value == "string"){
        return `--${key}: ${value}`;
    }

    //recursively call the function to build our sub-properties as well, but this time, append the key name of the parent
    //property so our result is more descriptive
    return Object.entries(value).flatMap(([nestedKey, nestedValue]) => {
        return buildCssProperties([`${key}-${nestedKey}`, nestedValue]);
    });
}

//simply returns the dataColorsObject, which should only be called after all color objects have been built. They should contain an object that contains
//each segment's key with their hex color value, and the set colors in the same format.
function getColorsObject() {
    //console.log(dataColorsObject);
    return dataColorsObject;
}

//calls the buildCssProperties and converts the css properties into an array, 
//https://css-irl.info/creating-css-variables-from-a-js-file/
async function refreshCssColorsFile() {
    try{
        //console.log(dataColorsObject);
        const result = Object.entries(dataColorsObject).flatMap(buildCssProperties);
        //console.log(result);

        //build our css property line with an indent and semicolon
        let content = result.map((line) => `\t${line};`);

        //append and prepend brackets + the css :root property to our content
        content = [':root {', ...content, '}'].join('\n');

        //console.log(content);

        //write the contents to the css file
        await fsP.writeFile('/colorData.css', content, {encoding: 'utf-8'});

        //console.log('/colorData.css');

        //DEBUG - fetch the css file
        //https://stackoverflow.com/questions/55830414/how-to-read-text-file-in-react
        await fetch('/colorData.css')
            .then(r => r.text())
            .then(text => {
                console.log(text);
            });
        
    }catch(e) {
        console.error(e);
    }
}
*/

//==================================
//
//      SEGMENT PROCESSING
//
//==================================
async function readSegmentData() {

    /*
        below are all of my failed attempts to read a simple txt file
        from a local directory. It should have not been this big of a headache
    */

    /*const segmentBlob = new Blob();
    const reader = new FileReader();

    while (reader.readyState != reader.DONE){
        reader.readAsArrayBuffer(segmentBlob);
    }*/

    //const __filename = fileURLToPath(import.meta.url);
    //const __dirname = dirname(__filename);
    
    //console.log(import.meta.dirname);
    //console.log("import.meta.url: " + import.meta.url);
    //const __filename = fileURLToPath(import.meta.url);
    //console.log("__filename: " + __filename);
    //const __dirname = path.dirname(__filename);
    //console.log("__dirname: " + __dirname);

    /*console.log(import.meta.resolve(test));
    const segmentData = fs.readFileSync(import.meta.resolve(test), "utf8");
    const segmentDataArr = segmentData.split('/\r?\n/');
    console.log(segmentDataArr);*/

    //const segmentData = fs.readFileSync(test, "utf8");
    //const segmentDataArr = segmentData.split('/\r?\n/');
    //console.log(segmentDataArr);

    /*console.log("import.meta.filename: " + import.meta.filename);
    console.log("import.meta.dirname: " + import.meta.dirname);
    console.log("path.dirname(): " + path.dirname("./test.txt"));
    const segmentfileUrl = new URL("./test.txt", import.meta.url);
    console.log("url + import.meta.url test: " + segmentfileUrl);
    const segmentData = fs.readFile(segmentfileUrl, "utf8");
    const segmentDataArr = segmentData.split('/\r?\n/');*/

    //console.log(path.resolve(("../data_segments.txt")));

    //open segment txt file
    //const segmentData = fs.readFileSync(path.dirname("../data_segments.txt"), "utf8");
    //const segmentDataArr = segmentData.split('/\r?\n/');

    //iterate through data array and build our segment data
    //console.log(segmentDataArr);

    //so because i couldn't get fs working, due to stupid issues like import.meta.dirname returning undefined,
    //fs not accepting whatever url or path i throw at it, or issues with getting path.resolve() to work properly,
    //i've resorted to using fetch. I would have preferred using fs, but i spent way too long on this
    //and i'm sick of being stuck on this dumbfuck stupidass piece of shit problem.

    //fetch the segment txt file
    //https://stackoverflow.com/questions/55830414/how-to-read-text-file-in-react
    await fetch(segments)
        .then(r => r.text())
        .then(text => {

            //clear segment map to prevent duplicate console log spam from react.js calling components multiple times
            segmentMap.clear();

            const segmentDataArr = text.split(regexSplit);
            //console.log(segmentDataArr);

            //before we start preparing to add entries to our segment map, because React refreshes UI elements a couple of times during development, our static
            //variable counter will not reset in between those refreshes. Reset them here
            segment.totalVal = 0;
            
            //once we have the file loaded and split each line,
            //start building our dataset
            for (let i = 0; i < segmentDataArr.length; i ++){
                //first, validate the data format for the current line
                
                //if the first character is a #, indicating a comment, or if the line is blank, ignore this line
                if (segmentDataArr[i].charAt(0) == '#' || segmentDataArr[i].length == 0){
                    continue;
                }

                //otherwise, split the current line further into another array with commas as the delimiter
                const currentLine = segmentDataArr[i].split(',');

                //remove all trailing white spaces
                trimArrayEntries(currentLine);

                //check if the segment map already has an entry with the given key
                if (segmentMap.has(currentLine[0])){
                    console.warn("SEGMENT READ WARNING (line " + (i + 1) + "): Duplicate value at (" + currentLine[0] + "). Skipping. (" + segmentDataArr[i] + ")");
                    continue;
                }

                //now we check to ensure our actual data is valid
                if (!regexHexColor.test(currentLine[2])){
                    console.log(regexHexColor.test(currentLine[2]));
                    console.error("SEGMENT READ ERROR (line " + (i + 1) + "): Invalid Color Hex provided at (" + currentLine[2] + "). Skipping. (" + segmentDataArr[i] + ")");
                    continue;
                }
                if (!regexHexColor.test(currentLine[3])){
                    console.error("SEGMENT READ ERROR (line " + (i + 1) + "): Invalid Color Hex provided at (" + currentLine[3] + "). Skipping. (" + segmentDataArr[i] + ")");
                    continue;
                }
                if (Number.isNaN(currentLine[4])){
                    console.error("SEGMENT READ ERROR (line " + (i + 1) + "): Invalid numerical value at (" + currentLine[4] + "). Skipping. (" + segmentDataArr[i] + ")");
                    continue;
                }
                if (Number.isNaN(currentLine[5])){
                    console.error("SEGMENT READ ERROR (line " + (i + 1) + "): Invalid numerical value at (" + currentLine[5] + "). Skipping. (" + segmentDataArr[i] + ")");
                    continue;
                }

                //convert numerical characters into actual numbers
                currentLine[4] = Number.parseInt(currentLine[4]);
                currentLine[5] = Number.parseInt(currentLine[5]);

                //then, once that line has passed all of the checks, create the new segment and then add it to our data map
                const newSegment = new segment(currentLine[1], currentLine[2], currentLine[3], currentLine[4], currentLine[5]);
                //console.log(newSegment);
                segmentMap.set(currentLine[0], newSegment);

                //temperarily define these to get around the dumb js syntax of auto-creating objects this way (also readability)
                /*const dco_keyColorStart = currentLine[0] + "-Color-Start";
                const dco_keyColorEnd = currentLine[0] + "-Color-End";

                //add our colors to the color object so it can be converted into css varables later
                Object.defineProperty(dataColorsObject.segments, dco_keyColorStart, {
                    value: currentLine[2],
                    writable: true,
                    enumerable: true
                });
                Object.defineProperty(dataColorsObject.segments, dco_keyColorEnd, {
                    value: currentLine[3],
                    writable: true,
                    enumerable: true
                });*/
            }

            //check to see if the segment map is empty. If so, show console message
            if (segmentMap.size == 0){
                console.warn("SEGMENT READ WARNING: No segment data was present. Is the segment data file empty, contains only comments, or only contains invalid data?");
            }

            console.log(segmentMap);
            //console.log(dataColorsObject.segments);
        });
    
    return segmentMap;
}

//==================================
//
//      SPLIT PROCESSING
//
//==================================
async function readSplitData() {

    //fetch the split txt file
    await fetch(splits)
        .then(r => r.text())
        .then(text => {

            //clear split map to prevent duplicate console log spam from react.js calling components multiple times
            splitMap.clear();

            const splitDataArr = text.split(regexSplit);
            //console.log(splitDataArr);
            
            //once we have the file loaded and split each line,
            //start building our dataset
            for (let i = 0; i < splitDataArr.length; i ++){
                //first, validate the data format for the current line
                
                //if the first character is a #, indicating a comment, or if the line is blank, ignore this line
                if (splitDataArr[i].charAt(0) == '#' || splitDataArr[i].length == 0){
                    continue;
                }

                //otherwise, split the current line further into 2 different arrays. One of them containing the split information, the other
                //containing the split segments
                const currentLine = splitDataArr[i].split('|');
                //console.log(currentLine);

                //our currentLine array should now contain 2 entries. One for the metadata and the other for segment data. Make sure this is the case
                if (currentLine.length < 2){
                    console.error("SPLIT READ ERROR (line " + (i + 1) + "): No \"|\" delimiter to seperate metadata and segment data. Skipping. (" + splitDataArr[i] + ")");
                    continue;
                }else if (currentLine.length > 2){
                    console.error("SPLIT READ ERROR (line " + (i + 1) + "): Excess \"|\" delimiters. Cannot properly seperate data. Skipping. (" + splitDataArr[i] + ")");
                    continue;
                }

                //otherwise, split the current line further into another array with commas as the delimiter
                const splitInfo = currentLine[0].split(',');
                const splitSegments = currentLine[1].split(',');

                //also check to make sure that our split metadata array has 2 entries like it should
                if (splitInfo.length < 2){
                    console.error("SPLIT READ ERROR (line " + (i + 1) + "): Insufficient metadata entries in current line. Missing \",\" possible. Skipping. (" + splitDataArr[i] + ")");
                    continue;
                }else if (splitInfo.length > 2){
                    console.error("SPLIT READ ERROR (line " + (i + 1) + "): Excess metadata entries in current line. Extra \",\" possible. Skipping. (" + splitDataArr[i] + ")");
                    continue;
                }

                //remove all trailing white spaces
                trimArrayEntries(splitInfo);
                trimArrayEntries(splitSegments);

                //check if the split map already has an entry with the given key. If so, skip it
                if (splitMap.has(splitInfo[0])){
                    console.warn("SPLIT READ WARNING (line " + (i + 1) + "): Duplicate split in file. Skipping. (" + splitDataArr[i] + ")");
                    continue;
                }else{
                //otherwise, we are creating a new split entry
                    
                    //create the new split and then add it to our data map
                    const newSplit = new split(splitInfo, splitSegments, splitDataArr[i], i + 1, segmentMap);
                    //console.log(newSplit);
                    splitMap.set(splitInfo[0], newSplit);
                }
            }

            //check to see if the split map is empty. If so, show console message
            if (splitMap.size == 0){
                console.warn("SPLIT READ WARNING: No split data was present. Is the split data file empty, contains only comments, or only contains invalid data?");
            }else{
            //otherwise, sort the data in each segment array so that their numericai IDs incriment

                //this handy foreach will iterate a sorting algorithm for each entry in the splitMap
                /*splitMap.forEach(entry => {
                    entry.segments.sort((a, b) => {
                        //by looking up the numerical IDs of each  in the segment map
                        return segmentMap.get(a).ID - segmentMap.get(b).ID;
                    });
                });*/
            }

            console.log(splitMap);
        });

    return splitMap;
}

//==================================
//
//      RELEASE PROCESSING
//
//==================================
async function readReleaseData() {

    //fetch the release txt file
    await fetch(releases)
        .then(r => r.text())
        .then(text => {

            //clear release map to prevent duplicate console log spam from react.js calling components multiple times
            releaseMap.clear();

            const releaseDataArr = text.split(regexSplit);
            //console.log(releaseDataArr);
            
            //once we have the file loaded and split each line,
            //start building our dataset
            for (let i = 0; i < releaseDataArr.length; i ++){
                //first, validate the data format for the current line
                
                //if the first character is a #, indicating a comment, or if the line is blank, ignore this line
                if (releaseDataArr[i].charAt(0) == '#' || releaseDataArr[i].length == 0){
                    continue;
                }

                //otherwise, split the current line further into 2 different arrays. One of them containing the release information, the other
                //containing the release segments
                const currentLine = releaseDataArr[i].split('|');
                //console.log(currentLine);

                //our currentLine array should now contain at least 2 entries. One for the metadata and the rest for segment data. Make sure this is the case
                if (currentLine.length < 2){
                    console.error("RELEASE READ ERROR (line " + (i + 1) + "): No \"|\" delimiter to seperate metadata and segment data. Skipping. (" + releaseDataArr[i] + ")");
                    continue;
                }

                //otherwise, split the current line further into another array containing the metadata, and all the release segment data
                const releaseInfo = currentLine[0].split(',');
                const currentLineSegments = currentLine.slice(1);
                const releaseSegments = [];
                //trim ALL of the segment data
                for (let j = 0; j < currentLineSegments.length; j ++){

                    const tempSegmentData = currentLineSegments[j].split(',');

                    //there should be no less than 2 entires for this segment track data. If there is less than 2, skip this one
                    if (tempSegmentData.length < 2){
                        console.error("RELEASE READ ERROR (line " + (i + 1) + "): Insufficient data in segment data group. Missing \",\" possible. Skipping. (" + tempSegmentData + ") in ( " + releaseDataArr[i] + ")");
                        continue;
                    }

                    releaseSegments.push(tempSegmentData);
                    trimArrayEntries(releaseSegments[j]);
                }

                //console.log(releaseSegments);

                //also check to make sure that our release metadata array has 2 entries like it should
                if (releaseInfo.length < 2){
                    console.error("RELEASE READ ERROR (line " + (i + 1) + "): Insufficient metadata entries in current line. Missing \",\" possible. Skipping. (" + releaseDataArr[i] + ")");
                    continue;
                }else if (releaseInfo.length > 2){
                    console.error("RELEASE READ ERROR (line " + (i + 1) + "): Excess metadata entries in current line. Extra \",\" possible. Skipping. (" + releaseDataArr[i] + ")");
                    continue;
                }

                //remove all trailing white spaces
                trimArrayEntries(releaseInfo);

                //check if the release map already has an entry with the given key. If so, skip it
                if (releaseMap.has(currentLine[0])){
                    console.warn("RELEASE READ WARNING (line " + (i + 1) + "): Duplicate value at (" + releaseInfo[0] + "). Skipping. (" + releaseDataArr[i] + ")");
                    continue;
                }else{
                //we are creating a new release entry

                    //check to make sure our duration string is in the appropriate format
                    if (!regexTimeFormat.test(releaseInfo[1])){
                        console.error("RELEASE READ ERROR (line " + (i + 1) + "): Invalid duration time format at (" + releaseInfo[1] + "). Skipping. (" + releaseDataArr[i] + ")");
                        continue;
                    }

                    //create the new release and then add it to our data map
                    const newRelease = new release(releaseInfo, releaseSegments, releaseDataArr[i], i + 1, segmentMap, regexTimeFormat);
                    //console.log(newRelease);
                    releaseMap.set(releaseInfo[0], newRelease);
                }
            }

            //check to see if the split map is empty. If so, show console message
            if (releaseMap.size == 0){
                console.warn("RELEASE READ WARNING: No release data was present. Is the release data file empty, contains only comments, or only contains invalid data?");
            }else{
            //otherwise, sort the data in each segment array so that their numericai IDs incriment

                //this handy foreach will iterate a sorting algorithm for each entry in the splitMap
                /*releaseMap.forEach(entry => {
                    entry.segments.sort((a, b) => {
                        //by looking up the numerical IDs of each  in the segment map
                        return segmentMap.get(a).ID - segmentMap.get(b).ID;
                    });
                });*/
            }

            console.log(releaseMap);
        });
    
    return releaseMap;
}

//==================================
//
//      SET PROCESSING
//
//==================================
async function readSetData() {

    //fetch the release txt file
    await fetch(sets)
        .then(r => r.text())
        .then(text => {

            //clear set map to prevent duplicate console log spam from react.js calling components multiple times
            setMap.clear();

            const setDataArr = text.split(regexSplit);
            //console.log(setDataArr);
            
            //once we have the file loaded and split each line,
            //start building our dataset
            for (let i = 0; i < setDataArr.length; i ++){
                //first, validate the data format for the current line
                
                //if the first character is a #, indicating a comment, or if the line is blank, ignore this line
                if (setDataArr[i].charAt(0) == '#' || setDataArr[i].length == 0){
                    continue;
                }

                //otherwise, split the current line into an array
                const currentLine = setDataArr[i].split('|');
                //console.log(currentLine);

                //further split our data down
                const setInfo = currentLine[0].split(',');;
                const setReleaseData = currentLine.slice(1);

                //our set data should contain a few entries. Make sure this is the case
                if (setReleaseData.length < 1){
                    console.error("SET READ ERROR (line " + (i + 1) + "): No \"|\" delimiter to seperate metadata and set data. Skipping. (" + setDataArr[i] + ")");
                    continue;
                }

                //remove all trailing white spaces
                trimArrayEntries(setInfo);
                trimArrayEntries(setReleaseData);

                //check if the set map already has an entry with the given key. If so, skip it
                if (setMap.has(setInfo[0])){
                    console.warn("SET READ WARNING (line " + (i + 1) + "): Duplicate value at (" + setInfo[0] + "). Skipping. (" + setDataArr[i] + ")");
                    continue;
                }else{
                //we are creating a new set entry

                    //create the new set and then add it to our data map
                    const newSet = new set(setInfo, setReleaseData, setDataArr[i], i + 1, releaseMap);
                    //console.log(newSet);
                    setMap.set(setInfo[0], newSet);

                    //temperarily define these to get around the dumb js syntax of auto-creating objects this way (also readability)
                    /*const dco_keyColor = setInfo[0] + "-Color";

                    //add our colors to the color object so it can be converted into css varables later
                    Object.defineProperty(dataColorsObject.sets, dco_keyColor, {
                        value: setInfo[1],
                        writable: true,
                        enumerable: true
                    });*/
                }
            }

            //check to see if the set map is empty. If so, show console message
            if (setMap.size == 0){
                console.warn("SET READ WARNING: No set data was present. Is the set data file empty, contains only comments, or only contains invalid data?");
            }

            console.log(setMap);
            //console.log(dataColorsObject.sets);
        });
    
    return setMap;
}

export {readSegmentData, readSplitData, readReleaseData, readSetData};