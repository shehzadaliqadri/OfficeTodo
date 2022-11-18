import { initializeApp } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytesResumable
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyBxUgfFLuGpK7xTs54jlEXog0CHLTiaUlA",
  authDomain: "test-53443.firebaseapp.com",
  projectId: "test-53443",
  storageBucket: "test-53443.appspot.com",
  messagingSenderId: "502464896815",
  appId: "1:502464896815:web:d1ee2c3229457852a58bda"
};

const app = initializeApp(firebaseConfig),
  auth = getAuth(),
  user = auth.currentUser,
  db = getFirestore(app),
  storage = getStorage(app);

const loginBtn = document.getElementById("signinBtn"),
  loginEmail = document.getElementById("signinEmail"),
  loginPassword = document.getElementById("signinPassword"),
  signupBtn = document.getElementById("signupBtn"),
  signupEmail = document.getElementById("signupEmail"),
  signupPassword = document.getElementById("signupPassword"),
  signupName = document.getElementById("signupName"),
  main = document.getElementById("main"),
  file = document.getElementById("file");

let redirectTime = 10000;

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    console.log(signupEmail.value, "input email")
    console.log(signupPassword.value, "input password")
    console.log(file.files[0])
    console.log(file.files[0].type)

    createUserWithEmailAndPassword(auth, signupEmail.value, signupPassword.value)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log(user.uid, "==> user created and logged in")
        localStorage.setItem("activeUser", user.uid)

        await setDoc(doc(db, "users", user.uid), {
          name: signupName.value,
          email: signupEmail.value,
          password: signupPassword.value
        });
        redirectTime = 0

        setTimeout(() => {
          window.location = "dashboard.html"
        }, redirectTime);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, "==> error with signup please try again")
      });

  })
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user, "==> user logged in")
        redirectTime = 0

        setTimeout(() => {
          window.location = "dashboard.html"
        }, redirectTime);
      })
      .catch((error) => {
        console.log(error, "==> found error with login")
      });
  })
}

window.onload = async () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      console.log(uid, "this user logged in, redirecting to dashboard in 5 seconds")

      setTimeout(() => {
        main.innerHTML = "<p>redirecting to dashboard</p>"
        window.location = "todo.html"
      }, redirectTime);

      // ...
    } else {
      // User is signed out
      // ...
    }
  });
}

const uploadFile = (file, uid) => {
  return new Promise((resolve, reject) => {
    const storage = getStorage();

    // Upload file and metadata to the object 'images/mountains.jpg'
    const storageRef = ref(storage, 'images/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;

          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            reject(error)
            break;
          case 'storage/canceled':
            // User canceled the upload
            reject(error)
            break;

          // ...

          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            reject(error)

            break;
        }
        reject(error)
      },
      () => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
          resolve(downloadURL)

        });
      }
    );
  })
}

