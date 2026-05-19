import { useEffect, useState } from 'react';
import classNames from 'classnames';
import NavButton from './navButton';


function Navbar({setData, setCurrentSet}){

    //setup navbar button states and groups
    const [pageSelected, setPageSelected] = useState(true);
    const [setSelected, setSetSelected] = useState(0);

    const [sets, setSets] = useState([]);

    //populate our sets array by converting our set map into an array, as well as its colors
    useEffect(() => {
        setSets([...setData].map(([name, value]) => ({name, value})));
    }, [setData]);

    const buttonGroup = classNames(
        "relative",
        "flex",
        "justify-stretch",
    );

    function changeSet(index){
        setCurrentSet(index);
        setSetSelected(index);
    }

    return (
        <>
            <div className={buttonGroup} >
                <NavButton label="AE_2022 - " color={"#2244FF"} isSelected={pageSelected} clickFunc={() => setPageSelected(true)}/>
            </div>
            <div className={buttonGroup} >
                {sets && (sets.map((item, index) => (
                    <NavButton key={item.name} label={item.value.name} color={item.value.color} isSelected={setSelected == index} clickFunc={() => changeSet(index)} />
                )))}
            </div>
        </>
    );
}

export default Navbar;