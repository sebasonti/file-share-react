import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { database, storageManager } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ROOT_FOLDER } from "../../hooks/useFolder";
import { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { ProgressBar, Toast } from "react-bootstrap";

export default function AddFileButton({ currentFolder }) {
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const { currentUser } = useAuth();

  function handleUpload(e) {
    const file = e.target.files[0];
    if (file == null || currentFolder == null) return;

    const id = uuidV4();
    setUploadingFiles((prevUploadingFiles) => [
      ...prevUploadingFiles,
      { id, name: file.name, progress: 0, error: false },
    ]);

    const parentPath = currentFolder.path.map((p) => p.name);

    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${parentPath.join("/")}/${file.name}`
        : `${parentPath.join("/")}/${currentFolder.name}/${file.name}`;

    const uploadTask = storageManager.uploadFile(
      `/files/${currentUser.uid}/${filePath}`,
      file
    );

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadingFile) => {
            if (uploadingFile.id === id) {
              return { ...uploadingFile, progress };
            }
            return uploadingFile;
          });
        });
      },
      () => {
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadingFile) => {
            if (uploadingFile.id === id) {
              return { ...uploadingFile, error: true };
            }
            return uploadingFile;
          });
        });
      },
      () => {
        setUploadingFiles((prevUploadingFiles) => {
          return prevUploadingFiles.filter((uploadingFile) => {
            return uploadingFile.id !== id;
          });
        });

        storageManager.getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          const fileDoc = {
            url,
            name: file.name,
            createdAt: database.getServerTimeStamp(),
            folderId: currentFolder.id,
            userId: currentUser.uid,
          };
          database.files.addFile(fileDoc);
        });
      }
    );
  }

  return (
    <>
      <label className="btn btn-outline-success btn-sm m-0 me-2">
        <FontAwesomeIcon icon={faFileUpload} />
        <input
          type="file"
          onChange={handleUpload}
          style={{ opacity: 0, position: "absolute", left: "-9999px" }}
        />
      </label>
      {uploadingFiles.length > 0 &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              maxWidth: "250px",
            }}
          >
            {uploadingFiles.map((file) => (
              <Toast
                onClose={() => {
                  setUploadingFiles((prevUploadingFiles) => {
                    return prevUploadingFiles.filter((uploadingFile) => {
                      return uploadingFile.id !== file.id;
                    });
                  });
                }}
                key={file.id}
              >
                <Toast.Header
                  closeButton={file.error}
                  className="text-truncate w-100 d-block"
                >
                  {file.name}
                </Toast.Header>
                <Toast.Body>
                  <ProgressBar
                    animated={!file.error}
                    variant={file.error ? "danger" : "primary"}
                    now={file.error ? 100 : file.progress * 100}
                    label={
                      file.error
                        ? "Error"
                        : `${Math.round(file.progress * 100)}%`
                    }
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
