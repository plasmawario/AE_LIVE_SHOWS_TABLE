import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Tooltip } from 'react-tooltip';

function LiveShowTable({releaseData, splitData, segmentData, currentSet}){

    const [releasesArr, setReleasesArr] = useState([]);
    const [segmentsArr, setSegmentsArr] = useState([]);
    const [splitArr, setSplitArr] = useState([]);

    const TrackStatus = {
        "none": 0,
        "error": 1
    }

    //populate our releases array by converting our segment map into an array, as well as its colors
    //yes i know this is a monster function, but this is the only time we will need all of this logic to happen so whatever
    useEffect(() => {
        /*
            ==================================================================================
            ==================================================================================
                Filter releases for our current set
            ==================================================================================
            ==================================================================================
        */
        //convert releases to an array so that they can be iterated over
        const rawReleasesArr = [...releaseData].map(([name, value]) => ({name, value}));

        //filter the releases array to only contain our releases of our selected set.
        //ensure that when we filter, we are making a deep copy rather than a shallow copy, as to not touch our
        //original releaseData map
        const filteredReleaseArr = structuredClone(rawReleasesArr.filter((release) => {
            return currentSet.value.releases.indexOf(release.name) > -1;
        }));

        //console.log(filteredReleaseArr);

        //convert the track ID map from each release into an array so we can display it as a table
        filteredReleaseArr.forEach((release) => {
            const tempTrackDataArr = [...release.value.trackData].map(([name, value]) => ([name, value]));
            release.value.trackData = tempTrackDataArr;
        })

        console.log("filtered releases");
        console.log(filteredReleaseArr);

        //the result should now be an array of releases from the selected set only
        setReleasesArr(filteredReleaseArr);

        /*
            ==================================================================================
            ==================================================================================
                Get segment data of all filtered releases from their IDs
            ==================================================================================
            ==================================================================================
        */

        //create a temperary segment set to store our found segments
        let segFilteredKeySet = new Set();

        //filter our segment data based on which segment IDs are covered in the shown releases. We do this by
        //performing a union on segFilteredKeySet and our current releases trackIDs by looking up the current filtered release name in our original
        //releaseData so that we can get our trackData as a map, enabling us to use performing a union. This will return a new set that contains
        //the segment key string from both segFilteredKeySet and the current filtered release array
        for (let i = 0; i < filteredReleaseArr.length; i ++){

            //get our current release as a map by looking up the key in our releaseData map
            const currentReleaseFromMap = releaseData.get(filteredReleaseArr[i].name);
            //console.log(currentReleaseFromMap);

            //perform a union on the current in the current release in the for loop and segMap to add all segments of this release to segFilteredKeySet. We shouldn't
            //have any duplicates this way, as sets automatically purge dupes
            segFilteredKeySet = segFilteredKeySet.union(currentReleaseFromMap.trackData);
            //console.log(segFilteredKeySet);

        }

        //console.log(segFilteredKeySet);

        //once we added all of our segments to the set, obtain all the segment data from segmentData using the keys. We'll sort it after
        const segFilteredDataMap = new Map();
        segFilteredKeySet.forEach((item) => {
            const storedItem = segmentData.get(item);
            segFilteredDataMap.set(item, storedItem);
        })
        //console.log("segFilteredDataMap");
        //console.log(segFilteredDataMap);

        //now we can sort them by looking up their numerical IDs.
        //We must convert the set into an array first to do this
        const segNewArr = Array.from(segFilteredDataMap).sort((a, b) => {
            //lookup each segment key string in the segmentData map to get their numerical IDs. The compare them
            //console.log([a, b]);
            return a[1].ID - b[1].ID;
        });

        console.log("obtained total segments in this set");
        console.log(segNewArr);

        //the result is an array of segments that covers all of the releases in this set
        setSegmentsArr(segNewArr);

        /*
            ==================================================================================
            ==================================================================================
                offset trackData of filtered releases to line up to segNewArr
            ==================================================================================
            ==================================================================================
        */
        
        //perform the following operations on every release in the currently selected set
        filteredReleaseArr.forEach((release) => {
            //go through each filtered release and extend their trackData to the total length of segNewArr
            const oldArrLength = release.value.trackData.length;

            //set trackData length of the release to segNewArr. This is so each release can have its display table line up with the others,
            //even if the release doesn't actually extend that far out. Empty spaces will be populated by a "-" anyway
            release.value.trackData.length = segNewArr.length;

            //populate all new vacant spaces with undefined starting from the end of our original array length
            release.value.trackData.fill(undefined, oldArrLength);

            //console.log("realigning " + release.name);
            //while we're iterating through the release, working backwards, set the index of the trackData entry to match the index of where that
            //segment appears in segNewArr. This should move that segment to its proper place in relation to the total segment array length
            for (let i = release.value.trackData.length; i >= 0; i --){
                //skip this entry if the value is undefined because there is nothing to move
                if (release.value.trackData[i] == undefined){
                    continue;
                }else{
                    //store the track data at this spot so we can copy it over later
                    const storedSegReleaseTrackdata = release.value.trackData[i];
                    //console.log("storing " + storedSegReleaseTrackdata);

                    //get the specific segment we want to move
                    //const segMapElem = segFilteredDataMap.get(storedSegReleaseTrackdata[0]);
                    
                    //now we need to find where the index of this segment is in the segment array
                    const segIndex = segNewArr.findIndex((item) => {
                        return item[0] == storedSegReleaseTrackdata[0];
                    });
                    //console.log(segIndex);

                    //now we can set the index of the release trackData to our segment data
                    release.value.trackData[segIndex] = storedSegReleaseTrackdata;

                    //after we do that, set the current position in the trackData to undefined, to eliminate the now-duplicated data
                    //but only do this if the original position and the new position are different. If they're the same, then we would end up
                    //just deleting the data outright since it wasn't moved, and we don't want that
                    if (segIndex != i){
                        release.value.trackData[i] = undefined;
                    }

                    //finally, if we hit a trackData where a timestamp has the special character '?', mark it as undefined. This special character is
                    //meant to mark the end of the AE_2022 - releases, and is a placeholder for a future segment. We'll display it specially in the table
                    if (release.value.trackData[i] != undefined && release.value.trackData[i][1][0] === "?") {
                        release.value.trackData[i] = undefined;
                    }
                }
            }

        });

        //the result is our segment data for each release is now properly alligned with each other in the table, making for a neat and organized table
        
        /*
            ==================================================================================
            ==================================================================================
                Get split data covering all segments played in this set
            ==================================================================================
            ==================================================================================
        */

        //this will contain all of our filtered splits
        const filteredSplitsSet = [];

        console.log("Refreshing splits for this set");
        
        //we can do this effectively by performing an intersection on the splits, and the filtered segments. Do this once for each split, and each time we do this,
        //we can figure out how many cells to span the split along our table by taking the resulting length. By doing this with the filtered segments, we
        //automatically adjust the split cell spanning size depending on which segments are currently visible
        splitData.forEach((item, key) => {
            //get the segments of this split and put them into a set so we can use intersection on it (we don't just use intersection on the splitData map itself cuz their
            //keys contain the key for the split itself. We want the key of the segments, which is stored inside of the splits in an array)
            const splitSegsSet = new Set(item.segments);

            //perform our intersection on the expected segment data of this split and the filtered segment data. This will give us only the splits in this current set,
            //as well as only the segments from each split that is present in this set. This should account for the beginnings and endings of the set where sometimes
            //not all of the split segments are played. Then we push this into our filtered splits array
            filteredSplitsSet.push([key, splitSegsSet.intersection(segFilteredKeySet)]);
        })

        //console.log(filteredSplitsSet);

        //now that we have our splits for this set, we construct a new set that will contain objects consisting of out split data and our segment length
        const splitFinalData = new Set();

        //add each of our array entries from before and populate it with
        for (let i = 0; i < filteredSplitsSet.length; i ++){

            //check to make sure the set inside of this space in the array isn't empty first
            if (filteredSplitsSet[i][1].size > 0){

                //get the split for this entry
                const currentSplit = splitData.get(filteredSplitsSet[i][0]);

                //build our new array populated with all the necessary data
                splitFinalData.add([filteredSplitsSet[i][0], {"numID": currentSplit.ID, "name": currentSplit.altID, "cellCount": filteredSplitsSet[i][1].size}])
            }
        }

        //convert to an array after
        const splitFinalDataArr = Array.from(splitFinalData);

        console.log(splitFinalDataArr);
        
        //the result is an array containing our split data, telling it how many cells each should span, covering their respective segments in this set
        setSplitArr(splitFinalDataArr);

    }, [currentSet, releaseData]);



    return (
        <div className="relative overflow-auto max-h-128 max-w-1xl m-16 top-32">
            <table className="text-left text-xs">
                <thead>
                    <tr>
                        {/*build each split*/}
                        <th className="text-center p-2 h-16 min-w-44 border-b-neutral-300 border">Splits</th>
                        {(splitArr && splitData && (splitArr.map((item, index) => (
                            <>
                                <td className="text-center p-2 border min-w-15" colSpan={item[1].cellCount} key={item[1].ID}>{item[1].name}</td>
                            </>
                        ))))}
                    </tr>
                    <tr>
                        {/*build each segment*/}
                        <th className="text-center p-2 h-8 border-b-neutral-300 border">Releases \ Segments</th>
                        {(segmentsArr && segmentData && (segmentsArr.map((item, index) => (
                            <>
                                <td className="text-center p-2 border min-w-15" style={{
                                    boxShadow:  `0rem 0rem ${item[1].outerGlowAmount / 1}rem ${item[1].outerGlowAmount / 5}rem ${item[1].colorLeft}`,
                                    background: `linear-gradient(90deg, ${item[1].colorLeft}, ${item[1].colorRight})`,
                                }} data-tooltip-id="segInfo" data-tooltip-content={item[1].ID + ". " + item[1].altID} key={item[1].ID}>{item[1].ID}</td>
                            </>
                        ))))}
                    </tr>
                </thead>
                <tbody>
                    {/*build each release*/}
                    {releasesArr && segmentData && (releasesArr.map((item, index) => (
                        <>{/*build each release row*/}
                            <tr key={item.key}>
                                <th className={(index % 2 == 1 && "bg-ae2022_black-alt") + " p-2 border-b-neutral-300 border"}>{item.value.name}</th>
                                {/*release segment data*/}
                                {(item.value.trackData.map((relItem, relIndex) => (
                                    <>
                                        {/*replace cell slot data with a blank string if segment cell is undefined (segment is not in this release)*/}
                                        {relItem ? 
                                            <td className={(index % 2 == 1 && "bg-ae2022_black-alt") + " text-center p-2 border " + (relItem[1][1] !== "" && "bg-red-950")}
                                                data-tooltip-id="segNote" data-tooltip-content={relItem[1][1]} key={relItem[0]}>{relItem[1][0]}</td> 
                                            : 
                                            <td className={(index % 2 == 1 && "bg-ae2022_black-alt") + " text-center p-2 border"} key={"N-A_" + relIndex}>-</td>
                                        }
                                    </>
                                )))}
                            </tr>
                        </>
                    )))}
                </tbody>
            </table>



            {/* 3rd-party tooltip element to make things easier for us */}
            <Tooltip id="segNote" border="2px solid red" opacity={1} style={{
                backgroundColor: `#090909`
            }} />
            <Tooltip id="segInfo" border="2px solid white" opacity={1} style={{
                backgroundColor: `#090909`
            }} />
        </div>
    );
}

export default LiveShowTable;