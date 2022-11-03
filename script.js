import { initializeApp } from "https://www.gstatic.com/firebasejs/9.11.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.11.0/firebase-firestore.js";


//change dedtails of below
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
  db = getFirestore(app);

const signoutBtn = document.getElementById("logout"),
  dashboard = document.getElementById("dashboard"),
  fList = document.getElementById("friendsList"),
  startchatBtn = document.getElementById("startChatBtn"),
  chatInput = document.getElementById("chatInput"),
  messages = document.getElementById("messages"),
  chatWithName = document.getElementById("chatWithName");

let userName,
  chatBtn = document.getElementById("chatBtn"),
  curUserDetail = {};

let dashboardUserDom = (name, email, pass) => {
  dashboard.innerHTML = `
    <h3>Name : ${name} <button id="${name}" onclick="changeUserName('${email}')">click to change</button></h3>
    <h3>Email : ${email}</h3>
    <h3>Password : ${pass}</h3>
    `
  userName = name;
  curUserDetail.curUserName = name;
  console.log(curUserDetail)

}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user.email, "logged in user")
    userData(user.uid)
    let user_name = user.email.slice(0, user.email.indexOf("@"));
    otherUsers(user.email, user.uid, user_name)
    curUserDetail.email = user.email;
    curUserDetail.UID = user.uid;

  } else {
    console.log("user not logged in, redirecting to login/signup page")
    setTimeout(() => {
      window.location = "index.html"
    }, 1000);
    // ...
  }
});

// Sign-out .
if (signoutBtn) {
  signoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      console.log("signout")
    }).catch((error) => {
      console.log(error, "==> found error in signout")
    });
  })
}

//get current user data from database
let userData = async (currentUser) => {
  const docRef = doc(db, "users", currentUser);
  const docSnap = await getDoc(docRef);


  if (docSnap.exists()) {
    // console.log("Document data:", docSnap.data());
    dashboardUserDom(docSnap.data().name, docSnap.data().email, docSnap.data().password)
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}

//other users data
let otherUsers = async (email, uid, user_name) => {
  const q = query(collection(db, "users"), where("email", "!=", email));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    fList.innerHTML += `
    <li >${doc.data().name}
    <button id="${doc.id}" 
    onclick='startChat("${doc.data().name}","${doc.id}","${user_name}","${uid}")'>
    Start chat</button>
    </li>
    `
    // console.log(doc.id, " => ", doc.data());
  });
}

startchatBtn && startchatBtn.addEventListener("click", startChat());

let obj;
let list;

let startChat = (otherUserName, otherUserUID, curUserName, curUserUid) => {
  event.preventDefault()
  chatBtn.id = otherUserUID + "1"
  // allMessges();
  chatWithName.innerHTML = otherUserName
  let chatDoc;
  otherUserUID > curUserUid ?
    chatDoc = otherUserUID + curUserUid :
    chatDoc = curUserUid + otherUserUID
  obj = {
    senderUID: curUserUid,
    receiverUID: otherUserUID,
    senderName: curUserName,
    receiverName: otherUserName,
    chatId: chatDoc,
  }
  chatInput.focus()
  // && otherUserUID === event.target.parentNode.id 

  document.getElementById(otherUserUID + "1").addEventListener("click", () => {
    list = document.querySelectorAll("#friendsList li button");
    console.log(list);
    for (let i = 0; i < list.length; i++) {
      list[i].setAttribute("disabled", "");
    }
    chatInput.focus()
    chatInput.value ? storeMsg() : "";

    obj = "";
    chatInput.focus()
    chatInput.value = ""
    // chatDoc = "";
  })
  allMessges(curUserUid, chatDoc)

}
// const q = query(citiesRef, orderBy("state"), orderBy("population", "desc"));

let allMessges = async (curUserUID, chatID) => {
  messages.innerHTML = ""
  const q = query(collection(db, "messages"), where("chatId", "==", chatID), orderBy("timestamp", "asc"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    let postTime = doc.data().timestamp.seconds.toString() + doc.data().timestamp.nanoseconds / 1000000
    postTime = Number(postTime)
    postTime = new Date(postTime)

    messages.innerHTML += `
    <li>${doc.data().senderName} ${doc.data().message} 
    </li>
    `
    // ${ postTime }
  });
}
// change name
let changeUserName = async () => {
  let newUserName = prompt("Pleaes input New user name", curUserDetail.curUserName)
  const docRef = doc(db, "users", curUserDetail.UID);

  await updateDoc(docRef, {
    name: newUserName
  });

}
async function storeMsg() {
  if (chatInput) {
    try {
      await addDoc(collection(db, "messages"), {
        senderUID: obj.senderUID,
        receiverUID: obj.receiverUID,
        senderName: obj.senderName,
        receiverName: obj.receiverName,
        chatId: obj.chatId,
        message: chatInput.value,
        timestamp: serverTimestamp()
      })
      for (let i = 0; i < list.length; i++) {
        list[i].removeAttribute("disabled", "");
      }

      console.log("msg sent"); // to rhne do
    } catch (error) {
      console.log(error, "==> error while uploading chat data to database")
    }
    chatInput.value = "";
  }
}

window.changeUserName = changeUserName
window.startChat = startChat
