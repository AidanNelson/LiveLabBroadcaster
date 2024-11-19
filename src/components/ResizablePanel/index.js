import { useState } from 'react';
import styles from './ResizablePanel.module.css';

export const ResizablePanel = ({ panelSize, setPanelSize, children, resizeDirection = "vertical" }) => {

    const handleDrag = (e) => {
        if (resizeDirection === "horizontal") {
            const newWidth = e.clientX; // Adjust for left handle drag
            if (newWidth >= 200 && newWidth <= 700) { // Boundary checks
                setPanelSize(newWidth);
            }
            return;
        } 
        const newHeight = window.innerHeight - e.clientY; // Adjust for top handle drag
        if (newHeight >= 200 && newHeight <= 500) { // Boundary checks
            setPanelSize(newHeight);
        }
    };

    return (
        <div className={`${styles.resizablePanel} ${resizeDirection === "horizontal" ? styles.horizontal : ""}`} style={resizeDirection === "vertical"? { height: `${panelSize}px` } : { width: `${panelSize}px` }}>
            <div
                className={`${styles.resizeHandle} ${resizeDirection === "horizontal" ? styles.resizeHandleHorizontal : ""}`}
                onMouseDown={(e) => {
                    document.addEventListener('mousemove', handleDrag);
                    document.addEventListener('mouseup', () => {
                        document.removeEventListener('mousemove', handleDrag);
                    }, { once: true });
                }}
            />
            <div className={styles.panelContent}>
                {children}
            </div>
        </div>
    );
};

