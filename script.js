// =====================================================
// Scifeon Sales Academy Interactive Training Engine
// =====================================================

// ---------- GLOBAL VARIABLES ----------
let lessons = [];
let currentLessonIndex = 0;
const lessonList = document.getElementById("lessonList");
const lessonContent = document.getElementById("lessonContent");

// ---------- LOAD LESSONS ----------
async function loadLessonList() {
  const lessonFiles = [
    "module-0.json",
    "module-1.json",
    "module-2.json",
    "module-3.json",
    "module-4.json",
    "module-5.json",
    "module-6.json"
  ];

  lessons = await Promise.all(
    lessonFiles.map(async (file) => {
      try {
        const response = await fetch(`lessons/${file}`);
        if (!response.ok) throw new Error(`Could not load ${file}`);
        return await response.json();
      } catch (e) {
        console.error(e);
        return null;
      }
    })
  );

  renderLessonList();
}

// ---------- RENDER LESSON LIST ----------
function renderLessonList() {
  lessonList.innerHTML = "";
  lessons.forEach((lesson, index) => {
    if (!lesson) return;
    const li = document.createElement("li");
    li.textContent = lesson.title;
    li.className = "lesson-item";

    const progress = localStorage.getItem(lesson.id);
    if (progress === "complete") li.classList.add("complete");

    li.addEventListener("click", () => loadLesson(index));
    lessonList.appendChild(li);
  });
}

// ---------- LOAD LESSON ----------
function loadLesson(index) {
  const lesson = lessons[index];
  if (!lesson) return;
  currentLessonIndex = index;

  let html = `
    <h2>${lesson.title}</h2>
    ${lesson.content || ""}
  `;

  // If lesson contains structured quiz data
  if (lesson.quiz && Array.isArray(lesson.quiz)) {
    html += `<h3>Knowledge Check</h3>`;
    lesson.quiz.forEach((q, qi) => {
      html += `
        <div class="quiz-question" data-q="${qi}">
          <p><strong>${qi + 1}. ${q.question}</strong></p>
          ${q.options
            .map(
              (opt, oi) =>
                `<label class="option"><input type="radio" name="q${qi}" value="${oi}"> ${opt}</label>`
            )
            .join("<br>")}
          <div class="quiz-feedback" id="feedback-${qi}"></div>
        </div>
      `;
    });

    html += `<button id="checkAnswers">Check Answers</button>`;
    html += `<div id="scoreSummary"></div>`;
  }

  lessonContent.innerHTML = html;

  const checkBtn = document.getElementById("checkAnswers");
  if (checkBtn) checkBtn.addEventListener("click", () => checkQuiz(lesson));
}

// ---------- QUIZ CHECKING FUNCTION ----------
function checkQuiz(lesson) {
  let score = 0;
  lesson.quiz.forEach((q, qi) => {
    const selected = document.querySelector(
      `input[name="q${qi}"]:checked`
    );
    const feedbackDiv = document.getElementById(`feedback-${qi}`);

    if (!selected) {
      feedbackDiv.innerHTML =
        "<p style='color:gray'>No answer selected.</p>";
      return;
    }

    const selectedIndex = parseInt(selected.value);
    const isCorrect = selectedIndex === q.answer;

    if (isCorrect) {
      score++;
      feedbackDiv.innerHTML = `<p style='color:green'><strong>Correct:</strong> ${q.explanation}</p>`;
    } else {
      feedbackDiv.innerHTML = `<p style='color:red'><strong>Incorrect:</strong> ${q.explanation}</p>`;
    }
  });

  const total = lesson.quiz.length;
  const percent = Math.round((score / total) * 100);
  const summary = document.getElementById("scoreSummary");

  let color =
    percent >= 80 ? "green" : percent >= 50 ? "orange" : "red";

  summary.innerHTML = `
    <h4 style='color:${color}'>You scored ${score}/${total} (${percent}%)</h4>
  `;

  // Mark progress complete
  if (percent >= 80) {
    localStorage.setItem(lesson.id, "complete");
    renderLessonList();
  }
}

// ---------- INIT ----------
document.addEventListener("DOMContentLoaded", loadLessonList);

