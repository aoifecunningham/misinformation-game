(() => {
  "use strict";

  const preQuestions = [
    {
      q: "You see a realistic-looking photo of a famous singer at a political rally. What is the best first step?",
      options: ["Share it because the photo looks realistic", "Look for reliable reporting or the original source", "Assume it is real if many people reposted it", "Judge whether the singer looks happy"],
      answer: 1,
      explain: "A realistic appearance and many reposts do not prove an image is authentic. Check reliable sources and the original context."
    },
    {
      q: "What does it mean when an image is AI-generated?",
      options: ["It was necessarily taken by a professional photographer", "It was created or altered using an artificial-intelligence system", "It must be a photograph of a real event", "It cannot look realistic"],
      answer: 1,
      explain: "AI tools can create entirely new images or modify existing ones. Some results can look very realistic."
    },
    {
      q: "Which detail is the strongest reason to pause before believing a viral image?",
      options: ["The post has lots of likes", "The image is colorful", "The account gives no source and trustworthy outlets do not confirm the event", "The person in the image is famous"],
      answer: 2,
      explain: "Missing sourcing and lack of independent confirmation are reasons to investigate rather than accept the claim."
    },
    {
      q: "If you are unsure whether an image is genuine, what is the safest response?",
      options: ["Share it with a warning that it might be true", "Do not share it until you can verify it", "Add a more dramatic caption", "Use the number of comments to decide"],
      answer: 1,
      explain: "Pausing before sharing reduces the spread of unverified claims."
    }
  ];

  const postQuestions = [
    {
      q: "A post claims a well-known actor attended an award ceremony, but the only evidence is one image. What should you conclude?",
      options: ["The image proves the actor attended", "The claim needs independent verification", "The claim is true if the actor's outfit looks appropriate", "The event must have happened because it is trending"],
      answer: 1,
      explain: "One image is not enough to establish that an event happened. Seek independent, trustworthy confirmation."
    },
    {
      q: "Which clue can sometimes reveal that an image has been generated or edited?",
      options: ["Inconsistent reflections, shadows, text, or background details", "A high-resolution image", "A familiar-looking location", "A caption with a date"],
      answer: 0,
      explain: "Visual inconsistencies can be clues, although AI images are improving and no single visual clue is a perfect test."
    },
    {
      q: "What is a reverse image search useful for?",
      options: ["Proving every image is real", "Finding where an image appeared before and whether it has been reused out of context", "Identifying every AI tool used", "Checking how many people liked a post"],
      answer: 1,
      explain: "A reverse image search may reveal an earlier version, original context, or unrelated event. It is one useful check, not a guarantee."
    },
    {
      q: "A friend shares a convincing AI-made image with a false caption. What is the most responsible action?",
      options: ["Repost it so others can decide", "Correct the claim politely and share a reliable source if available", "Assume the friend checked it", "Only report it if it has many likes"],
      answer: 1,
      explain: "A calm correction with reliable evidence can help limit misinformation without amplifying the false claim."
    }
  ];

  const state = {
    phase: "intro",
    index: 0,
    selected: null,
    pre: [],
    post: [],
    gameScore: 0,
    gameTrials: [],
    sessionId: makeSessionId(),
    startedAt: new Date().toISOString(),
    completedAt: null
  };

  const app = document.getElementById("app");
  const progressBar = document.getElementById("progress-bar");
  const stepLabel = document.getElementById("step-label");
  const progressCount = document.getElementById("progress-count");

  function makeSessionId() {
    return "MM-" + new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14) + "-" + Math.random().toString(36).slice(2, 7);
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }
  function setProgress(step, label, percent) {
    stepLabel.textContent = label;
    progressCount.textContent = step;
    progressBar.style.width = percent + "%";
  }
  function renderIntroStart() {
    document.getElementById("start-btn").addEventListener("click", () => {
      state.phase = "pre"; state.index = 0; renderQuestion();
    });
  }
  function renderQuestion() {
    const isPre = state.phase === "pre";
    const questions = isPre ? preQuestions : postQuestions;
    const prior = isPre ? state.pre : state.post;
    const q = questions[state.index];
    const total = 8;
    const overall = isPre ? state.index : 4 + state.index;
    setProgress(isPre ? "Step 1 of 4" : "Step 3 of 4", isPre ? "Pre-game questions" : "Post-game questions", (overall / total) * 100);
    app.innerHTML = `
      <div class="question-number">${isPre ? "Before the game" : "After the game"} · Question ${state.index + 1} of 4</div>
      <h2>${escapeHTML(q.q)}</h2>
      <div class="answers" role="group" aria-label="Answer choices">
        ${q.options.map((option, i) => `<button class="answer" data-choice="${i}" aria-pressed="false"><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHTML(option)}</span></button>`).join("")}
      </div>
      <div id="question-feedback"></div>
      <div class="button-row"><button id="continue-btn" class="primary" disabled>${state.index === 3 ? (isPre ? "Continue to the game →" : "See my results →") : "Next question →"}</button></div>
    `;
    app.querySelectorAll(".answer").forEach(button => {
      button.addEventListener("click", () => {
        state.selected = Number(button.dataset.choice);
        app.querySelectorAll(".answer").forEach(b => {
          b.classList.toggle("selected", b === button);
          b.setAttribute("aria-pressed", String(b === button));
        });
        document.getElementById("continue-btn").disabled = false;
      });
    });
    document.getElementById("continue-btn").addEventListener("click", () => {
      if (state.selected === null) return;
      const record = {
        phase: isPre ? "pre" : "post",
        question_number: state.index + 1,
        question: q.q,
        selected_answer: q.options[state.selected],
        correct_answer: q.options[q.answer],
        correct: state.selected === q.answer,
        explanation: q.explain
      };
      prior.push(record);
      state.selected = null;
      if (state.index < 3) { state.index++; renderQuestion(); }
      else if (isPre) { state.phase = "game"; state.index = 0; renderGame(); }
      else { state.phase = "results"; renderResults(); }
    });
  }

  const gameRounds = [
    {
      title: "The Gala Photo",
      claim: "A viral post says fictional pop star Nova Reed attended the Moonlight Awards last night.",
      prompt: "What should you do before accepting the claim?",
      options: ["Believe it because the image looks convincing", "Check event coverage and Nova Reed's verified channels", "Assume it is true because the post has thousands of likes"],
      answer: 1,
      teaching: "Correct approach: verify the event with independent coverage and the person's official channels. A realistic-looking image is not proof."
    },
    {
      title: "Spot the Clue",
      claim: "Look at the simulated image card. It is labeled as an AI-created illustration, not a photograph.",
      prompt: "Which statement is most accurate?",
      options: ["AI images can look realistic, so appearance alone is not enough", "AI images always have obvious errors", "A polished image must be authentic"],
      answer: 0,
      teaching: "AI-generated images can be highly convincing. Odd hands, text, shadows, reflections, or backgrounds can be clues, but their absence does not prove authenticity."
    },
    {
      title: "Check the Context",
      claim: "A screenshot is reposted with a new caption claiming it shows a different event.",
      prompt: "Which check could help uncover the original context?",
      options: ["Count the reposts", "Use reverse image search and compare dates and sources", "Trust the newest caption"],
      answer: 1,
      teaching: "Reverse image search can help locate earlier appearances of an image. Compare the original source, date, location, and reliable reporting."
    }
  ];

  function renderGame() {
    setProgress("Step 2 of 4", "Play the game", 50 + (state.index / gameRounds.length) * 12);
    const r = gameRounds[state.index];
    app.innerHTML = `
      <div class="question-number">Misinformation detective · Round ${state.index + 1} of ${gameRounds.length}</div>
      <h2>${escapeHTML(r.title)}</h2>
      <div class="visual-post">
        <div class="post-top"><div class="account"><span class="avatar">✦</span><span>PopCultureDaily <span class="small">· simulated post</span></span></div><span class="tag">UNVERIFIED CLAIM</span></div>
        <div class="sim-image" role="img" aria-label="Stylized fictional awards-event illustration, not a real photograph">
          <div><div class="stage">🎤 ✨ 🎭</div><div class="image-caption">SIMULATED AI IMAGE · FICTIONAL SCENE</div></div>
        </div>
        <div class="post-copy"><strong>Viral caption:</strong> ${escapeHTML(r.claim)}<br><span class="small">This is a fictional scenario created for the experiment.</span></div>
      </div>
      <h3>${escapeHTML(r.prompt)}</h3>
      <div class="answers">
        ${r.options.map((option, i) => `<button class="answer" data-choice="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${escapeHTML(option)}</span></button>`).join("")}
      </div>
      <div id="game-feedback"></div>
      <div class="button-row"><button id="game-submit" class="primary" disabled>Check answer</button></div>
    `;
    let choice = null;
    app.querySelectorAll(".answer").forEach(button => button.addEventListener("click", () => {
      choice = Number(button.dataset.choice);
      app.querySelectorAll(".answer").forEach(b => b.classList.toggle("selected", b === button));
      document.getElementById("game-submit").disabled = false;
    }));
    document.getElementById("game-submit").addEventListener("click", () => {
      if (choice === null) return;
      const correct = choice === r.answer;
      if (correct) state.gameScore++;
      state.gameTrials.push({
        phase: "game",
        question_number: state.index + 1,
        question: r.prompt,
        selected_answer: r.options[choice],
        correct_answer: r.options[r.answer],
        correct,
        explanation: r.teaching
      });
      const feedback = document.getElementById("game-feedback");
      feedback.className = "feedback " + (correct ? "good" : "bad");
      feedback.textContent = (correct ? "That's right! " : "Not quite. ") + r.teaching;
      const submit = document.getElementById("game-submit");
      const nextButton = submit.cloneNode(true);
      nextButton.disabled = false;
      nextButton.textContent = state.index === gameRounds.length - 1 ? "Finish game →" : "Next round →";
      submit.replaceWith(nextButton);
      nextButton.addEventListener("click", () => {
        state.index++;
        if (state.index < gameRounds.length) renderGame();
        else { state.phase = "lesson"; renderLesson(); }
      }, { once: true });
    });
  }

  function renderLesson() {
    setProgress("Step 2 of 4", "Learn about misinformation", 66);
    app.innerHTML = `
      <div class="question-number">The takeaway</div>
      <h2>Pause before you believe or share.</h2>
      <p>AI can create realistic images of people, places, and events that never existed. A picture may be fabricated, edited, or real but presented with a false caption. The key skill is to verify both the image and the story attached to it.</p>
      <div class="lesson-grid">
        <div class="lesson"><h3>1. Check the source</h3><p>Who first posted it? Is the account authentic? Can you find the original image?</p></div>
        <div class="lesson"><h3>2. Verify the event</h3><p>Look for independent reporting, official event records, and statements from reliable sources.</p></div>
        <div class="lesson"><h3>3. Inspect carefully</h3><p>Notice unusual text, reflections, shadows, hands, objects, or inconsistent backgrounds. These are clues, not proof.</p></div>
        <div class="lesson"><h3>4. Check the context</h3><p>Try a reverse image search. An authentic image can still be misleading if its date, place, or caption is wrong.</p></div>
      </div>
      <div class="notice"><strong>Remember:</strong> You usually cannot determine whether an image is AI-generated just by looking at it. Verification from trustworthy sources matters more than visual guesswork.</div>
      <p class="small">In this experiment, Nova Reed and the Moonlight Awards are fictional. The event image is a designed illustration, not documentary evidence.</p>
      <button id="to-post" class="primary">I’m ready for the final questions →</button>
    `;
    document.getElementById("to-post").addEventListener("click", () => {
      state.phase = "post"; state.index = 0; renderQuestion();
    });
  }

  function csvCell(value) {
    const s = String(value ?? "");
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function downloadCSV(filename, rows, headers) {
    const csv = [headers.map(csvCell).join(","), ...rows.map(row => headers.map(h => csvCell(row[h])).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderResults() {
    state.completedAt = new Date().toISOString();
    const preCorrect = state.pre.filter(x => x.correct).length;
    const postCorrect = state.post.filter(x => x.correct).length;
    const change = postCorrect - preCorrect;
    const summary = [{
      session_id: state.sessionId,
      started_at: state.startedAt,
      completed_at: state.completedAt,
      pre_questions_correct: preCorrect,
      pre_questions_total: 4,
      game_questions_correct: state.gameScore,
      game_questions_total: gameRounds.length,
      post_questions_correct: postCorrect,
      post_questions_total: 4,
      change_in_correct_answers: change,
      pre_percent: Math.round(preCorrect / 4 * 100),
      post_percent: Math.round(postCorrect / 4 * 100)
    }];
    const trials = [...state.pre, ...state.gameTrials, ...state.post].map((x, i) => ({
      session_id: state.sessionId,
      trial_order: i + 1,
      phase: x.phase,
      question_number: x.question_number,
      question: x.question,
      selected_answer: x.selected_answer,
      correct_answer: x.correct_answer,
      correct: x.correct,
      correctness: x.correct ? "correct" : "incorrect",
      explanation: x.explanation
    }));
    const summaryHeaders = Object.keys(summary[0]);
    const trialHeaders = ["session_id","trial_order","phase","question_number","question","selected_answer","correct_answer","correct","correctness","explanation"];
    setProgress("Step 4 of 4", "Complete", 100);
    app.innerHTML = `
      <div class="question-number">Experiment complete</div>
      <h2>Your results are ready.</h2>
      <p>Thank you for completing the activity. Compare your pre-game and post-game scores below. A score change is a simple measure of performance on these questions; it does not by itself prove long-term learning.</p>
      <div class="result-grid">
        <div class="stat"><strong>${preCorrect}/4</strong><span>Pre-game correct</span></div>
        <div class="stat"><strong>${postCorrect}/4</strong><span>Post-game correct</span></div>
        <div class="stat"><strong>${change > 0 ? "+" : ""}${change}</strong><span>Change in correct answers</span></div>
      </div>
      <div class="download-card">
        <h3>1. Session summary CSV</h3>
        <p>One row for this session, including pre-game score, game score, post-game score, and score change.</p>
        <button id="download-summary" class="primary">Download summary CSV ↓</button>
      </div>
      <div class="download-card">
        <h3>2. Trial-level CSV</h3>
        <p>One row for each answered question, with phase, selected answer, correct answer, and whether the response was correct or incorrect.</p>
        <button id="download-trials" class="primary">Download trial-level CSV ↓</button>
      </div>
      <p class="small">Session ID: ${escapeHTML(state.sessionId)} · Both files are generated locally in your browser. No server or database is used.</p>
      <button id="restart" class="secondary">Start a new session</button>
    `;
    document.getElementById("download-summary").addEventListener("click", () => downloadCSV("misinformation_session_summary.csv", summary, summaryHeaders));
    document.getElementById("download-trials").addEventListener("click", () => downloadCSV("misinformation_trial_level.csv", trials, trialHeaders));
    document.getElementById("restart").addEventListener("click", () => location.reload());
  }

  renderIntroStart();
})();