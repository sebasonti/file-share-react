import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addFolder(folder) {
  try {
    await addDoc(collection(db, "folders"), folder);
  } catch (e) {
    console.error(`Error creating folder "${folder.name}": `, e);
  }
}

async function getFolder(folderId) {
  try {
    const folderDoc = await getDoc(doc(db, "folders", folderId));
    return { id: folderDoc.id, ...folderDoc.data() };
  } catch (e) {
    console.error(`Error getting folder "${folderId}" from server: `, e);
  }
}

function getFoldersFromParent(userId, folderId, callback) {
  const collectionRef = collection(db, "folders");
  const collectionQuery = query(
    collectionRef,
    where("userId", "==", userId),
    where("parentId", "==", folderId),
    orderBy("createdAt")
  );

  return onSnapshot(
    collectionQuery,
    callback,
    error => console.log("Loading folders...", error));
}

async function addFile(file) {
  const collectionRef = collection(db, "files");
  const collectionQuery = query(
    collectionRef,
    where("name", "==", file.name),
    where("userId", "==", file.userId),
    where("folderId", "==", file.folderId)
  );

  const querySnapshot = await getDocs(collectionQuery);
  const existingFile = querySnapshot.docs[0];
  if (existingFile) {
    try {
      await updateDoc(existingFile.ref, { url: file.url });
    } catch (e) {
      console.error(`Error updating file "${file.name}": `, e);
    }
  } else {
    try {
      await addDoc(collectionRef, file);
    } catch (e) {
      console.error(`Error registering file "${file.name}": `, e);
    }
  }
}

async function getFile(fileId) {
  try {
    const fileDoc = await getDoc(doc(db, "folders", fileId));
    return { id: fileDoc.id, ...fileDoc.data() };
  } catch (e) {
    console.error(`Error getting file "${fileId}" from server: `, e);
  }
}


function getFilesFromParent(userId, folderId, callback) {
  const collectionRef = collection(db, "files");
  const collectionQuery = query(
    collectionRef,
    where("userId", "==", userId),
    where("folderId", "==", folderId),
    orderBy("createdAt")
  );

  return onSnapshot(
    collectionQuery,
    callback,
    error => console.log("Loading files...", error));
}

export const database = {
  folders: { getFolder, addFolder, getFoldersFromParent },
  files: { addFile, getFile, getFilesFromParent },
  getServerTimeStamp: serverTimestamp
}
export const auth = getAuth(app);

const storage = getStorage(app);

function uploadFile(filePath, file) {
  const fileRef = ref(storage, filePath);
  return uploadBytesResumable(fileRef, file);
}

export const storageManager = {
  uploadFile,
  getDownloadURL
}

export default app;