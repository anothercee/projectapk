// app.js - EcoLife Buddy (web) - simple & beginner friendly
// Uses localStorage for persistence. Comments included.

const selectors = {
  tabs: document.querySelectorAll(".tabs button"),
  sections: document.querySelectorAll(".tabcontent"),
  dailyTip: document.getElementById("dailyTip"),

  // habit
  habitList: document.getElementById("habitList"),
  newHabit: document.getElementById("newHabit"),
  addHabitBtn: document.getElementById("addHabitBtn"),
  habitProgress: document.getElementById("habitProgress"),
  habitProgressBar: document.getElementById("habitProgressBar"),

  // carbon
  acHours: document.getElementById("acHours"),
  motorTrips: document.getElementById("motorTrips"),
  plasticCount: document.getElementById("plasticCount"),
  calcBtn: document.getElementById("calcBtn"),
  carbonScore: document.getElementById("carbonScore"),
  carbonAdvice: document.getElementById("carbonAdvice"),

  // facts
  factsArea: document.getElementById("factsArea"),

  // quiz
  startQuizBtn: document.getElementById("startQuizBtn"),
  nextQBtn: document.getElementById("nextQBtn"),
  quizQuestion: document.getElementById("quizQuestion"),
  quizOptions: document.getElementById("quizOptions"),
  quizResult: document.getElementById("quizResult"),

  // badges
  badgesArea: document.getElementById("badgesArea"),
  challenges: document.getElementById("challenges"),

  // navigation helpers
  goHabit: document.getElementById("goHabit"),
  goCalculator: document.getElementById("goCalculator"),
  goQuiz: document.getElementById("goQuiz")
};

// ---------- ROUTING / TABS ----------
selectors.tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    selectors.tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const target = btn.dataset.tab;
    selectors.sections.forEach(s => {
      s.id === target ? s.classList.remove("hidden") : s.classList.add("hidden");
    });
  });
});

// quick nav
if (selectors.goHabit) selectors.goHabit.onclick = () => activateTab("utility");
if (selectors.goCalculator) selectors.goCalculator.onclick = () => activateTab("utility");
if (selectors.goQuiz) selectors.goQuiz.onclick = () => activateTab("fun");
function activateTab(id) {
  document.querySelector(`.tabs button[data-tab="${id}"]`).click();
}

// ---------- DATA STORAGE ----------
const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// ---------- HABIT TRACKER ----------
let habits = storage.get("habits", [
  "Bawa botol minum sendiri",
  "Matikan lampu yang tidak digunakan",
  "Memilah sampah"
]);
let completed = new Set(storage.get("completed", []));

function renderHabits() {
  selectors.habitList.innerHTML = "";
  habits.forEach((h, idx) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = h;
    const controls = document.createElement("div");

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = completed.has(h);
    chk.onchange = () => {
      if (chk.checked) completed.add(h);
      else completed.delete(h);
      storage.set("completed", Array.from(completed));
      updateProgress();
      checkBadges();
    };

    const del = document.createElement("button");
    del.textContent = "hapus";
    del.onclick = () => {
      habits.splice(idx, 1);
      storage.set("habits", habits);
      renderHabits();
      updateProgress();
    };

    controls.appendChild(chk);
    controls.appendChild(del);
    li.appendChild(text);
    li.appendChild(controls);
    selectors.habitList.appendChild(li);
  });
  updateProgress();
}

selectors.addHabitBtn.onclick = () => {
  const v = selectors.newHabit.value.trim();
  if (!v) return alert("Masukkan nama kebiasaan.");
  habits.push(v);
  storage.set("habits", habits);
  selectors.newHabit.value = "";
  renderHabits();
};

function updateProgress() {
  const total = habits.length;
  const done = Array.from(completed).filter(h => habits.includes(h)).length;
  selectors.habitProgress.textContent = `${done}/${total}`;
  selectors.habitProgressBar.max = total || 1;
  selectors.habitProgressBar.value = done;
}

// ---------- CARBON CALCULATOR ----------
selectors.calcBtn.onclick = () => {
  // formula sederhana: score = acHours*2 + motorTrips*3 + plasticCount*1
  const ac = Number(selectors.acHours.value) || 0;
  const motor = Number(selectors.motorTrips.value) || 0;
  const plast = Number(selectors.plasticCount.value) || 0;
  const score = Math.round(ac * 2 + motor * 3 + plast * 1);
  selectors.carbonScore.textContent = score;
  let advice = "";
  if (score <= 3) advice = "Jejak karbon rendah. Pertahankan!";
  else if (score <= 8) advice = "Jejak sedang. Kurangi pemakaian plastik dan durasi AC.";
  else advice = "Jejak tinggi. Pertimbangkan transportasi ramah lingkungan dan hemat listrik.";
  selectors.carbonAdvice.textContent = advice;
};

