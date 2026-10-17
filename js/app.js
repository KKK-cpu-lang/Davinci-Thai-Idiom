/**
 * เกม Davinci ถอดรหัสสำนวนไทย (Idiom DaVinci Decoder)
 * Main Game Controller
 * พัฒนาสำหรับนักเรียนชั้น ป.5 (อายุ 10-13 ปี)
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // สถานะของเกม (Game State)
  // ==========================================
  const state = {
    playerName: "นักถอดรหัสจิ๋ว",
    gameMode: "pool", // 'pool' (คลังพยางค์) หรือ 'typing' (พิมพ์ตอบเอง)
    currentStageIndex: 0,
    totalScore: 0,
    correctCount: 0,
    hintUsedThisStage: false,
    timeLeft: 60,
    timerInterval: null,
    stageActive: false,
    userSlots: [] // เก็บค่าที่ผู้เล่นเลือกใส่ในแต่ละช่อง (โหมดคลังพยางค์)
  };

  // ==========================================
  // DOM Elements
  // ==========================================
  // Screens
  const startScreen = document.getElementById("start-screen");
  const gameScreen = document.getElementById("game-screen");
  const endScreen = document.getElementById("end-screen");

  // Top Controls
  const btnToggleSound = document.getElementById("btn-toggle-sound");
  const soundIcon = document.getElementById("sound-icon");

  // Start Screen Elements
  const playerNameInput = document.getElementById("player-name-input");
  const modeCardPool = document.getElementById("mode-card-pool");
  const modeCardTyping = document.getElementById("mode-card-typing");
  const btnStartGame = document.getElementById("btn-start-game");
  const btnOpenRules = document.getElementById("btn-open-rules");
  const btnOpenLeaderboard = document.getElementById("btn-open-leaderboard");

  // Game Screen HUD
  const hudStageNum = document.getElementById("hud-stage-num");
  const hudCategoryBadge = document.getElementById("hud-category-badge");
  const hudScoreVal = document.getElementById("hud-score-val");
  const timerText = document.getElementById("timer-text");
  const timerBar = document.getElementById("timer-bar");

  // Puzzle Elements
  const badgeSyllableCount = document.getElementById("badge-syllable-count");
  const btnRequestHint = document.getElementById("btn-request-hint");
  const hintBox = document.getElementById("hint-box");
  const hintText = document.getElementById("hint-text");
  const puzzleGallery = document.getElementById("puzzle-gallery");

  // Answer Section
  const answerModePool = document.getElementById("answer-mode-pool");
  const answerModeTyping = document.getElementById("answer-mode-typing");
  const answerSlots = document.getElementById("answer-slots");
  const syllablePool = document.getElementById("syllable-pool");
  const typingAnswerInput = document.getElementById("typing-answer-input");
  const btnClearAnswer = document.getElementById("btn-clear-answer");
  const btnSubmitAnswer = document.getElementById("btn-submit-answer");

  // Explanation Modal Elements
  const modalExplanation = document.getElementById("modal-explanation");
  const expBannerHeader = document.getElementById("exp-banner-header");
  const expBannerIcon = document.getElementById("exp-banner-icon");
  const expBannerTitle = document.getElementById("exp-banner-title");
  const expBannerPoints = document.getElementById("exp-banner-points");
  const expPuzzlePreview = document.getElementById("exp-puzzle-preview");
  const expFullAnswer = document.getElementById("exp-full-answer");
  const expMeaningText = document.getElementById("exp-meaning-text");
  const expOriginText = document.getElementById("exp-origin-text");
  const btnNextStage = document.getElementById("btn-next-stage");
  const btnNextText = document.getElementById("btn-next-text");

  // Rules Modal Elements
  const modalHowToPlay = document.getElementById("modal-how-to-play");
  const btnCloseRules = document.getElementById("btn-close-rules");
  const btnCloseRulesConfirm = document.getElementById("btn-close-rules-confirm");

  // Leaderboard Modal Elements
  const modalLeaderboard = document.getElementById("modal-leaderboard");
  const btnCloseLeaderboard = document.getElementById("btn-close-leaderboard");
  const btnCloseLeaderboardConfirm = document.getElementById("btn-close-leaderboard-confirm");
  const btnClearLeaderboard = document.getElementById("btn-clear-leaderboard");
  const globalLeaderboardBody = document.getElementById("global-leaderboard-body");

  // End Screen Elements
  const summaryPlayerName = document.getElementById("summary-player-name");
  const summaryFinalScore = document.getElementById("summary-final-score");
  const summaryCorrectCount = document.getElementById("summary-correct-count");
  const summaryModeName = document.getElementById("summary-mode-name");
  const summaryRankTitle = document.getElementById("summary-rank-title");
  const summaryRankDesc = document.getElementById("summary-rank-desc");
  const summaryLeaderboardBody = document.getElementById("summary-leaderboard-body");
  const btnReplayGame = document.getElementById("btn-replay-game");
  const btnHomeGame = document.getElementById("btn-home-game");

  // Wrong Answer Modal Elements
  const modalWrongAnswer = document.getElementById("modal-wrong-answer");
  const wrongBannerHeader = document.getElementById("wrong-banner-header");
  const wrongBannerIcon = document.getElementById("wrong-banner-icon");
  const wrongBannerTitle = document.getElementById("wrong-banner-title");
  const wrongSeverityBadge = document.getElementById("wrong-severity-badge");
  const wrongMessageText = document.getElementById("wrong-message-text");
  const wrongHintBox = document.getElementById("wrong-hint-box");
  const wrongHintDetail = document.getElementById("wrong-hint-detail");
  const btnSkipStage = document.getElementById("btn-skip-stage");
  const btnTryAgain = document.getElementById("btn-try-again");

  // Toast Notification Elements
  const toastNotification = document.getElementById("toast-notification");
  const toastIcon = document.getElementById("toast-icon");
  const toastMessage = document.getElementById("toast-message");
  let toastTimer = null;

  // ฟังก์ชันแสดง Toast แจ้งเตือนสวยงามแทน Alert
  function showToast(message, icon = "⚠️") {
    if (!toastNotification) return;
    toastMessage.textContent = message;
    toastIcon.textContent = icon;
    toastNotification.classList.remove("hidden");
    soundManager.playPop();

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.add("hidden");
    }, 2800);
  }

  // ==========================================
  // ระบบเอฟเฟกต์กระดาษโปรย (Pure JS Confetti - High Performance)
  // ==========================================
  const confettiCanvas = document.getElementById("confetti-canvas");
  const confettiCtx = confettiCanvas.getContext("2d");
  let confettiParticles = [];
  let confettiAnimationId = null;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeConfettiCanvas);
  resizeConfettiCanvas();

  function triggerConfetti(durationMs = 2500) {
    const colors = ["#f43f5e", "#ec4899", "#8b5cf6", "#6366f1", "#06b6d4", "#10b981", "#fbbf24", "#f97316"];
    confettiParticles = [];
    confettiCanvas.style.display = "block";

    for (let i = 0; i < 75; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -10 - Math.random() * 80,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 5,
        velY: Math.random() * 4 + 2.5,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6
      });
    }

    if (!confettiAnimationId) {
      animateConfetti();
    }

    setTimeout(() => {
      setTimeout(() => {
        confettiParticles = [];
      }, 1000);
    }, durationMs);
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = 0; i < confettiParticles.length; i++) {
      const p = confettiParticles[i];
      p.x += p.velX;
      p.y += p.velY;
      p.rot += p.rotSpeed;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }

    // ลบอนุภาคที่หลุดขอบล่าง
    confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 20);

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimationId = null;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiCanvas.style.display = "none";
    }
  }

  // ==========================================
  // การสลับหน้าจอ (Screen Switching)
  // ==========================================
  function showScreen(screenElement) {
    [startScreen, gameScreen, endScreen].forEach(s => s.classList.remove("active"));
    screenElement.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // อัปเดตไอคอนเสียง
  function updateSoundIcon() {
    soundIcon.textContent = soundManager.isMuted ? "🔇" : "🔊";
  }
  updateSoundIcon();

  btnToggleSound.addEventListener("click", () => {
    soundManager.toggleSound();
    updateSoundIcon();
  });

  // ==========================================
  // จัดการการเลือกโหมดในหน้าแรก
  // ==========================================
  modeCardPool.addEventListener("click", () => {
    soundManager.playPop();
    modeCardPool.classList.add("selected");
    modeCardTyping.classList.remove("selected");
    modeCardPool.querySelector("input").checked = true;
    state.gameMode = "pool";
  });

  modeCardTyping.addEventListener("click", () => {
    soundManager.playPop();
    modeCardTyping.classList.add("selected");
    modeCardPool.classList.remove("selected");
    modeCardTyping.querySelector("input").checked = true;
    state.gameMode = "typing";
  });

  // ==========================================
  // เริ่มต้นเกมใหม่ (Start Game)
  // ==========================================
  btnStartGame.addEventListener("click", () => {
    soundManager.initContext();
    soundManager.playPop();

    const enteredName = playerNameInput.value.trim();
    state.playerName = enteredName.length > 0 ? enteredName : "นักถอดรหัสจิ๋ว";
    state.currentStageIndex = 0;
    state.totalScore = 0;
    state.correctCount = 0;

    showScreen(gameScreen);
    loadStage(state.currentStageIndex);
  });

  // ==========================================
  // ฟังก์ชันโหลดข้อมูลด่าน (Load Stage)
  // ==========================================
  function loadStage(index) {
    if (index >= STAGES_DATA.length) {
      finishGame();
      return;
    }

    const stage = STAGES_DATA[index];
    state.currentStageIndex = index;
    state.hintUsedThisStage = false;
    state.stageActive = true;
    state.userSlots = [];

    // อัปเดต HUD
    hudStageNum.textContent = `${stage.id} / ${STAGES_DATA.length}`;
    hudCategoryBadge.textContent = stage.category;
    hudScoreVal.textContent = state.totalScore;
    badgeSyllableCount.innerHTML = `<span class="pulse-dot"></span> จำนวน ${stage.syllableCount}`;

    // ซ่อนและรีเซ็ตคำใบ้
    hintBox.classList.add("hidden");
    hintText.textContent = "";
    btnRequestHint.disabled = false;
    btnRequestHint.innerHTML = `<span class="hint-icon">💡</span> ขอคำใบ้ (-50% คะแนน)`;

    // โหลดและเรนเดอร์รูปภาพปริศนา DaVinci
    renderPuzzleImages(stage);

    // กำหนดรูปแบบการตอบตามโหมด
    if (state.gameMode === "pool") {
      answerModePool.classList.remove("hidden");
      answerModeTyping.classList.add("hidden");
      setupPoolMode(stage);
    } else {
      answerModePool.classList.add("hidden");
      answerModeTyping.classList.remove("hidden");
      setupTypingMode();
    }

    // เริ่มนับเวลาถอยหลัง 60 วินาที
    startTimer();

    // พรีโหลดภาพด่านถัดไปล่วงหน้าแบบ Asynchronous เพื่อความลื่นไหลระดับสูงสุด
    preloadNextStageImages(index + 1);
  }

  // ฟังก์ชันพรีโหลดรูปภาพด่านถัดไปเข้า Cache เบราว์เซอร์
  function preloadNextStageImages(nextIndex) {
    if (nextIndex < STAGES_DATA.length) {
      const nextStage = STAGES_DATA[nextIndex];
      nextStage.images.forEach(src => {
        const preImg = new Image();
        preImg.decoding = "async";
        preImg.src = src;
      });
    }
  }

  // ==========================================
  // แสดงภาพปริศนาพร้อมเครื่องหมาย +
  // ==========================================
  function renderPuzzleImages(stage) {
    puzzleGallery.innerHTML = "";

    stage.images.forEach((imgSrc, imgIndex) => {
      // การ์ดรูปภาพ
      const card = document.createElement("div");
      card.className = "puzzle-card";

      const wrap = document.createElement("div");
      wrap.className = "puzzle-img-wrap";

      const badge = document.createElement("div");
      badge.className = "puzzle-order-badge";
      badge.textContent = `ภาพที่ ${imgIndex + 1}`;

      const img = document.createElement("img");
      img.className = "puzzle-img";
      img.src = imgSrc;
      img.alt = `ภาพปริศนาที่ ${imgIndex + 1}`;
      img.decoding = "async";
      img.loading = "eager";

      // Error Fallback ป้องกันหน้าจอพังหากรูปภาพโหลดไม่สำเร็จ
      img.onerror = () => {
        wrap.innerHTML = `
          <div class="img-fallback-box">
            <span class="fallback-icon">🖼️</span>
            <span>ภาพที่ ${imgIndex + 1}</span>
            <small style="opacity: 0.8;">(คำใบ้ในภาพ)</small>
          </div>
        `;
      };

      wrap.appendChild(img);
      wrap.appendChild(badge);
      card.appendChild(wrap);
      puzzleGallery.appendChild(card);

      // ใส่เครื่องหมายบวก (+) คั่นระหว่างรูป ยกเว้นรูปสุดท้าย
      if (imgIndex < stage.images.length - 1) {
        const plus = document.createElement("div");
        plus.className = "puzzle-plus-sign";
        plus.textContent = "+";
        puzzleGallery.appendChild(plus);
      }
    });
  }

  // ==========================================
  // โหมดคลังพยางค์ (Syllable Pool Mode)
  // ==========================================
  function setupPoolMode(stage) {
    answerSlots.innerHTML = "";
    syllablePool.innerHTML = "";

    const targetCount = stage.correctBlocks.length;
    state.userSlots = new Array(targetCount).fill(null);

    // สร้างช่องคำตอบเปล่าๆ
    for (let i = 0; i < targetCount; i++) {
      const slot = document.createElement("div");
      slot.className = "answer-slot";
      slot.dataset.index = i;
      slot.title = "คลิกเพื่อนำพยางค์นี้ออก";

      slot.addEventListener("click", () => {
        if (!state.stageActive) return;
        removeSyllableFromSlot(i);
      });

      answerSlots.appendChild(slot);
    }

    // รวมพยางค์ที่ถูกต้องเข้ากับคำลวง (Distractors) แล้วสุ่มลำดับ
    const allSyllables = [...stage.correctBlocks, ...stage.distractors];
    shuffleArray(allSyllables);

    // สร้างปุ่มพยางค์ในคลัง
    allSyllables.forEach((syllable, poolIdx) => {
      const btn = document.createElement("button");
      btn.className = "btn-syllable";
      btn.textContent = syllable;
      btn.dataset.poolId = poolIdx;
      btn.dataset.syllable = syllable;

      btn.addEventListener("click", () => {
        if (!state.stageActive) return;
        addSyllableToSlot(btn, syllable, poolIdx);
      });

      syllablePool.appendChild(btn);
    });
  }

  // ผู้เล่นคลิกนำพยางค์ไปใส่ในช่องว่างถัดไป
  function addSyllableToSlot(btnElement, syllable, poolIdx) {
    const emptyIndex = state.userSlots.findIndex(item => item === null);
    if (emptyIndex === -1) {
      // ช่องเต็มแล้ว
      soundManager.playWrong();
      return;
    }

    soundManager.playPop();
    state.userSlots[emptyIndex] = { syllable, poolIdx };
    btnElement.classList.add("used");

    updateSlotsUI();
  }

  // ผู้เล่นคลิกที่ช่องเพื่อดึงพยางค์กลับเข้าคลัง
  function removeSyllableFromSlot(slotIndex) {
    const slotData = state.userSlots[slotIndex];
    if (!slotData) return;

    soundManager.playPop();

    // คืนสถานะปุ่มในคลังพยางค์
    const poolBtn = syllablePool.querySelector(`[data-pool-id="${slotData.poolIdx}"]`);
    if (poolBtn) {
      poolBtn.classList.remove("used");
    }

    state.userSlots[slotIndex] = null;
    updateSlotsUI();
  }

  // อัปเดตหน้าตาของช่องคำตอบตามข้อมูลใน userSlots
  function updateSlotsUI() {
    const slotElements = answerSlots.querySelectorAll(".answer-slot");
    slotElements.forEach((el, idx) => {
      const data = state.userSlots[idx];
      if (data) {
        el.textContent = data.syllable;
        el.classList.add("filled");
      } else {
        el.textContent = "";
        el.classList.remove("filled");
      }
    });
  }

  // ==========================================
  // โหมดพิมพ์ตอบเอง (Typing Mode)
  // ==========================================
  function setupTypingMode() {
    typingAnswerInput.value = "";
    typingAnswerInput.focus();
  }

  // รองรับการกดปุ่ม Enter ในช่องพิมพ์คำตอบ
  typingAnswerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  });

  // ==========================================
  // ปุ่มล้างคำตอบ (Clear Answer)
  // ==========================================
  btnClearAnswer.addEventListener("click", () => {
    if (!state.stageActive) return;
    soundManager.playPop();

    if (state.gameMode === "pool") {
      state.userSlots.forEach((slotData) => {
        if (slotData) {
          const poolBtn = syllablePool.querySelector(`[data-pool-id="${slotData.poolIdx}"]`);
          if (poolBtn) poolBtn.classList.remove("used");
        }
      });
      state.userSlots.fill(null);
      updateSlotsUI();
    } else {
      typingAnswerInput.value = "";
      typingAnswerInput.focus();
    }
  });

  // ==========================================
  // ปุ่มขอคำใบ้ (Hint Request)
  // ==========================================
  btnRequestHint.addEventListener("click", () => {
    if (!state.stageActive || state.hintUsedThisStage) return;

    soundManager.playHint();
    state.hintUsedThisStage = true;

    const currentStage = STAGES_DATA[state.currentStageIndex];
    hintText.textContent = currentStage.hint;
    hintBox.classList.remove("hidden");

    btnRequestHint.disabled = true;
    btnRequestHint.innerHTML = `<span class="hint-icon">💡</span> ใช้คำใบ้แล้ว (-50% คะแนน)`;
  });

  // ==========================================
  // ระบบเวลานับถอยหลัง (Timer System - 60s)
  // ==========================================
  function startTimer() {
    clearInterval(state.timerInterval);
    state.timeLeft = 60;
    updateTimerUI();

    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      updateTimerUI();

      // เมื่อเหลือ 10 วินาทีสุดท้าย ให้เล่นเสียงเตือน Tick-Tock
      if (state.timeLeft <= 10 && state.timeLeft > 0) {
        soundManager.playTick();
      }

      // หมดเวลา
      if (state.timeLeft <= 0) {
        clearInterval(state.timerInterval);
        handleTimeout();
      }
    }, 1000);
  }

  function updateTimerUI() {
    timerText.textContent = `${state.timeLeft} วิ`;
    const percent = Math.max(0, (state.timeLeft / 60) * 100);
    timerBar.style.width = `${percent}%`;

    // เปลี่ยนสีแถบเวลาตามความเร่งด่วน: เขียว -> เหลือง -> แดง
    if (state.timeLeft > 25) {
      timerBar.className = "timer-bar-fill";
      timerText.style.color = "#10b981";
    } else if (state.timeLeft > 10) {
      timerBar.className = "timer-bar-fill warning";
      timerText.style.color = "#f59e0b";
    } else {
      timerBar.className = "timer-bar-fill danger";
      timerText.style.color = "#ef4444";
    }
  }

  // ==========================================
  // จัดการเมื่อหมดเวลา (Timeout)
  // ==========================================
  function handleTimeout() {
    state.stageActive = false;
    soundManager.playWrong();
    showExplanationModal({
      isCorrect: false,
      isTimeout: true,
      earnedScore: 0
    });
  }

  // ==========================================
  // ตรวจคำตอบ (Submit Answer & Smart Analysis)
  // ==========================================
  btnSubmitAnswer.addEventListener("click", () => {
    submitAnswer();
  });

  function submitAnswer() {
    if (!state.stageActive) return;

    const currentStage = STAGES_DATA[state.currentStageIndex];
    let isCorrect = false;

    if (state.gameMode === "pool") {
      // 1. ตรวจสอบว่าใส่ครบทุกช่องหรือไม่ (เตือนด้วย Toast สวยงามแทน alert)
      const isComplete = state.userSlots.every(slot => slot !== null);
      if (!isComplete) {
        soundManager.playWrong();
        shakeElement(answerSlots);
        showToast("กรุณาเรียงพยางค์ให้ครบทุกช่องก่อนตรวจนะจ๊ะ! 🧩", "🧩");
        return;
      }

      // 2. ตรวจสอบว่าพยางค์เรียงถูกต้องตรงกับ correctBlocks หรือไม่
      const mismatches = [];
      state.userSlots.forEach((slot, idx) => {
        if (slot.syllable !== currentStage.correctBlocks[idx]) {
          mismatches.push({
            slotIndex: idx + 1,
            userSyllable: slot.syllable,
            targetSyllable: currentStage.correctBlocks[idx]
          });
        }
      });

      if (mismatches.length === 0) {
        isCorrect = true;
      } else {
        // ตอบผิดในโหมดคลังพยางค์ -> วิเคราะห์จำนวนคำผิดและเปิด Pop up คำใบ้
        soundManager.playWrong();
        shakeElement(answerSlots);
        showWrongAnswerModal({
          mode: "pool",
          mismatches: mismatches,
          currentStage: currentStage
        });
        return;
      }
    } else {
      // โหมดพิมพ์ตอบเอง
      const playerText = cleanThaiString(typingAnswerInput.value);
      const targetText = cleanThaiString(currentStage.fullAnswer);

      if (!playerText) {
        soundManager.playWrong();
        shakeElement(typingAnswerInput);
        showToast("กรุณาพิมพ์คำตอบก่อนกดตรวจนะจ๊ะ! ✍️", "✍️");
        return;
      }

      if (playerText === targetText) {
        isCorrect = true;
      } else {
        // คำนวณความต่างของข้อความ (Levenshtein Distance)
        soundManager.playWrong();
        shakeElement(typingAnswerInput);
        const distance = getLevenshteinDistance(playerText, targetText);
        showWrongAnswerModal({
          mode: "typing",
          distance: distance,
          currentStage: currentStage
        });
        return;
      }
    }

    if (isCorrect) {
      // ตอบถูกต้องสมบูรณ์!
      clearInterval(state.timerInterval);
      state.stageActive = false;

      // คำนวณคะแนน: ปกติ 100 คะแนน ถ้าขอคำใบ้ได้ 50 คะแนน
      const earned = state.hintUsedThisStage ? 50 : 100;
      state.totalScore += earned;
      state.correctCount++;
      hudScoreVal.textContent = state.totalScore;

      soundManager.playCorrect();
      triggerConfetti(3000);

      showExplanationModal({
        isCorrect: true,
        isTimeout: false,
        isSkipped: false,
        earnedScore: earned
      });
    }
  }

  // ==========================================
  // ระบบวิเคราะห์และแสดง Modal เมื่อตอบผิด
  // ==========================================
  function showWrongAnswerModal({ mode, mismatches, distance, currentStage }) {
    // รีเซ็ตคลาสแบนเนอร์
    wrongBannerHeader.className = "modal-header-banner wrong";

    if (mode === "pool") {
      const wrongCount = mismatches.length;

      if (wrongCount === 1) {
        // ผิดเพียง 1 คำ -> ใบ้ตำแหน่งชัดเจน
        wrongBannerIcon.textContent = "💡";
        wrongBannerTitle.textContent = "เกือบถูกแล้วจ้า!";
        wrongSeverityBadge.textContent = "ผิดเพียง 1 พยางค์";
        wrongMessageText.textContent = `มีพยางค์ใน "ช่องที่ ${mismatches[0].slotIndex}" ยังไม่ถูกต้องนะจ๊ะ!`;
        wrongHintDetail.textContent = `ลองคลิกที่ช่องคำตอบที่ ${mismatches[0].slotIndex} เพื่อเอาพยางค์ออก แล้วเลือกคำใหม่จากคลังมาใส่แทนดูนะ 🎯`;
        wrongHintBox.style.display = "flex";
      } else if (wrongCount === 2) {
        // ผิด 2 คำ -> ใบ้ตำแหน่ง
        wrongBannerIcon.textContent = "💡";
        wrongBannerTitle.textContent = "ใกล้เคียงความจริงแล้ว!";
        wrongSeverityBadge.textContent = "ผิดเพียง 2 พยางค์";
        const slotsText = `ช่องที่ ${mismatches[0].slotIndex} และช่องที่ ${mismatches[1].slotIndex}`;
        wrongMessageText.textContent = `มีจุดที่ยังไม่ถูกต้อง 2 จุด (${slotsText})`;
        wrongHintDetail.textContent = "ลองสลับพยางค์ หรือตรวจสอบดูว่ามีคำลวงปะปนอยู่หรือไม่ สู้ๆ นะ! ✌️";
        wrongHintBox.style.display = "flex";
      } else {
        // ผิดเยอะ (> 2 คำ) -> แสดงตามข้อกำหนด "ยังไม่ถูกต้อง ลองสังเกตภาพใหม่อีกครั้งนะจ๊ะ!"
        wrongBannerHeader.classList.add("severe");
        wrongBannerIcon.textContent = "🔍";
        wrongBannerTitle.textContent = "ยังไม่ถูกต้องนะจ๊ะ";
        wrongSeverityBadge.textContent = `ยังไม่ถูกต้อง (${wrongCount} จุด)`;
        wrongMessageText.textContent = "ยังไม่ถูกต้อง ลองสังเกตภาพใหม่อีกครั้งนะจ๊ะ!";
        wrongHintDetail.textContent = "นำความหมายของแต่ละรูปภาพมาต่อกันเป็นสำนวนไทยนะจ๊ะ 💡";
        wrongHintBox.style.display = "flex";
      }
    } else {
      // โหมดพิมพ์ตอบเอง
      if (distance <= 2) {
        wrongBannerIcon.textContent = "💡";
        wrongBannerTitle.textContent = "เกือบถูกแล้วจ้า!";
        wrongSeverityBadge.textContent = "สะกดผิดนิดเดียว";
        wrongMessageText.textContent = "ตัวสะกดผิดไปนิดเดียวเท่านั้นเอง เก่งมากแล้ว!";
        wrongHintDetail.textContent = "ลองตรวจเช็กตัวสะกด วรรณยุกต์ และสระอีกรอบนะจ๊ะ ✍️";
        wrongHintBox.style.display = "flex";
      } else {
        wrongBannerHeader.classList.add("severe");
        wrongBannerIcon.textContent = "🔍";
        wrongBannerTitle.textContent = "ยังไม่ถูกต้องนะจ๊ะ";
        wrongSeverityBadge.textContent = "ยังไม่ถูกต้อง";
        wrongMessageText.textContent = "ยังไม่ถูกต้อง ลองสังเกตภาพใหม่อีกครั้งนะจ๊ะ!";
        wrongHintDetail.textContent = "ลองพิมพ์สำนวนไทยที่ตรงกับภาพปริศนาด้านบนดูอีกครั้งนะ 🔍";
        wrongHintBox.style.display = "flex";
      }
    }

    modalWrongAnswer.classList.remove("hidden");
  }

  // 1. ปุ่ม "ลองทำต่อจากเดิม" (กลับไปแก้ไขต่อโดยไม่ล้างคำตอบเดิม)
  btnTryAgain.addEventListener("click", () => {
    soundManager.playPop();
    modalWrongAnswer.classList.add("hidden");
    if (state.gameMode === "typing") {
      typingAnswerInput.focus();
    }
  });

  // 2. ปุ่ม "ข้ามข้อนี้" (ลดคะแนนในด่านนี้เป็น 0 คะแนน แล้วพาไปดูเฉลยเพื่อเรียนรู้)
  btnSkipStage.addEventListener("click", () => {
    soundManager.playPop();
    modalWrongAnswer.classList.add("hidden");

    // หยุดตัวจับเวลาของด่าน
    clearInterval(state.timerInterval);
    state.stageActive = false;

    // ข้ามด่าน -> ได้รับ 0 คะแนนสำหรับด่านนี้
    showExplanationModal({
      isCorrect: false,
      isTimeout: false,
      isSkipped: true,
      earnedScore: 0
    });
  });

  // คำนวณระยะห่างสตริง Levenshtein สำหรับตรวจสอบความคล้ายของข้อความ
  function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // ล้างช่องว่างและอักขระพิเศษเพื่อการเปรียบเทียบข้อความที่แม่นยำ
  function cleanThaiString(str) {
    if (!str) return "";
    return str.replace(/\s+/g, "").trim();
  }

  // Effect สั่นเมื่อตอบผิดหรือข้อมูลไม่ครบ
  function shakeElement(el) {
    el.style.animation = "shake 0.4s ease-in-out";
    setTimeout(() => {
      el.style.animation = "";
    }, 450);
  }

  // ==========================================
  // แสดงหน้าต่างเฉลยความรู้ (Explanation Modal)
  // ==========================================
  function showExplanationModal({ isCorrect, isTimeout, isSkipped, earnedScore }) {
    const stage = STAGES_DATA[state.currentStageIndex];

    // ปรับแต่ง Banner ตามผลลัพธ์
    expBannerHeader.className = "modal-header-banner";
    if (isCorrect) {
      expBannerIcon.textContent = "🎉";
      expBannerTitle.textContent = "เก่งมาก! ตอบถูกต้อง";
      expBannerPoints.textContent = `+${earnedScore} คะแนน`;
    } else if (isSkipped) {
      expBannerHeader.classList.add("wrong");
      expBannerIcon.textContent = "⏭️";
      expBannerTitle.textContent = "ข้ามด่านนี้แล้ว";
      expBannerPoints.textContent = "+0 คะแนน";
    } else if (isTimeout) {
      expBannerHeader.classList.add("timeout");
      expBannerIcon.textContent = "⏰";
      expBannerTitle.textContent = "หมดเวลาซะแล้ว!";
      expBannerPoints.textContent = "+0 คะแนน";
    } else {
      expBannerHeader.classList.add("wrong");
      expBannerIcon.textContent = "💡";
      expBannerTitle.textContent = "มาดูเฉลยกันเถอะ";
      expBannerPoints.textContent = "+0 คะแนน";
    }

    // แสดงภาพพรีวิวย่อพร้อมคำเฉลยของแต่ละภาพ
    expPuzzlePreview.innerHTML = "";
    stage.images.forEach((imgSrc, idx) => {
      const thumb = document.createElement("div");
      thumb.className = "exp-thumb-card";

      const img = document.createElement("img");
      img.className = "exp-thumb-img";
      img.src = imgSrc;
      img.decoding = "async";
      img.loading = "lazy";
      img.alt = `ภาพที่ ${idx + 1}`;
      img.onerror = () => {
        thumb.innerHTML = `<div style="padding:10px;font-size:12px;">ภาพที่ ${idx + 1}</div>`;
      };

      const label = document.createElement("div");
      label.className = "exp-thumb-label";
      label.textContent = stage.imageHints && stage.imageHints[idx] ? stage.imageHints[idx] : `ภาพที่ ${idx + 1}`;

      thumb.appendChild(img);
      thumb.appendChild(label);
      expPuzzlePreview.appendChild(thumb);
    });

    // แสดงสำนวนเต็ม, ความหมาย และที่มา
    expFullAnswer.textContent = stage.fullAnswer;
    expMeaningText.textContent = stage.meaning;
    expOriginText.textContent = stage.origin;

    // เปลี่ยนข้อความปุ่มถ้าเป็นด่านสุดท้าย
    const isLastStage = state.currentStageIndex === STAGES_DATA.length - 1;
    btnNextText.textContent = isLastStage ? "ดูสรุปผลคะแนนรวม" : "ไปด่านต่อไป";

    modalExplanation.classList.remove("hidden");
  }

  // ปุ่มไปด่านต่อไปใน Modal
  btnNextStage.addEventListener("click", () => {
    soundManager.playPop();
    modalExplanation.classList.add("hidden");

    if (state.currentStageIndex < STAGES_DATA.length - 1) {
      loadStage(state.currentStageIndex + 1);
    } else {
      finishGame();
    }
  });

  // ==========================================
  // จบเกมและแสดงหน้าสรุปผล (Finish Game)
  // ==========================================
  function finishGame() {
    clearInterval(state.timerInterval);
    state.stageActive = false;

    showScreen(endScreen);
    triggerConfetti(4000);
    soundManager.playCorrect();

    summaryPlayerName.textContent = `ผู้เล่น: ${state.playerName}`;
    summaryFinalScore.textContent = state.totalScore;
    summaryCorrectCount.textContent = `ตอบถูก ${state.correctCount} / ${STAGES_DATA.length} ด่าน`;
    summaryModeName.textContent = state.gameMode === "pool" ? "โหมดคลังพยางค์" : "โหมดพิมพ์ตอบเอง";

    // คำนวณฉายาที่ได้รับ
    const rank = getRankByScore(state.totalScore);
    summaryRankTitle.textContent = rank.title;
    summaryRankDesc.textContent = rank.desc;

    // บันทึกคะแนนลงใน localStorage
    saveScoreToLeaderboard({
      name: state.playerName,
      score: state.totalScore,
      mode: state.gameMode === "pool" ? "คลังพยางค์" : "พิมพ์เอง",
      date: new Date().toLocaleDateString("th-TH")
    });

    // เรนเดอร์คะแนน 5 อันดับล่าสุด
    renderSummaryLeaderboard();
  }

  function getRankByScore(score) {
    for (const r of RANKS) {
      if (score >= r.minScore) {
        return r;
      }
    }
    return RANKS[RANKS.length - 1];
  }

  // บันทึกและดึงคะแนนจาก localStorage
  function saveScoreToLeaderboard(record) {
    try {
      const records = JSON.parse(localStorage.getItem("davinci_leaderboard") || "[]");
      records.push(record);
      // เรียงจากคะแนนมากไปหาน้อย
      records.sort((a, b) => b.score - a.score);
      // เก็บสูงสุด 10 อันดับ
      const trimmed = records.slice(0, 10);
      localStorage.setItem("davinci_leaderboard", JSON.stringify(trimmed));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  }

  function renderSummaryLeaderboard() {
    try {
      const records = JSON.parse(localStorage.getItem("davinci_leaderboard") || "[]");
      summaryLeaderboardBody.innerHTML = "";

      if (records.length === 0) {
        summaryLeaderboardBody.innerHTML = `<tr><td colspan="4">ยังไม่มีข้อมูลคะแนน</td></tr>`;
        return;
      }

      records.slice(0, 5).forEach((rec, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td><strong>${escapeHtml(rec.name)}</strong></td>
          <td>${escapeHtml(rec.mode)}</td>
          <td><strong style="color: #059669;">${rec.score}</strong></td>
        `;
        summaryLeaderboardBody.appendChild(tr);
      });
    } catch (e) {
      console.warn("Render leaderboard error:", e);
    }
  }

  // ปุ่มเล่นใหม่อีกครั้ง
  btnReplayGame.addEventListener("click", () => {
    soundManager.playPop();
    state.currentStageIndex = 0;
    state.totalScore = 0;
    state.correctCount = 0;
    showScreen(gameScreen);
    loadStage(0);
  });

  // ปุ่มกลับหน้าแรก
  btnHomeGame.addEventListener("click", () => {
    soundManager.playPop();
    showScreen(startScreen);
  });

  // ==========================================
  // Modal วิธีการเล่น (How to Play)
  // ==========================================
  btnOpenRules.addEventListener("click", () => {
    soundManager.playPop();
    modalHowToPlay.classList.remove("hidden");
  });

  btnCloseRules.addEventListener("click", () => {
    soundManager.playPop();
    modalHowToPlay.classList.add("hidden");
  });

  btnCloseRulesConfirm.addEventListener("click", () => {
    soundManager.playPop();
    modalHowToPlay.classList.add("hidden");
  });

  // ==========================================
  // Modal ตารางคะแนนรวม (Leaderboard)
  // ==========================================
  btnOpenLeaderboard.addEventListener("click", () => {
    soundManager.playPop();
    renderGlobalLeaderboard();
    modalLeaderboard.classList.remove("hidden");
  });

  btnCloseLeaderboard.addEventListener("click", () => {
    soundManager.playPop();
    modalLeaderboard.classList.add("hidden");
  });

  btnCloseLeaderboardConfirm.addEventListener("click", () => {
    soundManager.playPop();
    modalLeaderboard.classList.add("hidden");
  });

  btnClearLeaderboard.addEventListener("click", () => {
    if (confirm("คุณต้องการล้างประวัติคะแนนทั้งหมดใช่หรือไม่?")) {
      soundManager.playPop();
      localStorage.removeItem("davinci_leaderboard");
      renderGlobalLeaderboard();
    }
  });

  function renderGlobalLeaderboard() {
    try {
      const records = JSON.parse(localStorage.getItem("davinci_leaderboard") || "[]");
      globalLeaderboardBody.innerHTML = "";

      if (records.length === 0) {
        globalLeaderboardBody.innerHTML = `<tr><td colspan="5">ยังไม่มีข้อมูลคะแนน มาเป็นคนแรกกันเถอะ!</td></tr>`;
        return;
      }

      records.forEach((rec, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td><strong>${escapeHtml(rec.name)}</strong></td>
          <td>${escapeHtml(rec.mode)}</td>
          <td><strong style="color: #059669;">${rec.score}</strong></td>
          <td>${escapeHtml(rec.date || "-")}</td>
        `;
        globalLeaderboardBody.appendChild(tr);
      });
    } catch (e) {
      console.warn("Render global leaderboard error:", e);
    }
  }

  // ==========================================
  // Helper Functions
  // ==========================================
  // Fisher-Yates Shuffle
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ป้องกัน XSS
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
