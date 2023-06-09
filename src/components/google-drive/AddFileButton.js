import React, { useState } from "react";
import ReactDOM from "react-dom";
import { faFileImport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/AuthContext";
import { storage, database } from "../../firebase";
import { ROOT_FOLDER } from "../../hooks/useFolder";
import { v4 as uuidV4 } from "uuid";
import { ProgressBar, Toast } from "react-bootstrap";

export default function AddFileButton({ currentFolder }) {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const { currentUser } = useAuth();

  function handleUpload(e) {
    const file = e.target.files[0];
    if (currentFolder == null || file == null) return;

    const id = uuidV4();
    setUploadingFiles(prevUploadingFiles => [
      ...prevUploadingFiles,
      { id, name: file.name, progress: 0, error: false },
    ]);
    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${currentFolder.path.join("/")}/${file.name}`
        : `${currentFolder.path.join("/")}/${currentFolder.name}/${file.name}`;

    const uploadTask = storage.ref(`/files/${currentUser.uid}/${filePath}`).put(file);

    uploadTask.on(
      "state_changed",
      snapshot => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        setUploadingFiles(prevUploadingFiles => {
          return prevUploadingFiles.map(uploadFile =>
            uploadFile.id === id ? { ...uploadFile, progress } : uploadFile
          );
        });
      },
      () => {
        setUploadingFiles(prevUploadingFiles => {
          return prevUploadingFiles.map(uploadFile =>
            uploadFile.id === id ? { ...uploadFile, error: true } : uploadFile
          );
        });
      },
      () => {
        setUploadingFiles(prevUploadingFiles => {
          return prevUploadingFiles.filter(uploadFile => uploadFile.id !== id);
        });

        uploadTask.snapshot.ref.getDownloadURL().then(url => {
          database.files
            .where("name", "==", file.name)
            .where("userId", "==", currentUser.uid)
            .where("folderId", "==", currentFolder.id)
            .get()
            .then(existingFiles => {
              const existingFile = existingFiles.docs[0];
              if (existingFile) {
                database.files.add({
                  url,
                  name: file.name,
                  createdAt: database.getCurrentTimestamp(),
                  folderId: currentFolder.id,
                  userId: currentUser.uid,
                }).then(() => {
                  setInterval(() => {
                    window.location.reload(false);
                  }, 2500);
                });
              } else {
                database.files.add({
                  url,
                  name: file.name,
                  createdAt: database.getCurrentTimestamp(),
                  folderId: currentFolder.id,
                  userId: currentUser.uid,
                });
              }
            });
        });
      }
    );
  }

  return (
    <>
      <label className="btn btn-outline-primary btn-sm m-0">
        <FontAwesomeIcon icon={faFileImport} style={{ fontSize: 35 }} />
        <input
          type="file"
          onChange={handleUpload}
          style={{ opacity: 0, position: "absolute" }}
        />
      </label>
      {uploadingFiles.length > 0 &&
        ReactDOM.createPortal(
          <div style={{ position: "absolute", bottom: "1rem", right: "1rem", maxWidth: "250px" }}>
            {uploadingFiles.map(file => (
              <Toast
                key={file.id}
                onClose={() => {
                  setUploadingFiles(prevUploadingFiles => {
                    return prevUploadingFiles.filter(uploadFile => uploadFile.id !== file.id);
                  });
                }}
              >
                <Toast.Header closeButton={file.error} className="text-truncate d-block w-100">
                  {file.name}
                </Toast.Header>
                <Toast.Body>
                  <ProgressBar
                    animated={!file.error}
                    variant={file.error ? "danger" : "primary"}
                    now={file.error ? 100 : file.progress * 100}
                    label={file.error ? "Error" : `${Math.round(file.progress * 100)}%`}
                  />
                </Toast.Body>
              </Toast>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
