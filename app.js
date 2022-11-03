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
  loginBtn = document.getElementById("signinBtn"),
  loginEmail = document.getElementById("signinEmail"),
  loginPassword = document.getElementById("signinPassword"),
  signupBtn = document.getElementById("signupBtn"),
  signupEmail = document.getElementById("signupEmail"),
  signupPassword = document.getElementById("signupPassword"),
  signupName = document.getElementById("signupName"),
  main = document.getElementById("main"),
  db = getFirestore(app);
let redirectTime = 10000;

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    console.log(signupEmail.value, "input email")
    console.log(signupPassword.value, "input password")

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
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      const uid = user.uid;
      console.log(uid, "this user logged in, redirecting to dashboard in 5 seconds")

      setTimeout(() => {
        main.innerHTML = "<p>redirecting to dashboard</p>"
        window.location = "dashboard.html"
      }, redirectTime);

      // ...
    } else {
      // User is signed out
      // ...
    }
  });
}

