// ============================================================
// Part 2, "Used. Broken. Binned." (page: part2.html)
//
// assets/decay-sheet.png is one row of 12 frames. The CSS shows one frame at
// a time by moving the sheet sideways (see #story-sprite in style.css).
//   - Each press sets the frame number --f; a stepped transition makes it jump.
//   - "Watch it all" adds the class "auto", which plays all frames with steps().
// The words and numbers come from data/waste.json.
// ============================================================

const storyScene = document.getElementById("story-scene");
const storySprite = document.getElementById("story-sprite");
const storyWrap = document.getElementById("story-wrap");
const storyBar = document.getElementById("story-bar-fill");
const storyCount = document.getElementById("story-count");
const storyCaption = document.getElementById("story-caption");
const storyPress = document.getElementById("story-press");
const storyAuto = document.getElementById("story-auto");
const storyReset = document.getElementById("story-reset");
const storyFacts = document.getElementById("story-facts");

let story = null;          // filled in once waste.json has loaded
let frame = 0;             // which frame of the sheet is showing (0 to 11)
let presses = 0;
let phase = "play";        // "play", "auto", "ready" (broken), "tossing", "binned"
let autoTimer = null;

async function startStory() {
  try {
    const response = await fetch("data/waste.json");
    story = await response.json();
  } catch (error) {
    storyCaption.textContent =
      "Could not load data/waste.json. Serve this folder with a local web server (see README).";
    return;
  }
  renderStory();
}

function lastFrame() {
  return story.captions.length - 1;
}

function renderStory() {
  const last = lastFrame();
  storySprite.style.setProperty("--f", frame);

  // The durability bar drains as the frames advance
  const percent = ((last - frame) / last) * 100;
  storyBar.style.width = percent + "%";
  storyBar.style.backgroundColor =
    percent > 60 ? "var(--green-light)" : percent > 25 ? "var(--taupe)" : "var(--red)";

  storyCount.textContent = presses;

  const caption = story.captions[frame];
  storyCaption.innerHTML = caption[0] + (caption[1] ? "<small>" + caption[1] + "</small>" : "");
  storySprite.setAttribute("aria-label", "Controller damage stage " + (frame + 1) + " of " + (last + 1) + ": " + caption[0]);

  storyScene.classList.toggle("has-bin", frame === last);
  storyPress.textContent = phase === "ready" ? "Throw it away" : "Press";
  storyPress.classList.toggle("danger", phase === "ready");
}

function setStoryBusy(busy) {
  storyPress.disabled = busy;
  storyAuto.disabled = busy;
}

// One press: move to the next frame
function advanceStory() {
  if (phase === "play" && frame < lastFrame()) {
    frame++;
    presses++;
    if (frame === lastFrame()) {
      phase = "ready";
    }
    renderStory();
  } else if (phase === "ready") {
    tossStory();
  }
}

// The last press: throw the controller into the bin
function tossStory() {
  phase = "tossing";
  setStoryBusy(true);
  storyScene.classList.add("toss");
  storyCaption.textContent = story.tossing;
}

// Fill the facts below the animation from waste.json
function showStoryFacts() {
  document.getElementById("story-facts-title").textContent = story.title;
  document.getElementById("story-facts-intro").textContent = story.intro;
  document.getElementById("story-note").textContent = story.note;
  document.getElementById("story-source").innerHTML =
    'Source: <a href="' + story.url + '" target="_blank">' + story.source + "</a>";

  const cards = document.getElementById("story-cards");
  cards.innerHTML = "";
  story.stats.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("stat");
    card.innerHTML = "<b>" + item.n + "</b><span>" + item.text + "</span>";
    cards.appendChild(card);
  });
  storyFacts.hidden = false;
}

// "Watch it all": play the whole sheet with a stepped CSS animation
function playStory() {
  resetStory();
  setStoryBusy(true);
  phase = "auto";
  const seconds = parseFloat(getComputedStyle(storySprite).getPropertyValue("--auto-dur")) || 3.6;
  renderStory();
  void storySprite.offsetWidth;                 // restart the animation
  storySprite.classList.add("auto");

  // Keep the caption and the bar in step with the animation
  autoTimer = setInterval(() => {
    if (frame < lastFrame()) {
      frame++;
      presses++;
      renderStory();
    }
  }, (seconds * 1000) / lastFrame());
}

function resetStory() {
  clearInterval(autoTimer);
  storySprite.classList.remove("auto");
  storyScene.classList.remove("toss", "gone", "has-bin");
  storyFacts.hidden = true;
  frame = 0;
  presses = 0;
  phase = "play";
  setStoryBusy(false);
  renderStory();
}

// The CSS animations tell us when they are finished
storySprite.addEventListener("animationend", (event) => {
  if (event.animationName === "story-play") {
    clearInterval(autoTimer);
    storySprite.classList.remove("auto");
    frame = lastFrame();
    phase = "ready";
    renderStory();
    setStoryBusy(false);
    storyAuto.disabled = true;
  }
  if (event.animationName === "story-toss") {
    storyScene.classList.remove("toss");
    storyScene.classList.add("gone");
    phase = "binned";
    storyCaption.textContent = story.binned;
    storyPress.disabled = true;
    showStoryFacts();
    setTimeout(() => storyFacts.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  }
});

storyPress.addEventListener("click", advanceStory);
storyWrap.addEventListener("click", () => {
  if (story && (phase === "play" || phase === "ready")) {
    advanceStory();
  }
});
storyAuto.addEventListener("click", () => story && playStory());
storyReset.addEventListener("click", () => story && resetStory());

startStory();
