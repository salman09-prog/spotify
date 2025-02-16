let currentSong = new Audio();
let songs;
let currFolder;

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

async function getSongs(folder) {
  currFolder = folder;
  
  // Update the fetch URL to use the correct GitHub pages URL
  let a = await fetch(`https://salman09-prog.github.io/spotify/${folder}/`);
  let response = await a.text();
  
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        <img class="invert" src="https://salman09-prog.github.io/spotify/assets/music.svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ").replaceAll("/", " ")}</div>
          <div>Salman</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="https://salman09-prog.github.io/spotify/assets/play.svg" alt="">
        </div>
      </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

function playMusic(track, pause = false) {
  // Update the audio source URL to use the GitHub pages URL
  currentSong.src = `https://salman09-prog.github.io/spotify/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "https://salman09-prog.github.io/spotify/assets/pause.svg";
  }
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
}

async function displayAlbums() {
  // Update the fetch URL to use the GitHub pages URL
  let a = await fetch(`https://salman09-prog.github.io/spotify/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = (e.href.split("/").slice(-1)[0]);

      // Update the metadata fetch URL
      let a = await fetch(`https://salman09-prog.github.io/spotify/songs/${folder}/info.json`);
      let response = await a.json();
      let cardContainer = document.querySelector(".cardContainer");
      cardContainer.innerHTML = cardContainer.innerHTML + `
        <div data-folder="${folder}" class="card">
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
              src="https://salman09-prog.github.io/spotify/songs/${folder}/cover.jpg"
              alt=""
            />
          </div>
          <h2>${response.title}</h2>
          <p>${response.description}</p>
        </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/charlie-puth");
  playMusic(songs[0], true);
  displayAlbums();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "https://salman09-prog.github.io/spotify/assets/pause.svg";
    } else {
      currentSong.pause();
      play.src = "https://salman09-prog.github.io/spotify/assets/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)} /
     ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (currentSong.currentTime === currentSong.duration) {
      if ((index + 1) < songs.length) {
        playMusic(songs[index + 1]);
      } else {
        playMusic(songs[0]);
      }
    }
  });

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  });

  let hamburger = document.querySelector(".hamburger");
  hamburger.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  let close = document.querySelector(".close");
  close.addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[songs.length - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[0]);
    }
  });

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
    } else {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg");
    }
  });

  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();