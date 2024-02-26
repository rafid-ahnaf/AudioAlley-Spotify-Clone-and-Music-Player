console.log("Running...");
let currentSong = new Audio();
let songs;
let curfolder;

function formatTime(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0"); // Adding leading zero if necessary
  const formattedSeconds = String(seconds).padStart(2, "0"); // Adding leading zero if necessary
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  curfolder = folder;
  let a = await fetch(`/songs/${curfolder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`songs/${curfolder}/`)[1]);
    }
  }
  //Showing all songs in the library section
  let songsUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songsUL.innerHTML = "";
  for (const song of songs) {
    let nameNart = song.split("_");
    songsUL.innerHTML =
      songsUL.innerHTML +
      `<li>
                <img src="svgs/music.svg" alt="">
                <div class="info">
                  <div class="songName">${nameNart[1].replaceAll(
                    "%20",
                    " "
                  )}</div>
                  <di class="artist">${nameNart[0].replaceAll("%20", " ")}</di>
                </div>
                <div class="baseControl">
                  <img src="svgs/playbar_svgs/play.svg" alt="play" />
                <p>play</p>
                </div>
            </li>`;
  }

  //attaching an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      let partialName = e.querySelector(".info").firstElementChild.innerHTML;
      let fullName;
      for (const song of songs) {
        if (song.replaceAll("%20", " ").includes(partialName)) {
          fullName = song;
        }
      }
      playMusic(fullName);
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `songs/${curfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "svgs/playbar_svgs/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = track.replaceAll("%20", " ");
  document.querySelector(".songDuration").innerHTML = "00:00/00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folderName = e.href.split("/")[4];

      let a = await fetch(`/songs/${folderName}/info.json`);
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folderName}" class="card">
        <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 30 30">
                  <!-- Green circle background with padding -->
                  <circle cx="11" cy="12" r="11" fill="#1EDA62" />

                  <!-- White path (centered within the circle with padding) -->
                  <path
                    d="M8 7L16 12L8 17V7Z"
                    fill="#000000"
                    stroke="#000000"
                    stroke-width="1.5"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <img
                src="/songs/${folderName}/cover.jpg"
                alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }
  //load the playlist once the card is clicked.
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      await getSongs(item.currentTarget.dataset.folder);
      playMusic(songs[0]);
    });
  });
}

//-------------------------------------------------------------------

async function main() {
  //getting list of all songs
  await getSongs("nsc");
  playMusic(songs[0], true);

  //Displaying albums on page
  displayAlbums();

  //Showing all songs in the library section
  let songsUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    let nameNart = song.split("_");
    songsUL.innerHTML =
      songsUL.innerHTML +
      `<li>
                <img src="svgs/music.svg" alt="">
                <div class="info">
                  <div class="songName">${nameNart[1].replaceAll(
                    "%20",
                    " "
                  )}</div>
                  <di class="artist">${nameNart[0].replaceAll("%20", " ")}</di>
                </div>
                <div class="baseControl">
                  <img src="svgs/playbar_svgs/play.svg" alt="play" />
                <p>play</p>
                </div>
            </li>`;
  }

  //attaching an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", () => {
      let partialName = e.querySelector(".info").firstElementChild.innerHTML;
      let fullName;
      for (const song of songs) {
        if (song.replaceAll("%20", " ").includes(partialName)) {
          fullName = song;
        }
      }
      playMusic(fullName);
    });
  });

  //attach an event listener to play, next and previous songs
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svgs/playbar_svgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svgs/playbar_svgs/play.svg";
    }
  });

  //attach event listener for timeupdate
  currentSong.addEventListener("timeupdate", () => {
    let curTime = formatTime(currentSong.currentTime);
    let dur = formatTime(currentSong.duration);
    document.querySelector(".songDuration").innerHTML = `${curTime} / ${dur}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //add event listener to seekbar
  document.querySelector(".seekbar-circle").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //add event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = 0 + "%";
  });

  //add event listener to cross
  document.querySelector(".cross").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = -110 + "%";
  });

  //add event listener to previous and next
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`songs/${curfolder}/`)[1]);
    if (index == 0) {
      index = songs.length - 1;
    } else {
      index = index - 1;
    }
    playMusic(songs[index]);
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split(`songs/${curfolder}/`)[1]);
    if (index + 1 == songs.length) {
      index = 0;
    } else {
      index = index + 1;
    }
    playMusic(songs[index]);
  });

  //add an event listener to volume
  volumeControl.addEventListener("change", (e) => {
    let imgSrc = document.querySelector(".volume img");
    if (e.target.value > 50) {
      imgSrc.src = "svgs/volume_svgs/maxvol.svg";
    } else if (e.target.value > 25) {
      imgSrc.src = "svgs/volume_svgs/midvol.svg";
    } else if (e.target.value > 0) {
      imgSrc.src = "svgs/volume_svgs/lowvol.svg";
    } else {
      imgSrc.src = "svgs/volume_svgs/mute.svg";
    }
    currentSong.volume = e.target.value / 100;
  });

  //adding click to mute
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("vol.svg")) {
      e.target.src = "/svgs/volume_svgs/mute.svg";
      currentSong.volume = 0;
      volumeControl.value = 0;
    } else {
      e.target.src = "/svgs/volume_svgs/midvol.svg";
      currentSong.volume = 0.5;
      volumeControl.value = 50;
    }
  });
}

main();
