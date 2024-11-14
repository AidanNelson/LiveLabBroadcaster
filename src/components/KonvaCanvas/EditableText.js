import React, { useState, useRef } from 'react';
import { Layer, Text, Transformer } from 'react-konva';

export const EditableText = ({ initialText, x, y }) => {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef(null);
  const transformerRef = useRef(null);

  const handleDblClick = (e) => {
    setIsEditing(true);

    const stage = e.target.getStage();
    const stageBox = stage.container().getBoundingClientRect();
    const textBox = textRef.current.getClientRect();

    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.style.position = 'absolute';
    input.style.top = `${stageBox.top + textBox.y}px`;
    input.style.left = `${stageBox.left + textBox.x}px`;
    input.style.width = `${textBox.width}px`;

    document.body.appendChild(input);
    input.focus();

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        setText(input.value);
        setIsEditing(false);
        document.body.removeChild(input);
      }
    });

    input.addEventListener('blur', () => {
      setText(input.value);
      setIsEditing(false);
      document.body.removeChild(input);
    });
  };

  const handleTransformEnd = () => {
    const node = textRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 after transformation
    node.scaleX(1);
    node.scaleY(1);

    // Apply changes to font size or width
    node.fontSize(node.fontSize() * scaleY);
    node.width(node.width() * scaleX);
  };

  return (
    <>
      <Text
        ref={textRef}
        text={text}
        x={x}
        y={y}
        fontSize={24}
        draggable
        onDblClick={handleDblClick}
        onTransformEnd={handleTransformEnd}
        onClick={() => {
          transformerRef.current.nodes([textRef.current]);
          transformerRef.current.getLayer().batchDraw();
        }}
      />
      <Transformer ref={transformerRef} />
      </>
  );
};
