import { useState } from 'react';
import styles from './ResizablePanel.module.css';

export const ResizablePanel = ({ panelHeight, setPanelHeight, children }) => {

    const handleDrag = (e) => {
        const newHeight = window.innerHeight - e.clientY; // Adjust for top handle drag
        if (newHeight >= 200 && newHeight <= 500) { // Boundary checks
            setPanelHeight(newHeight);
        }
    };

    return (
        <div className={styles.resizablePanel} style={{ height: `${panelHeight}px` }}>
            <div
                className={styles.resizeHandle}
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

