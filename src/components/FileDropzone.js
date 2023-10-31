import { useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";

export const FileDropzone = () => {
  const formRef = useRef();

  const onDrop = useCallback(async (acceptedFiles) => {
    // Do something with the files
    console.log(acceptedFiles);
    // formRef.current.submit();
    // get the files from the fileList as an array

    // initialize formData object
    const formData = new FormData();
    // loop over files and add to formData
    acceptedFiles.forEach((file) => formData.append("files", file));

    // Upload the files as a POST request to the server using fetch
    // Note: /api/fileupload is not a real endpoint, it is just an example
    const response = await fetch("/api/venue/vvv/uploadFile", {
      method: "POST",
      body: formData,
    });

    //successful file upload
    if (response.ok) {
      alert("Files uploaded successfully");
    } else {
      // unsuccessful file upload
      alert("Error uploading files");
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
};
