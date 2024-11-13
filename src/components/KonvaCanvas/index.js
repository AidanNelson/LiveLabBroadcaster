import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Transformer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useEditorContext } from '../Editor/EditorContext';
import { useStageContext } from '../StageContext';
import { RectDropzone } from './Dropzone';
import { updateFeature } from '../Editor';
import { supabase } from '../SupabaseClient';



const getAspectRatio = async ({ url }) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            resolve(img.width / img.height);
        };
    });
}

const createNewCanvasImage = async ({ url }) => {
    const aspectRatio = await getAspectRatio({ url })
    const imageWidth = 300;
    const imageHeight = imageWidth / aspectRatio;
    console.log('aspect:', aspectRatio);
    return {
        "id": Date.now() + "_" + Math.random().toString(),
        "url": url,
        "properties": {
            "x": SCENE_WIDTH / 2 - (imageWidth / 2) + (Math.random() - 0.5) * 200,
            "y": SCENE_HEIGHT / 2 - (imageHeight / 2) + (Math.random() - 0.5) * 200,
            "width": imageWidth,
            "height": imageHeight,
            "scaleX": 1,
            "scaleY": 1,
            "rotation": 0,
        }
    }
}

export const addImageToCanvas = async ({ stageInfo, file, featureIndex }) => {
    console.log('Adding Image to Canvas:', file);

    const { data } = supabase
        .storage
        .from('assets')
        .getPublicUrl(file.path ? file.path : `${stageInfo.id}/${file.name}`)


    // const imageSize = await getImageSizeFromFile(file);
    // const aspectRatio = imageSize.width / imageSize.height;
    const { publicUrl } = data;
    if (publicUrl) {
        try {

            // update canvas feature with new image
            const updatedFeature = structuredClone(stageInfo.features[featureIndex]);
            updatedFeature.images.push(await createNewCanvasImage({ url: publicUrl }));
            console.log('updated feature:', updatedFeature);
            updateFeature({ stageInfo, updatedFeature, updatedFeatureIndex: featureIndex });

        } catch (err) {
            console.error('Failed to copy public URL to clipboard:', err);

        }
    }
};




export const SCENE_WIDTH = 1920;
export const SCENE_HEIGHT = 1080;

const EditableImage = ({ url, shapeProps, isSelected, onSelect, onChange, onDelete, editable }) => {
    const shapeRef = useRef();
    const transformerRef = useRef();

    useEffect(() => {
        const onKeyPressed = (e) => {
            console.log(e.key);
            if (e.key === 'Backspace' && isSelected) {
                onDelete();
            }
        }
        window.addEventListener('keydown', onKeyPressed);
        return () => {
            window.removeEventListener('keydown', onKeyPressed);
        }
    }, [isSelected, onDelete]);


    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            transformerRef.current.nodes([shapeRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const [image] = useImage(url);

    return (
        <>
            <KonvaImage
                image={image}
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                draggable={editable}
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    // console.log('shapeProps:', shapeProps)
                    // console.log('node:', shapeRef.current.attrs);
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current;

                    console.log('Done transforming:', node.rotation());
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </>
    );
};


const CanvasFeature = ({ featureInfo, featureIndex }) => {
    const { stageInfo } = useStageContext();
    const { editorStatus, setEditorStatus } = useEditorContext();
    const [shouldBeEditable, setShouldBeEditable] = useState(false);

    useEffect(() => {
        setShouldBeEditable(featureIndex === editorStatus.target);
    }, [featureIndex, editorStatus.target]);

    const stageRef = useRef();
    const containerRef = useRef();


    const deleteImage = async ({ stageInfo, featureInfo, imageToDeleteIndex }) => {
        console.log('deleting image:', featureIndex);
        const updatedFeatureInfo = structuredClone(featureInfo);
        updatedFeatureInfo.images = updatedFeatureInfo.images.filter((image, index) => index !== imageToDeleteIndex);

        console.log('updated feature info:', updatedFeatureInfo);
        updateFeature({ stageInfo, updatedFeature: updatedFeatureInfo, updatedFeatureIndex: featureIndex });


    }

    const [selectedId, selectShape] = useState(null);

    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    useEffect(() => {
        function fitStageIntoParentContainer() {
            // now we need to fit stage into parent container
            var containerWidth = containerRef.current.offsetWidth;

            // but we also make the full scene visible
            // so we need to scale all objects on canvas
            var scale = containerWidth / SCENE_WIDTH;

            stageRef.current.width(SCENE_WIDTH * scale);
            stageRef.current.height(SCENE_HEIGHT * scale);
            stageRef.current.scale({ x: scale, y: scale });
        }
        window.addEventListener('resize', fitStageIntoParentContainer);
        fitStageIntoParentContainer();
    }, []);


    return (
        <div ref={containerRef} style={{ position: "absolute", top: "0px", left: "0px", width: "100%", height: "100%" }}>
            <Stage ref={stageRef}
                width={SCENE_WIDTH} height={SCENE_HEIGHT}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
            >
                <Layer>
                    <RectDropzone featureInfo={featureInfo} featureIndex={featureIndex} />
                    {featureInfo.images.map((imageInfo, imageIndex) => {
                        return (
                            <EditableImage
                                url={imageInfo.url}
                                key={imageIndex}
                                shapeProps={{ ...imageInfo.properties }}
                                editable={shouldBeEditable}
                                isSelected={imageInfo.id === selectedId}
                                onSelect={shouldBeEditable ? () => {
                                    selectShape(imageInfo.id);
                                } : () => { console.log('element is not editable') }}
                                onChange={shouldBeEditable ? (newAttrs) => {
                                    console.log('new attributes!', newAttrs);
                                    const updatedFeatureInfo = structuredClone(featureInfo);
                                    updatedFeatureInfo.images[imageIndex].properties = { ...updatedFeatureInfo.images[imageIndex].properties, ...newAttrs };
                                    updateFeature({ stageInfo, updatedFeature: updatedFeatureInfo, updatedFeatureIndex: featureIndex })
                                } : () => { console.log('element is not editable') }}
                                onDelete={shouldBeEditable ? () => {
                                    console.log('deleting node');
                                    deleteImage({ stageInfo, featureInfo, imageToDeleteIndex: imageIndex });
                                } : () => { console.log('element is not editable') }}
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </div>
    );
};


export default CanvasFeature;