import { useStageContext } from "../StageContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../SupabaseClient";
import { useEditorContext } from "./EditorContext";
import { addImageToCanvas } from "../KonvaCanvas";

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

export const convertFileNameToBase64 = (name) => {
    return bytesToBase64(new TextEncoder().encode(name));
}
export const convertBase64ToFileName = (encoded) => {
    return new TextDecoder().decode(base64ToBytes(encoded));
}

export const uploadFileToStageAssets = async ({ stageInfo, file }) => {
    const { data, error } = await supabase
        .storage
        .from('assets')
        .upload(`${stageInfo.id}/${convertFileNameToBase64(file.name)}`, file, {
            upsert: true
        });

    return { data, error };
}

export const FileList = ({ fileListIsStale, setFileListIsStale }) => {
    const { stageInfo } = useStageContext();
    const { editorStatus } = useEditorContext();

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!fileListIsStale) return;
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
        setFileListIsStale(false);
    }, [stageInfo.id, fileListIsStale]);

    const copyLink = async (file) => {
        const { data } = supabase
            .storage
            .from('assets')
            .getPublicUrl(`${stageInfo.id}/${file.name}`)
        const { publicUrl } = data;
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
            <h4>Files in {stageInfo.title}</h4>
            <ul>
                {files.map((file) => (
                    <li key={file.name}>
                        {file.decodedFileName}
                        <button onClick={() => copyLink(file)}>Copy Link</button>
                        {editorStatus.type === "canvasEditor" && (<button onClick={() => addImageToCanvas({stageInfo, file, featureIndex: editorStatus.target})}>Add to Canvas</button>)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const FileUpload = ({ setFileListIsStale }) => {
    const { stageInfo } = useStageContext();
    const [file, setFile] = useState(null);
    const fileInputRef = useRef();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        const {data, error} = uploadFileToStageAssets({ stageInfo, file })

        setUploading(false);

        if (error) {
            console.error('Error uploading file:', error);
        } else {
            console.log('File uploaded successfully:', data);
            setFileListIsStale(true);
            setFile(null);
            fileInputRef.current.value = null;
        }
    };

    return (
        <div>
            <h4>Upload File</h4>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export const FileInner = () => {

    const [fileListIsStale, setFileListIsStale] = useState(true);
    return (
        <>
            <FileUpload setFileListIsStale={setFileListIsStale} />
            <hr />
            <FileList fileListIsStale={fileListIsStale} setFileListIsStale={setFileListIsStale} />
        </>
    )
}

export const FileModal = () => {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <div>
            <button onClick={openModal}>Files!</button>
            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <FileInner />
                    </div>
                </div>
            )}
        </div>
    );
};