import neo4j from 'neo4j-driver'
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

const neo4jUri = 'neo4j+s://9cb4d605.databases.neo4j.io';
const neo4jUser = 'neo4j';
const neo4jPass = 'Uxo5BB0g3-CTOU4n_w7wd-l_6gfoBwA4Uoe1VC9p7Q4';

const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPass));

const getSession = () => {
  return driver.session();
}

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtS_HGCSbKjAUYNbGVBSuY5_qed7MuRk0",
  authDomain: "travelappstorage.firebaseapp.com",
  projectId: "travelappstorage",
  storageBucket: "travelappstorage.appspot.com",
  messagingSenderId: "828723833347",
  appId: "1:828723833347:web:b88d5e2a4fcd42d2f1bc36",
  measurementId: "G-FPKCKES69C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { driver, getSession, app, storage };
