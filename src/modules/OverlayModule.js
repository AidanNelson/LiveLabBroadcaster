import {useState} from "react";
import {myOverlay} from './myOverlay.js';

export const OverlayModule = () => {
    console.log('overlay module');
    console.log('myOverlay:',myOverlay);
    const markup = { __html: myOverlay };
    return (
        <div dangerouslySetInnerHTML={markup}>
        </div>
    )
}