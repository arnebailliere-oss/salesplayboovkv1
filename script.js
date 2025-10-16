const lessons = [
  { id: "module-0", title: "Enterprise Mindset" },
  { id: "module-1", title: "Understanding the Buyer" },
  { id: "module-2", title: "Challenger Sales Method" },
  { id: "module-3", title: "Proposal Structure & Tone" },
  { id: "module-4", title: "Risk & Governance" },
  { id: "module-5", title: "Process Discipline (QA & Versioning)" },
  { id: "module-6", title: "Language & Localization Standards" }
];

const list = document.getElementById("lesson-list");
const container = document.getElementById("lesson-container");

// Build sidebar navigation
lessons.forEach(l => {
  const btn = document.createElement("button");
  btn.textContent = l.title;
  btn.onclick = () => loadLesson(l.id, btn);
  list.appendChild(btn);
});

// Load first lesson by default
loadLesson("module-0");

function loadLesson(id, activeBtn) {
  if (activeBtn) {
    document.querySelectorAll("#lesson-list button").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
  }
  fetch(`lessons/${id}.json`)
    .then(r => r.json())
    .then(data => renderLesson(data))
    .catch(err => {
      container.innerHTML = `<p style='color:red'>Could not load lesson: ${err}</p>`;
    });
}

function renderLesson(data) {
  let html = `<h2>${data.title}</h2>${data.content}`;

  if (data.exercises?.length) {
    html += `<div class='exercise'><h3>Exercises</h3><ul>`;
    data.exercises.forEach(ex => {
      html += `<li>${ex.instruction}</li>`;
    });
    html += `</ul></div>`;
  }

  if (data.quiz?.length) {
    html += `<div class='quiz'><h3>Quiz</h3>`;
    data.quiz.forEach((q, i) => {
      html += `<div class='quiz-question'>
        <strong>${i + 1}. ${q.question}</strong>`;
      q.options.forEach(opt => {
        html += `<label class='quiz-option'>
          <input type='radio' name='q${i}' value='${opt}'> ${opt}
        </label>`;
      });
      html += `</div>`;
    });
    html += `<button class='submit-quiz'>Check Answers</button></div>`;
  }

  container.innerHTML = html;

  const btn = container.querySelector(".submit-quiz");
  if (btn) {
    btn.addEventListener("click", () => {
      let score = 0;
      data.quiz.forEach((q, i) => {
        const chosen = document.querySelector(`input[name=q${i}]:checked`);
        if (chosen && chosen.value === q.answer) score++;
      });
      alert(`Score: ${score}/${data.quiz.length}`);
    });
  }
}
