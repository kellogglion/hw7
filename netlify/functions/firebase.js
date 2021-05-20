const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig = {
  apiKey: "AIzaSyCNEKaDEaPE9pq8BNHx1thhcRSFe9Z-Ihk",
  authDomain: "kiei-451-8e6b9.firebaseapp.com",
  projectId: "kiei-451-8e6b9",
  storageBucket: "kiei-451-8e6b9.appspot.com",
  messagingSenderId: "736570012586",
  appId: "1:736570012586:web:55c1e133ae8cfda18571d3"
} 

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

module.exports = firebase