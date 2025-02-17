require("dotenv").config();
let currentSong = new Audio();
let songs;
let currFolder;
let CLOUD_NAME = process.env.CLOUD_NAME;
let CLOUD_API_KEY = process.env.CLOUD_API_KEY;
let CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
let CLOUD_URL = `cloudinary://${CLOUD_API_KEY}:${CLOUD_API_SECRET}@dqnnpk2yy/songs`;


//For gettin duration of a song

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// For getting songs        

async function getSongs(folder) {
  try {
    currFolder = folder;
    let a = await fetch(`${CLOUD_URL}/${currFolder}/`);
    let response = await a.text();
    //For parsing only songs not whole data
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        songs.push(element.href.split(`/${currFolder}/`)[1]);
      }

      //Show all the songs in the playlist
      let songUL = document
        .querySelector(".songList")
        .getElementsByTagName("ul")[0];

      songUL.innerHTML = ""
    }
    for (const song of songs) {
      songUL.innerHTML =
        songUL.innerHTML +
        `<li>
      <img class="invert" src="./assets/music.svg" alt="" />
        <div class="info">
          <div> ${song
          .replaceAll("%20", " ")
          .replaceAll("/", " ")
        }</div>
          <div>Salman</div>
        </div>
     
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="./assets/play.svg" alt="">
     
        </div>
      </li>`;
    }

    //Adding Event listener to each song so that we can play each song

    Array.from(
      document.querySelector(".songList").getElementsByTagName("li")
    ).forEach((e) => {
      e.addEventListener("click", (element) => {
        console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });
    return songs;

  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }







}

function playMusic(track, pause = false) {
  //   let audio = new Audio("/songs/" + track);
  //   audio.play();
  currentSong.src = `${CLOUD_URL}/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "./assets/pause.svg";

  }
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
}



//For displaying albums

async function displayAlbums() {
  let a = await fetch(`${CLOUD_URL}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let array = Array.from(anchors)

  for (let index = 0; index < array.length; index++) {
    const e = array[index];


    if (e.href.includes("/songs/")) {
      let folder = (e.href.split("/").slice(-1)[0])

      //Get metadata of the folder

      let a = await fetch(`${CLOUD_URL}/${folder}/info.json`);
      let response = await a.json();
      let cardContainer = document.querySelector(".cardContainer")
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
    <div class="play">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        class="injected-svg"
        data-src="https://cdn.hugeicons.com/icons/play-solid-sharp.svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        role="img"
        color="#000000"
      >
        <path
          d="M4.62355 3.35132C4.85479 3.21713 5.13998 3.21617 5.3721 3.34882L19.3721 11.3488C19.6058 11.4824 19.75 11.7309 19.75 12C19.75 12.2691 19.6058 12.5177 19.3721 12.6512L5.3721 20.6512C5.13998 20.7838 4.85479 20.7829 4.62355 20.6487C4.39232 20.5145 4.25 20.2674 4.25 20V4C4.25 3.73265 4.39232 3.48551 4.62355 3.35132Z"
          fill="#000000"
        ></path>
      </svg>
    </div>
    <div class="img">
      <img
        src="${CLOUD_URL}/${folder}/cover.jpg"
        alt=""
      />
    </div>
    <h2>${response.title}</h2>
    <p>${response.description}</p>
  </div>`

    }
  }

  //Load data into card when clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })

}

async function main() {
  //Get the list of all the songs
  await getSongs(`${CLOUD_URL}/charlie-puth`);

  playMusic(songs[0], true)

  //Display all the albums on the page
  displayAlbums();


  //Adding Event listener to previous,play and next button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "./assets/pause.svg";
    } else {
      currentSong.pause();
      play.src = "./assets/play.svg";
    }
  });

  //Adding Event Listener to get duration of a song in  minutes and seconds

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)} /
     ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (currentSong.currentTime === currentSong.duration) {

      playMusic(songs[index + 1])

      if ((index + 1) > songs.length - 1) {
        playMusic(songs[0])
      }

    }

  });


  //Add an event listener to seekbar so that we can slide the seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%"
    //For updating duration according to the seekbar
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })


  //Add an event listener for hamburger
  let hamburger = document.querySelector(".hamburger");

  hamburger.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";

  })

  //Add event listener for close menu
  let close = document.querySelector(".close");
  close.addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  })




  //Add an event listener of previous

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
    else if ((index - 1) < songs.length - 1) {
      playMusic(songs[songs.length - 1])
    }
  })


  //Add an event listener of next
  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])

    } else if ((index + 1) > songs.length - 1) {
      playMusic(songs[0])
    }
  })



  //Add an event listener to volume to adjust the volume of a song

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    } else if (currentSong.volume === 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
    }
  })

  //Add event listener to mute the volume

  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;

      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = 0.10
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })
}


main();




// // Import Firebase SDK
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getStorage, ref, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// // Firebase Configuration
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);

// // Function to fetch songs from Firebase Storage
// async function getSongs() {
//     const songsRef = ref(storage, 'songs/'); // Path in Firebase Storage
//     try {
//         const songList = await listAll(songsRef);
//         const songs = await Promise.all(
//             songList.items.map(async (song) => {
//                 const url = await getDownloadURL(song);
//                 return { filename: song.name, url };
//             })
//         );
//         return songs;
//     } catch (error) {
//         console.error("Error fetching songs from Firebase:", error);
//         return [];
//     }
// }

// // Function to fetch album metadata from Firebase
// async function getAlbums() {
//     const albumRef = ref(storage, 'info.json');
//     try {
//         const albumURL = await getDownloadURL(albumRef);
//         const response = await fetch(albumURL);
//         const albums = await response.json();
//         return albums;
//     } catch (error) {
//         console.error("Error fetching album metadata:", error);
//         return [];
//     }
// }

// // Function to display songs
// async function displaySongs() {
//     const songs = await getSongs();
//     const songContainer = document.getElementById("song-container");
//     songContainer.innerHTML = "";

//     songs.forEach(song => {
//         const songElement = document.createElement("div");
//         songElement.className = "song";
//         songElement.innerHTML = `<p>${song.filename}</p><audio controls><source src="${song.url}" type="audio/mpeg"></audio>`;
//         songContainer.appendChild(songElement);
//     });
// }

// // Function to display albums
// async function displayAlbums() {
//     const albums = await getAlbums();
//     const albumContainer = document.getElementById("album-container");
//     albumContainer.innerHTML = "";

//     albums.forEach(album => {
//         const albumElement = document.createElement("div");
//         albumElement.className = "album";
//         albumElement.innerHTML = `<img src="${album.cover}" alt="${album.name}"><p>${album.name}</p>`;
//         albumContainer.appendChild(albumElement);
//     });
// }

// // Load songs and albums when the page loads
// document.addEventListener("DOMContentLoaded", async () => {
//     await displaySongs();
//     await displayAlbums();
// });
