import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Html } from 'react-konva-utils';
import { useStageContext } from '../StageContext';
import { uploadFileToStageAssets } from "../Editor/Files";
import { addImageToCanvas } from '.';



export const RectDropzone = ({ featureInfo, featureIndex }) => {
    const { stageInfo } = useStageContext();
    const [isDragging, setIsDragging] = useState(false);


    useEffect(() => {
        const handleDragOver = (event) => {
            event.preventDefault();
            setIsDragging(true);
        };

        const handleDragLeave = () => {
            setIsDragging(false);
        };

        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('drop', handleDragLeave);

        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('drop', handleDragLeave);
        };
    }, []);

    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles[0]) return;

        const file = acceptedFiles[0];
        const handleUpload = async () => {
            const { data, error } = await uploadFileToStageAssets({ stageInfo, file });

            if (error) {
                console.error('Error uploading file:', error);
            } else {
                console.log('File uploaded successfully:', data);

                addImageToCanvas({ stageInfo, file: data, featureIndex });

            }
        }
        handleUpload();
    }, []);



    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        noClick: true, // Disable click activation
        onDrop,
        multiple: false,
        accept: 'image/jpeg, image/png'
    });
    return (
        <>

            <Html>
                <div
                    {...getRootProps({
                        style: {
                            width: 1800,
                            height: 900,
                            position: 'absolute',
                            left: 50,
                            top: 50,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: isDragging ? 'flex' : 'none',
                            background: isDragActive ? 'rgba(20, 20, 20, 0.7)' : 'rgba(0,0,0,0)',
                            border: isDragActive ? '4px dashed white' : "none",
                            zIndex: 10,
                        },
                    })}
                >
                    <input {...getInputProps()} />
                    {isDragActive && (
                        <h1 className="">Drop Image...</h1>
                    )}
                </div>
            </Html>
        </>
    );
};