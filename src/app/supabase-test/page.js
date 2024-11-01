"use client";

import { useState } from "react";
import { supabase } from "@/components/SupabaseClient";

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const getFileList = async () => {
        const { data, error } = await supabase.storage.from('assets').list('public');
        console.log(data, error);
    }

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const { data, error } = await supabase.storage
            .from('assets')
            .upload(`public/${Math.random()+".png"}`, file);

        if (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file");
        } else {
            console.log("File uploaded successfully:", data);
            alert("File uploaded successfully");
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>

            <button onClick={getFileList}>Get File List</button>
        </div>
    );
};

export default FileUpload;
