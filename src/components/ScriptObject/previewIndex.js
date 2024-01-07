import React, { useState, useEffect } from 'react';
// import { render } from 'react-dom';
// import { createGlobalStyle } from 'styled-components';
// import {
//   registerFrame,
//   listen,
//   MessageTypes,
//   dispatchMessage
// } from './dispatcher';
// import { filesReducer, setFiles } from './filesReducer';
import EmbedFrame from './EmbedFrame';
// import getConfig from './getConfig';
// import { initialState } from './files';

// const GlobalStyle = createGlobalStyle`
//   body {
//     margin: 0;
//   }
// `;

export const PreviewFrame = ({scriptableObjectData}) => {
  console.log('GOT DATA: ', scriptableObjectData);
  
  // const files = scriptableObjectData.files;
  // const isPlaying = scriptableObjectData.active;

  // return null;

  const [files,setFiles] = useState(scriptableObjectData.files);
  // const [state, dispatch] = useReducer(filesReducer, scriptableObjectData.files, initialState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [basePath, setBasePath] = useState('/scriptableObjects');
  const [textOutput, setTextOutput] = useState(false);
  const [gridOutput, setGridOutput] = useState(false);
  // registerFrame(window.parent, getConfig('EDITOR_URL'));

  // function handleMessageEvent(message) {
  //   const { type, payload } = message;
  //   switch (type) {
  //     case MessageTypes.SKETCH:
  //       dispatch(setFiles(payload.files));
  //       setBasePath(payload.basePath);
  //       setTextOutput(payload.textOutput);
  //       setGridOutput(payload.gridOutput);
  //       break;
  //     case MessageTypes.START:
  //       setIsPlaying(true);
  //       break;
  //     case MessageTypes.STOP:
  //       setIsPlaying(false);
  //       break;
  //     case MessageTypes.REGISTER:
  //       dispatchMessage({ type: MessageTypes.REGISTER });
  //       break;
  //     case MessageTypes.EXECUTE:
  //       dispatchMessage(payload);
  //       break;
  //     default:
  //       break;
  //   }
  // }



  useEffect(() => {
    setFiles(scriptableObjectData.files);
    // dispatch(setFiles(state));
    setIsPlaying(true);
  },[scriptableObjectData])

  

  // useEffect(() => {
  //   const unsubscribe = listen(handleMessageEvent);
  //   return function cleanup() {
  //     unsubscribe();
  //   };
  // });
  return (
    // <React.Fragment>
    //   <GlobalStyle />
      <EmbedFrame
        files={files}
        isPlaying={isPlaying}
        basePath={basePath}
        gridOutput={gridOutput}
        textOutput={textOutput}
      />
    // </React.Fragment>
  );
};

// render(<App />, document.getElementById('root'));