import { useStageContext } from "../StageContext";
import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}

const convertFileNameToBase64 = (name) => {
    return bytesToBase64(new TextEncoder().encode(name));
}
const convertBase64ToFileName = (encoded) => {
    return new TextDecoder().decode(base64ToBytes(encoded));
}
export const FileList = () => {
    const { stageInfo } = useStageContext();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            const { data, error } = await supabase
                .storage
                .from('assets')
                .list(stageInfo.id);


            const withoutPlaceholder = data.filter((file) => {
                return file.name !== ".emptyFolderPlaceholder";
            })


            const withDecodedFilenames = withoutPlaceholder.map((file) => {
                return { ...file, decodedFileName: convertBase64ToFileName(file.name) };
            })
            console.log('data:', withDecodedFilenames);

            if (error) {
                console.error('Error fetching files:', error);
            } else {
                setFiles(withDecodedFilenames);
            }

            setLoading(false);
        };

        fetchFiles();
    }, [stageInfo.id]);

    const copyLink = async (file) => {
        const { data } = supabase
            .storage
            .from('assets')
            .getPublicUrl(`${stageInfo.id}/${file.name}`)
        const {publicUrl} = data;
        if (publicUrl) {
            try {
                await navigator.clipboard.writeText(publicUrl);
                console.log('Public URL copied to clipboard:', publicUrl);
            } catch (err) {
                console.error('Failed to copy public URL to clipboard:', err);
            }
        }

    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Files in {stageInfo.title}</h2>
            <ul>
                {files.map((file) => (
                    <li key={file.name}>
                        {file.decodedFileName}
                        <button onClick={() => copyLink(file)}>Copy Link</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const FileUploadModal = () => {
    const { stageInfo } = useStageContext();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        const { data, error } = await supabase
            .storage
            .from('assets')
            .upload(`${stageInfo.id}/${convertFileNameToBase64(file.name)}`, file);

        setUploading(false);

        if (error) {
            console.error('Error uploading file:', error);
        } else {
            console.log('File uploaded successfully:', data);
        }
    };

    return (
        <div>
            <h2>Upload File</h2>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};