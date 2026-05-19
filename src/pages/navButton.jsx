import { useEffect } from 'react';
import classNames from 'classnames';

function NavButton({label, color, isSelected, clickFunc}){

    //console.log(color);
    
    const buttonStyle = classNames(
        "relative",
        "flex-auto",
        "h-16",
        "w-full",
        "m-0",
        "text-center",
        "text-white",
        "text-lg",
        "shadow-(--button_glow_inset)",
    );

    const styleBgColor = {
        backgroundColor: isSelected ? `${color}` : `var(--color-ae2022_black)`
    }
    
    return (
        <button type="button" className={buttonStyle} onClick={clickFunc} style={styleBgColor} >
            {label}
        </button>
    );
}

export default NavButton;