const popup = document.getElementById("popup");
const closeIcon = document.getElementById("close");
const toggleCamera = document.getElementById("toggle-camera");
const startBtn = document.getElementById("startRecordingBtn");
const pauseBtn = document.getElementById("pauseRecordingBtn");
const stopBtn = document.getElementById("stopRecordingBtn");
const deleteBtn = document.getElementById("deleteRecordingBtn");
const timerDisplay = document.getElementById("timerDisplay");
const recordingContainer = document.getElementById("recordingContainer");
const pauseIcon = document.getElementById("pause");
const loading = document.getElementById("loading");

const closeModal = () => {
  document.body.style.display = "none";
};

closeIcon.addEventListener("click", closeModal);

let stream;
let recorder;
const chunks = [];

let isRecording = false;
let recordingInterval;
let startTime;
let pausedTime = 0;

startBtn.addEventListener("click", async () => {
  document.body.style.width = "900px";
  document.body.style.height = "800px";
  try {
    if (!isRecording) {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      popup.style.display = "none";
      recorder = new MediaRecorder(stream);
      isRecording = true;
      startTime = Date.now() - pausedTime;
      recordingInterval = setInterval(updateTimer, 1000);
      timerDisplay.textContent = "00:00:00";
      recorder.start();

      recordingContainer.style.display = "flex";
      document.body.style.width = "552px";
      document.body.style.height = "90px";
      document.body.style.backgroundColor = "transparent";

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      deleteBtn.disabled = false;

      console.log("Screen recording started");
    }
  } catch (error) {
    console.error("Error starting screen recording:", error);
  }
});

pauseBtn.addEventListener("click", () => {
  if (isRecording) {
    if (recorder.state === "recording") {
      recorder.pause();
      clearInterval(recordingInterval);
      pauseIcon.textContent = "Resume";
      pausedTime = Date.now() - startTime;
    } else if (recorder.state === "paused") {
      recorder.resume();
      recordingInterval = setInterval(updateTimer, 1000);
      pauseIcon.textContent = "Pause";
      startTime = Date.now() - pausedTime;
    }
  }
});

stopBtn.addEventListener("click", () => {
  if (isRecording) {
    recorder.stop();
    clearInterval(recordingInterval);
    isRecording = false;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    deleteBtn.disabled = false;

    recordingContainer.style.display = "none";
    popup.style.display = "none";
    setTimeout(() => {
      const blob = new Blob(chunks, { type: "video/webm" });

      const formData = new FormData();
      formData.append("video", blob, "screen-recording.webm");

      postData(formData);
    }, 5000);
    document.body.style.width = "150px";
    document.body.style.height = "150px";
    loading.style.display = "block";

    console.log("Screen recording stopped");
  }
});

deleteBtn.addEventListener("click", () => {
  if (isRecording) {
    recorder.stop();
    isRecording = false;
    chunks.length = 0;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    deleteBtn.disabled = true;

    recordingContainer.style.display = "none";
    popup.style.display = "none";

    document.body.style.width = "150px";
    document.body.style.height = "150px";
  }
});

function updateTimer() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;
  const formattedTime = formatTime(elapsedTime);
  timerDisplay.textContent = formattedTime;
}

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
