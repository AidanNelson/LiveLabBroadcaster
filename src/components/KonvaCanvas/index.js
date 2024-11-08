import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Star, Transformer, Image } from 'react-konva';
import useImage from 'use-image';


const Rectangle = ({ shapeProps, isSelected, onSelect, onChange }) => {
    const shapeRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected) {
            // we need to attach transformer manually
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const [image] = useImage('https://backend.sheepdog.work/storage/v1/object/public/assets/c8048812-3941-418b-92f6-219cc8e305fd/U2NyZWVuc2hvdCAyMDI0LTExLTA0IGF0IDEwLjUxLjI44oCvQU0ucG5n');


    return (
        <>
            <Image
                image={image}
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                {...shapeProps}
                draggable
                onDragEnd={(e) => {
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={(e) => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // set minimal value
                        width: Math.max(5, node.width() * scaleX),
                        height: Math.max(node.height() * scaleY),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
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

const initialRectangles = [
    {
        x: 10,
        y: 10,
        width: 100,
        height: 100,
        fill: 'red',
        id: 'rect1',
    },
    {
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: 'green',
        id: 'rect2',
    },
];

function generateShapes() {
    return [...Array(10)].map((_, i) => ({
        id: i.toString(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotation: Math.random() * 180,
        isDragging: false,
    }));
}

const INITIAL_STATE = generateShapes();

const Canvas = () => {
    const [selectedId, selectShape] = useState(null);

    const checkDeselect = (e) => {
        // deselect when clicked on empty area
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };
    const [rectangles, setRectangles] = useState(initialRectangles);

    const [stars, setStars] = useState(INITIAL_STATE);

    const handleDragStart = (e) => {
        const id = e.target.id();
        setStars(
            stars.map((star) => {
                return {
                    ...star,
                    isDragging: star.id === id,
                };
            })
        );
    };
    const handleDragEnd = (e) => {
        setStars(
            stars.map((star) => {
                return {
                    ...star,
                    isDragging: false,
                };
            })
        );
    };
    //   return null;

    return (
        <div style={{ position: "absolute", top: "0px", left: "0px", zIndex: 100 }}>
            <Stage width={window.innerWidth} height={window.innerHeight}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}>
                <Layer>
                    {rectangles.map((rect, i) => {
                        return (
                            <Rectangle
                                key={i}
                                shapeProps={rect}
                                isSelected={rect.id === selectedId}
                                onSelect={() => {
                                    selectShape(rect.id);
                                }}
                                onChange={(newAttrs) => {
                                    const rects = rectangles.slice();
                                    rects[i] = newAttrs;
                                    setRectangles(rects);
                                }}
                            />
                        );
                    })}
                    {/* </Layer>
                <Layer> */}
                    {stars.map((star) => (

                        <Star
                            key={star.id}
                            id={star.id}
                            x={star.x}
                            y={star.y}
                            numPoints={5}
                            innerRadius={20}
                            outerRadius={40}
                            fill="#89b717"
                            opacity={0.8}
                            draggable
                            rotation={star.rotation}
                            shadowColor="black"
                            shadowBlur={10}
                            shadowOpacity={0.6}
                            shadowOffsetX={star.isDragging ? 10 : 5}
                            shadowOffsetY={star.isDragging ? 10 : 5}
                            scaleX={star.isDragging ? 1.2 : 1}
                            scaleY={star.isDragging ? 1.2 : 1}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};


export default Canvas;