// ---------- FACTS & TIPS ----------
const FACTS = [
  "Satu botol plastik membutuhkan ratusan tahun untuk terurai.",
  "Mematikan charger setelah digunakan dapat menghemat listrik kecil tapi konsisten.",
  "Transportasi umum mengurangi emisi per orang dibanding kendaraan pribadi.",
  "Memilah sampah membantu proses daur ulang lebih efisien."
];
const TIPS = [
  "Bawa tas belanja kain agar tidak memakai kantong plastik.",
  "Gunakan lampu LED untuk menghemat energi.",
  "Rawat tanaman di rumah untuk kualitas udara yang lebih baik."
];

function renderFacts() {
  const area = selectors.factsArea;
  area.innerHTML = "";
  // show 2 facts + 1 tip randomly
  const shuffled = FACTS.sort(() => 0.5 - Math.random());
  const f1 = document.createElement("p");
  f1.textContent = `• ${shuffled[0]}`;
  const f2 = document.createElement("p");
  f2.textContent = `• ${shuffled[1] || shuffled[0]}`;
  const tip = document.createElement("p");
  tip.innerHTML = `<strong>Tip:</strong> ${TIPS[Math.floor(Math.random()*TIPS.length)]}`;
  area.appendChild(f1);
  area.appendChild(f2);
  area.appendChild(tip);
  // daily tip
  selectors.dailyTip.textContent = TIPS[Math.floor(Math.random()*TIPS.length)];
}

// ---------- QUIZ ----------
const QUIZ = [
  {q:"Apa yang termasuk sampah organik?", options:["Botol plastik","Sisa makanan","Kantong plastik"], a:1},
  {q:"Apa manfaat membawa tumbler sendiri?", options:["Mengurangi sampah plastik","Membuat minuman lebih enak","Menghabiskan lebih banyak uang"], a:0},
  {q:"Pilihan transportasi yang lebih ramah lingkungan:", options:["Motor pribadi untuk jarak pendek","Berjalan kaki / bersepeda","Semua pilihanku"], a:1}
];

let quizIndex = 0;
let score = 0;

function startQuiz(){
  quizIndex = 0;
  score = 0;
  selectors.quizResult.textContent = "";
  selectors.startQuizBtn.classList.add("hidden");
  selectors.nextQBtn.classList.remove("hidden");
  loadQuestion();
}

function loadQuestion(){
  const q = QUIZ[quizIndex];
  selectors.quizQuestion.textContent = q.q;
  selectors.quizOptions.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      if (i === q.a) {
        score++;
        btn.classList.add("correct");
      } else {
        btn.classList.add("wrong");
        // mark correct
        const correctBtn = Array.from(selectors.quizOptions.children)[q.a];
        if (correctBtn) correctBtn.classList.add("correct");
      }
      // disable all options
      Array.from(selectors.quizOptions.children).forEach(el => el.disabled = true);
      // save badge if all correct at end
    };
    selectors.quizOptions.appendChild(btn);
  });
}

selectors.startQuizBtn.onclick = startQuiz;
selectors.nextQBtn.onclick = () => {
  quizIndex++;
  if (quizIndex >= QUIZ.length) {
    endQuiz();
  } else {
    loadQuestion();
  }
};

function endQuiz(){
  selectors.quizResult.textContent = `Selesai! Skor: ${score} / ${QUIZ.length}`;
  selectors.nextQBtn.classList.add("hidden");
  selectors.startQuizBtn.classList.remove("hidden");
  // award badge if score==all or >= threshold
  if (score === QUIZ.length) {
    awardBadge("Quiz Master");
  } else if (score >= Math.ceil(QUIZ.length * 0.7)) {
    awardBadge("Smart Green");
  }
  renderBadges();
}

// ---------- BADGES ----------
let badges = new Set(storage.get("badges", []));
function awardBadge(name){
  if (!badges.has(name)) {
    badges.add(name);
    storage.set("badges", Array.from(badges));
    alert(`Selamat! Kamu mendapatkan badge: ${name}`);
  }
}
function renderBadges(){
  const arr = Array.from(badges);
  if (arr.length === 0) {
    selectors.badgesArea.textContent = "Belum ada badge — selesaikan habit/quiz untuk mendapatkan badge.";
    return;
  }
  selectors.badgesArea.innerHTML = "";
  arr.forEach(b => {
    const span = document.createElement("span");
    span.textContent = `🏅 ${b}`;
    span.style.padding = "6px 10px";
    span.style.marginRight = "8px";
    selectors.badgesArea.appendChild(span);
  });
}

// badges by habit completion
function checkBadges(){
  const done = Array.from(completed).filter(h => habits.includes(h)).length;
  if (done >= habits.length && habits.length>0) {
    awardBadge("Eco Consistent");
  }
  renderBadges();
}

// ---------- CHALLENGES ----------
document.querySelectorAll('#challenges input[type="checkbox"]').forEach(cb=>{
  cb.checked = storage.get('ch_'+cb.dataset.ch, false);
  cb.onchange = () => {
    storage.set('ch_'+cb.dataset.ch, cb.checked);
  };
});

// ---------- INIT ----------
renderHabits();
renderFacts();
renderBadges();
updateProgress();
