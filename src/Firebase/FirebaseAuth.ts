// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAVcbBH_B0b8PF6-B-RJ5uL6DPZVPeUqg",
  authDomain: "mockmentor-prod.firebaseapp.com",
  projectId: "mockmentor-prod",
  storageBucket: "mockmentor-prod.firebasestorage.app",
  messagingSenderId: "419904984919",
  appId: "1:419904984919:web:2fe18777c1784a14641012"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };
