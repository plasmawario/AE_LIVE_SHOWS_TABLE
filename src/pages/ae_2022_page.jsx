import { useState, useEffect } from 'react'
import Navbar from './navbar.jsx'
import LiveShowTable from './liveShowTable.jsx';
import { readSegmentData, readSplitData, readReleaseData, readSetData } from '../data/processing/processedData.js';

function ae_2022_page(){

    //store what the current selected set is so we can pass it to our table component to display data
    const [currentSetIndex, setCurrentSetIndex] = useState(0);

    const [segmentData, setSegmentData] = useState(null);
    const [splitData, setSplitData] = useState(null);
    const [releaseData, setReleaseData] = useState(null);
    const [setData, setSetData] = useState(null);
    const [finishedLoading, SetFinishedLoading] = useState(false);

    //loads the file data asynchronously. This will ensure that whatever previous data has
    //been read before loading the next batch of data. This is important as reading data
    //relies on the previous data to exist
    async function LoadFileData() {
        console.log("Loading Segment Data");
        setSegmentData(await readSegmentData());
        console.log("Loading Split Data");
        setSplitData(await readSplitData());
        console.log("Loading Release Data");
        setReleaseData(await readReleaseData());
        console.log("Loading Set Data");
        setSetData(await readSetData());
        console.log("Finished!");
        SetFinishedLoading(true);
    }

    //only used to ensure that when we load data initially, it happens only once on page load
    let pageInit = false;

    useEffect(() => {
        //only do this once and never again
        if (!pageInit){
            pageInit = true;
            LoadFileData();
        }
    }, []);

    return (
        <>
            {finishedLoading ? (<>
                <Navbar setData={setData} setCurrentSet={setCurrentSetIndex} />
                <p className="relative left-16 w-fit top-48 text-xs">
                    You may hover over the segment number IDs to view their full names. Any segment timestamp that's colored in red contains special notes.
                    Hover over these to view the note
                </p>
                <LiveShowTable releaseData={releaseData} splitData={splitData} segmentData={segmentData} setData={setData} currentSet={[...setData].map(([name, value]) => ({name, value}))[currentSetIndex]} />
            </>) : (<>
                <p className="text-center justify-center ">Loading data...</p>
            </>)}
        </>
    );
}

export default ae_2022_page;