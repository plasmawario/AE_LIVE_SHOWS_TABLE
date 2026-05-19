class segment {
    //total counter
    static totalVal = 0;

    //private properties
    ID = 0;
    altID = "";
    colorLeft = 0;
    colorRight = 0;
    outerGlowAmount = 0;
    innerGlowAmount = 0;

    //to be set per release split
    //timestamp = 0;

    constructor(altID, colorLeft, colorRight, outerGlowAmount, innerGlowAmount) {
        this.ID = segment.totalVal;
        this.altID = altID;
        this.colorLeft = colorLeft;
        this.colorRight = colorRight;
        this.outerGlowAmount = outerGlowAmount;
        this.innerGlowAmount = innerGlowAmount;

        segment.totalVal ++;
    }
}

class split {
    //total counter
    static totalVal = 0;

    //private properties
    ID = 0;
    altID = "";
    segments = [];

    constructor(splitInfo, segmentArray, rawLine, lineInFile, segmentMap){
        this.ID = split.totalVal;
        this.altID = splitInfo[1];
        for (let i = 0; i < segmentArray.length; i ++){
            //check to make sure there is a matching segment ID that exists in the segment map
            if (!segmentMap.has(segmentArray[i])){
                console.error("SPLIT READ ERROR (line " + lineInFile + "): No matching Segment ID found at (" + segmentArray[i] + "). Skipping. (" + rawLine + ")");
                continue;
            }
            this.segments.push(segmentArray[i]);
        }

        split.totalVal ++;
    }
}

class release {
    //private properties
    name = "";
    duration = 0;
    //trackData = [];
    trackData = new Map();

    constructor(releaseInfo, segmentArray, rawLine, lineInFile, segmentMap, timeFormatRegex){
        this.name = releaseInfo[0];
        this.duration = releaseInfo[1];
        for (let i = 0; i < segmentArray.length; i ++){
            //check to make sure there is a matching segment ID that exists in the segment map
            if (!segmentMap.has(segmentArray[i][0])){
                console.error("RELEASE READ ERROR (line " + lineInFile + "): No matching Segment ID found at (" + segmentArray[i][0] + "). Skipping. (" + rawLine + ")");
                continue;
            }
            //check to make sure our timestamp string is in the appropriate format
            if (!timeFormatRegex.test(segmentArray[i][1]) && segmentArray[i][1] !== "?"){
                console.error("RELEASE READ ERROR (line " + lineInFile + "): Invalid segment time format at (" + segmentArray[i][1] + "). Skipping. (" + rawLine + ")");
                continue;
            }
            let segNote = "";
            //it's possible we have a note for this segment of this release. If we do, make sure we add it. If not, append a blank space instead
            if (segmentArray[i].length == 3){
                segNote = segmentArray[i][2];
            }

            //this.trackData.push([segmentArray[i][0], segmentArray[i][1]]);
            this.trackData.set(segmentArray[i][0], [segmentArray[i][1], segNote]);
        }
    }
}

class set {
    //private properties
    name = "";
    color = 0;
    releases = [];

    constructor(setData, releaseArray, rawLine, lineInFile, releaseMap){
        this.name = setData[0];
        this.color = setData[1];
        for (let i = 0; i < releaseArray.length; i ++){
            //check to make sure there is a matching release ID that exists in the release map
            if (!releaseMap.has(releaseArray[i])){
                console.error("SET READ ERROR (line " + lineInFile + "): No matching Release ID found at (" + releaseArray[i] + "). Skipping. (" + rawLine + ")");
                continue;
            }
            this.releases.push(releaseArray[i]);
        }
    }
}

export {segment, split, release, set};