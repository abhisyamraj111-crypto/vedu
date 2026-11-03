(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const cover = $("cover"), invitation = $("invitation"), openButton = $("openInvite");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opened = false, confettiTimer = null;
  const birthdayMusic = $("birthdayMusic"), musicToggle = $("musicToggle");
  let musicPlaying = false;
  const wishesKey = "vedanth-birthday-wishes-v1";
  const supabaseUrl = ""; // Optional: set your Supabase project URL here.
  const supabaseAnonKey = ""; // Optional: set your Supabase anon/public key here. Never use a service_role secret.

  // Gentle decorative sparkles, created once and kept lightweight.
  const sparkleHost = document.querySelector(".sparkles");
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span");
    s.className = "sparkle"; s.textContent = i % 4 === 0 ? "✦" : "·";
    s.style.left = `${4 + Math.random() * 92}%`; s.style.top = `${5 + Math.random() * 90}%`;
    s.style.setProperty("--duration", `${2.2 + Math.random() * 3.8}s`);
    s.style.animationDelay = `${Math.random() * 4}s`; s.style.fontSize = `${8 + Math.random() * 12}px`;
    sparkleHost.appendChild(s);
  }

  function openingSparkles() {
    if (reduceMotion) return;
    const symbols = ["✦", "✧", "·", "♡"];
    for (let i = 0; i < 34; i++) {
      const particle = document.createElement("span");
      particle.className = "opening-particle";
      particle.textContent = symbols[i % symbols.length];
      particle.style.setProperty("--x", `${8 + Math.random() * 84}vw`);
      particle.style.setProperty("--y", `${18 + Math.random() * 64}vh`);
      particle.style.setProperty("--dx", `${-35 + Math.random() * 70}px`);
      particle.style.fontSize = `${8 + Math.random() * 14}px`;
      document.body.appendChild(particle);
      window.setTimeout(() => particle.remove(), 1000);
    }
  }

  async function startBirthdayMusic() {
    if (!birthdayMusic) return;
    try {
      birthdayMusic.volume = 0.72;
      await birthdayMusic.play();
      musicPlaying = true;
      if (musicToggle) {
        musicToggle.classList.add("is-playing");
        musicToggle.setAttribute("aria-pressed", "true");
        musicToggle.setAttribute("aria-label", "Pause birthday music");
        musicToggle.querySelector(".music-toggle-label").textContent = "Music On";
      }
    } catch (error) {
      musicPlaying = false;
      if (musicToggle) {
        musicToggle.classList.remove("is-playing");
        musicToggle.setAttribute("aria-pressed", "false");
        musicToggle.querySelector(".music-toggle-label").textContent = "Tap for Music";
      }
    }
  }

  async function toggleBirthdayMusic() {
    if (!birthdayMusic) return;
    if (musicPlaying && !birthdayMusic.paused) {
      birthdayMusic.pause(); musicPlaying = false;
      musicToggle.classList.remove("is-playing");
      musicToggle.setAttribute("aria-pressed", "false");
      musicToggle.setAttribute("aria-label", "Play birthday music");
      musicToggle.querySelector(".music-toggle-label").textContent = "Play Music";
    } else {
      await startBirthdayMusic();
    }
  }
  musicToggle?.addEventListener("click", toggleBirthdayMusic);

  function openInvitation() {
    if (opened) return; opened = true;
    openButton.classList.add("is-activating");
    cover.classList.add("invitation-started");
    openButton.disabled = true; document.body.classList.add("locked");
    // Start music from this user gesture; mobile browsers require a user gesture.
    startBirthdayMusic();
    openingSparkles();
    if (!reduceMotion) cover.classList.add("cover-opening");
    window.setTimeout(() => {
      cover.classList.add("cover-gone"); invitation.classList.remove("hidden");
      if (!reduceMotion) {
        $("details").classList.add("invitation-card-entering");
        window.setTimeout(() => $("details").classList.remove("invitation-card-entering"), 1000);
      }
      invitation.setAttribute("aria-hidden", "false"); document.body.classList.remove("locked");
      $("backTop").classList.remove("hidden");
      $("details").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      startCountdown();
      spawnScrollAnimal();
      window.setTimeout(spawnScrollAnimal, 900);
    }, reduceMotion ? 0 : 760);
  }
  openButton.addEventListener("click", openInvitation);


  // Calendar download and invite sharing. Share works best after the site is hosted online.
  const eventTitle = "Vedanth's Birthday";
  const eventDescription = "Join us for a sweet little celebration for Vedanth A.";
  const eventLocation = "Nallezhuthu Aruna, Nallezhuthu Jn, Chavara, Kollam";
  function createCalendarFile() {
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Vedanth Birthday//Invitation//EN",
      "CALSCALE:GREGORIAN", "BEGIN:VEVENT", "UID:vedanth-birthday-20261112@invitation.local",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""),
      "DTSTART:20261112T123000Z", "DTEND:20261112T143000Z",
      "SUMMARY:" + eventTitle, "DESCRIPTION:" + eventDescription,
      "LOCATION:" + eventLocation, "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    return new File([ics], "Vedanth-Birthday-12-Nov-2026.ics", { type: "text/calendar" });
  }
  function downloadCalendarFile(file = createCalendarFile()) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a"); a.href = url; a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function calendarFeedback(message) { const feedback = $("actionFeedback"); if (feedback) feedback.textContent = message; }
  function showCalendarPrompt() {
    const prompt = $("calendarPrompt");
    if (prompt?.showModal) prompt.showModal();
    else downloadCalendarFile();
  }
  async function chooseDeviceCalendar() {
    const file = createCalendarFile(), prompt = $("calendarPrompt");
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      prompt?.close();
      try {
        await navigator.share({ files: [file], title: "Add Vedanth's Birthday", text: "Choose Calendar to save the invitation." });
        calendarFeedback("Choose a calendar app from the share sheet to add the event.");
      } catch (error) {
        if (error?.name === "AbortError") return;
        downloadCalendarFile(file);
        calendarFeedback("Calendar file downloaded. Open it to add the event to your phone's calendar.");
      }
      return;
    }
    prompt?.close();
    downloadCalendarFile(file);
    calendarFeedback("Calendar file downloaded. Open it to add the event to your phone's calendar.");
  }
  function openGoogleCalendar() {
    $("calendarPrompt")?.close();
    const calendarParams = new URLSearchParams({ action: "TEMPLATE", text: eventTitle, dates: "20261112T123000Z/20261112T143000Z", ctz: "Asia/Kolkata", details: eventDescription, location: eventLocation });
    window.open("https://calendar.google.com/calendar/render?" + calendarParams.toString(), "_blank", "noopener,noreferrer");
    calendarFeedback("Google Calendar opened. Review and save the event there.");
  }
  $("closeCalendarPrompt")?.addEventListener("click", () => $("calendarPrompt")?.close());
  $("deviceCalendarOption")?.addEventListener("click", chooseDeviceCalendar);
  $("downloadCalendarOption")?.addEventListener("click", () => {
    $("calendarPrompt")?.close(); downloadCalendarFile();
    calendarFeedback("Calendar file downloaded. Open it to add the event to your calendar.");
  });
  $("googleCalendarOption")?.addEventListener("click", openGoogleCalendar);
  ["saveDate", "saveDateCountdown"].forEach(id => $(id)?.addEventListener("click", showCalendarPrompt));  async function shareInvitation() {
    const url = window.location.href;
    const data = { title: "Vedanth's Birthday Invitation", text: "You're invited to a sweet little celebration for Vedanth A. on 12 November 2026 at 6:00 PM, Nallezhuthu Aruna, Nallezhuthu Jn, Chavara, Kollam.", url };
    try {
      if (navigator.share && /^https?:$/.test(window.location.protocol)) {
        await navigator.share(data);
        const feedback = $("actionFeedback"); if (feedback) feedback.textContent = "Invitation share sheet opened.";
      } else if (navigator.clipboard && window.isSecureContext && /^https?:$/.test(window.location.protocol)) {
        await navigator.clipboard.writeText(url);
        const feedback = $("actionFeedback"); if (feedback) feedback.textContent = "Invitation link copied. Paste it into WhatsApp or your favourite app.";
      } else {
        const feedback = $("actionFeedback");
        if (feedback) feedback.textContent = "To share a working invitation link, first publish this website online. A local file link works only on your own device.";
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
      const feedback = $("actionFeedback"); if (feedback) feedback.textContent = "Sharing is not available here. Publish the site online, then copy its website link to share.";
    }
  }
  ["shareInvite", "shareInviteCountdown"].forEach(id => $(id)?.addEventListener("click", shareInvitation));

  // Date target: 12 November 2026, 6:00 PM Asia/Kolkata (UTC+05:30).
  const target = Date.parse("2026-11-12T18:00:00+05:30");
  function setCountdownValue(id, value) {
    const digit = $(id);
    if (!digit) return;
    digit.textContent = value;
  }
  function popAllCountdownTiles() {
    if (reduceMotion) return;
    document.querySelectorAll("#countdownClock .time-card").forEach((tile) => {
      const digit = tile.querySelector("strong");
      tile.classList.remove("timer-pop-now");
      digit?.classList.remove("digit-pop-now");
      // Reflow each tile so all four animations replay together, not just seconds.
      void tile.offsetWidth;
      tile.classList.add("timer-pop-now");
      digit?.classList.add("digit-pop-now");
      window.setTimeout(() => {
        tile.classList.remove("timer-pop-now");
        digit?.classList.remove("digit-pop-now");
      }, 650);
    });
  }
  function startCountdown() {
    const update = () => {
      const left = Math.max(0, target - Date.now());
      if (left <= 0) {
        $("countdownClock").classList.add("hidden"); $("birthdayMessage").classList.remove("hidden");
        if (!confettiTimer) launchConfetti();
        return;
      }
      const total = Math.floor(left / 1000);
      setCountdownValue("days", String(Math.floor(total / 86400)).padStart(2, "0"));
      setCountdownValue("hours", String(Math.floor((total % 86400) / 3600)).padStart(2, "0"));
      setCountdownValue("minutes", String(Math.floor((total % 3600) / 60)).padStart(2, "0"));
      setCountdownValue("seconds", String(total % 60).padStart(2, "0"));
      popAllCountdownTiles();
    };
    update(); window.setInterval(update, 1000);
  }

  function launchConfetti() {
    confettiTimer = true;
    if (reduceMotion) return;
    const colors = ["#d6b675", "#e9c9c6", "#e5ddef", "#fff8e9"];
    for (let i = 0; i < 45; i++) {
      const p = document.createElement("span");
      p.textContent = i % 3 ? "✦" : "♡";
      p.style.cssText = `position:fixed;z-index:25;left:${Math.random()*100}vw;top:-20px;color:${colors[i%colors.length]};font-size:${10+Math.random()*12}px;pointer-events:none;animation:fall ${3+Math.random()*3}s linear forwards`;
      document.body.appendChild(p); window.setTimeout(() => p.remove(), 6200);
    }
  }
  const style = document.createElement("style");
  style.textContent = "@keyframes fall{to{transform:translateY(110vh) rotate(480deg);opacity:0}}.cover-opening{animation:coverOut .75s ease forwards}.cover-gone{display:none}@keyframes coverOut{to{opacity:0;transform:scale(1.04);filter:blur(5px)}}";
  document.head.appendChild(style);

  // Pastel balloons float gently as decorative accents.
  const countdownSection = $("countdown");
  const balloonLayer = document.createElement("div");
  balloonLayer.className = "balloons-burst";
  balloonLayer.setAttribute("aria-hidden", "true");
  countdownSection.prepend(balloonLayer);
  const balloonColors = ["#b9dcf5", "#d8c9f2", "#bfe7dc", "#f5d3dc", "#f5e2ad"];
  function addFloatingBalloons(amount = 12) {
    if (reduceMotion) return;
    for (let i = 0; i < amount; i++) {
      const balloon = document.createElement("span");
      balloon.className = "party-balloon";
      balloon.style.left = `${3 + Math.random() * 94}%`;
      balloon.style.background = balloonColors[i % balloonColors.length];
      balloon.style.setProperty("--rise", `${10 + Math.random() * 8}s`);
      balloon.style.setProperty("--delay", `${Math.random() * 9}s`);
      balloon.style.setProperty("--drift", `${-55 + Math.random() * 110}px`);
      balloon.style.setProperty("--string-angle", `${-10 + Math.random() * 20}deg`);
      balloonLayer.appendChild(balloon);
    }
  }
  addFloatingBalloons(16);

  // Photo viewer; if a selected local photo is not present, the placeholder remains the fallback.
  const lightbox = $("lightbox"), lightboxImage = $("lightboxImage");
  const photoGrid = $("photoGrid");
  if (photoGrid) {
    const originalCards = [...photoGrid.querySelectorAll(".photo-card")];
    const originalCount = originalCards.length;
    originalCards.forEach(card => {
      const image = card.querySelector("img");
      if (image) image.style.objectPosition = getComputedStyle(image).objectPosition;
    });
    const makeLoopCopies = cards => {
      const fragment = document.createDocumentFragment();
      cards.forEach(card => {
        const copy = card.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.tabIndex = -1;
        const image = copy.querySelector("img");
        if (image) image.style.objectPosition = card.querySelector("img").style.objectPosition;
        fragment.appendChild(copy);
      });
      return fragment;
    };
    if (originalCount > 1) {
      photoGrid.prepend(makeLoopCopies(originalCards));
      photoGrid.append(makeLoopCopies(originalCards));
    }
    const photoCards = [...photoGrid.querySelectorAll(".photo-card")];
    photoGrid.addEventListener("click", event => {
      const card = event.target.closest(".photo-card");
      if (!card || !photoGrid.contains(card)) return;
      const img = card.querySelector("img");
      lightboxImage.src = img.currentSrc || img.src; lightboxImage.alt = img.alt;
      lightbox.classList.remove("hidden"); $("closeLightbox").focus();
    });
    const firstOriginal = photoCards[originalCount];
    const lastOriginal = photoCards[originalCount * 2 - 1];
    let loopStart = 0, loopSpan = 0;
    const measureLoop = () => {
      const gridRect = photoGrid.getBoundingClientRect();
      loopStart = firstOriginal.getBoundingClientRect().left - gridRect.left + photoGrid.scrollLeft;
      const lastRight = lastOriginal.getBoundingClientRect().right - gridRect.left + photoGrid.scrollLeft;
      loopSpan = lastRight - loopStart + (parseFloat(getComputedStyle(photoGrid).columnGap) || 0);
    };
    measureLoop();
    photoGrid.style.scrollBehavior = "auto";
    photoGrid.scrollLeft = loopStart - (photoGrid.clientWidth - firstOriginal.offsetWidth) / 2;
    requestAnimationFrame(() => photoGrid.style.removeProperty("scroll-behavior"));

    let carouselFrame = 0;
    let loopFrame = 0;
    const updatePhotoCarousel = () => {
      carouselFrame = 0;
      const gridCenter = photoGrid.getBoundingClientRect().left + photoGrid.clientWidth / 2;
      photoCards.forEach(card => {
        const bounds = card.getBoundingClientRect();
        const offset = (bounds.left + bounds.width / 2 - gridCenter) / bounds.width;
        const distance = Math.min(1.4, Math.abs(offset));
        const angle = reduceMotion ? 0 : Math.max(-34, Math.min(34, -offset * 32));
        const depth = reduceMotion ? 0 : -Math.round(distance * 78);
        const scale = reduceMotion ? 1 : Math.max(.82, 1 - distance * .14);
        const opacity = reduceMotion ? 1 : Math.max(.48, 1 - distance * .38);
        card.style.setProperty("--carousel-angle", `${angle}deg`);
        card.style.setProperty("--carousel-depth", `${depth}px`);
        card.style.setProperty("--carousel-scale", scale.toFixed(3));
        card.style.setProperty("--carousel-opacity", opacity.toFixed(3));
        card.classList.toggle("is-centered", distance < .42);
      });
    };
    const scheduleCarouselUpdate = () => {
      if (!carouselFrame) carouselFrame = requestAnimationFrame(updatePhotoCarousel);
    };
    const loopScroll = () => {
      loopFrame = 0;
      if (photoGrid.scrollLeft < loopStart - loopSpan / 2) {
        photoGrid.scrollLeft += loopSpan;
      } else if (photoGrid.scrollLeft > loopStart + loopSpan - photoGrid.clientWidth / 2) {
        photoGrid.scrollLeft -= loopSpan;
      }
      scheduleCarouselUpdate();
    };
    photoGrid.addEventListener("scroll", () => {
      if (!loopFrame) loopFrame = requestAnimationFrame(loopScroll);
    }, { passive: true });
    window.addEventListener("resize", () => {
      measureLoop();
      scheduleCarouselUpdate();
    }, { passive: true });
    scheduleCarouselUpdate();
    photoGrid.addEventListener("wheel", event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxLeft = photoGrid.scrollWidth - photoGrid.clientWidth;
      if ((event.deltaY > 0 && photoGrid.scrollLeft < maxLeft) || (event.deltaY < 0 && photoGrid.scrollLeft > 0)) {
        event.preventDefault();
        photoGrid.scrollBy({ left: event.deltaY, behavior: reduceMotion ? "auto" : "smooth" });
      }
    }, { passive: false });
  }
  function closeLightbox() { lightbox.classList.add("hidden"); lightboxImage.src = ""; }
  $("closeLightbox").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
  $("backTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Shared backend is enabled only when both public Supabase settings are supplied.
  // Without them, localStorage demo works on this browser only.
  const usingSupabase = Boolean(supabaseUrl && supabaseAnonKey);
  $("storageNote").textContent = usingSupabase
    ? "Wishes are shared through the configured Supabase project."
    : "Demo mode: wishes are saved only in this browser and are not shared with other visitors.";
  const form = $("wishForm"), nameInput = $("guestName"), messageInput = $("wishMessage");
  const errorBox = $("formError"), list = $("wishList"), count = $("wishCount"), submit = $("sendWish");
  messageInput.addEventListener("input", () => $("charCount").textContent = `${messageInput.value.length} / 500`);

  function getLocalWishes() {
    try { const data = JSON.parse(localStorage.getItem(wishesKey) || "[]"); return Array.isArray(data) ? data : []; }
    catch { return []; }
  }
  function saveLocalWishes(data) { localStorage.setItem(wishesKey, JSON.stringify(data)); }
  function escapeText(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function renderWishes(items) {
    items.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    count.textContent = `${items.length} ${items.length === 1 ? "wish" : "wishes"}`;
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("div"); empty.className = "empty-wishes";
      empty.innerHTML = '<span>♡</span><p>The first little wish is waiting to be written.</p>'; list.appendChild(empty); return;
    }
    items.forEach(item => {
      const article = document.createElement("article"); article.className = "wish-item";
      const head = document.createElement("div"); head.className = "wish-item-head";
      const name = document.createElement("strong"); name.textContent = item.name;
      const date = document.createElement("time"); date.dateTime = item.created_at;
      date.textContent = new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",year:"numeric"}).format(new Date(item.created_at));
      const message = document.createElement("p"); message.textContent = item.message;
      head.append(name,date); article.append(head,message); list.appendChild(article);
    });
  }
  async function loadWishes() {
    if (usingSupabase) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/wishes?select=name,message,created_at&order=created_at.desc&limit=100`, {
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
        });
        if (!response.ok) throw new Error("Could not load shared wishes.");
        renderWishes(await response.json()); return;
      } catch (err) { $("storageNote").textContent = "Shared wishes could not load. Check Supabase settings and connection."; }
    }
    renderWishes(getLocalWishes());
  }
  form.addEventListener("submit", async e => {
    e.preventDefault(); errorBox.textContent = ""; $("successMessage").classList.add("hidden");
    const name = nameInput.value.trim(), message = messageInput.value.trim();
    if (!name) { errorBox.textContent = "Please enter your name."; nameInput.focus(); return; }
    if (!message) { errorBox.textContent = "Please write a little birthday wish."; messageInput.focus(); return; }
    if (name.length > 60 || message.length > 500) { errorBox.textContent = "Please shorten your entry and try again."; return; }
    submit.disabled = true; submit.style.opacity = ".7";
    try {
      const entry = { name, message, created_at: new Date().toISOString() };
      if (usingSupabase) {
        const response = await fetch(`${supabaseUrl}/rest/v1/wishes`, {
          method: "POST",
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ name, message })
        });
        if (!response.ok) throw new Error("Your wish could not be saved. Please try again.");
        await loadWishes();
      } else {
        const items = getLocalWishes();
        // Prevent accidental rapid duplicate submissions by the same guest/message.
        const duplicate = items.some(x => x.name.toLowerCase() === name.toLowerCase() && x.message === message && Date.now() - new Date(x.created_at).getTime() < 15000);
        if (!duplicate) { items.push(entry); saveLocalWishes(items); }
        renderWishes(getLocalWishes());
      }
      form.reset(); $("charCount").textContent = "0 / 500";
      $("successMessage").classList.remove("hidden");
      $("successMessage").scrollIntoView({behavior: reduceMotion ? "auto" : "smooth",block:"nearest"});
    } catch (err) { errorBox.textContent = err.message || "Something went wrong. Please try again."; }
    finally { submit.disabled = false; submit.style.opacity = "1"; }
  });
  // Reveal event details by activating the button with a click, tap, or keyboard.
  const revealCard = $("eventReveal"), revealButton = $("revealEventDetails"), revealContent = $("eventDetails");
  const revealStatus = revealButton?.querySelector("strong");
  const hideRevealButton = $("hideEventDetails");
  function setEventReveal(isOpen) {
    revealCard?.classList.toggle("is-revealed", isOpen);
    revealButton?.setAttribute("aria-expanded", String(isOpen));
    revealContent?.setAttribute("aria-hidden", String(!isOpen));
    if (revealStatus) revealStatus.textContent = isOpen ? "Event details revealed" : "View event details";
  }
  revealButton?.addEventListener("click", () => {
    setEventReveal(!revealCard?.classList.contains("is-revealed"));
  });
  hideRevealButton?.addEventListener("click", () => setEventReveal(false));
  // Pastel animal faces drift along the page edges when guests scroll down.
  const animalHost = $("floatingAnimals");
  const animalArt = [
    `<svg viewBox="0 0 80 80"><ellipse cx="25" cy="20" rx="8" ry="17" fill="#f3c9d5"/><ellipse cx="55" cy="20" rx="8" ry="17" fill="#f3c9d5"/><circle cx="40" cy="46" r="27" fill="#ffe6eb"/><circle cx="31" cy="43" r="2.5" fill="#665b66"/><circle cx="49" cy="43" r="2.5" fill="#665b66"/><ellipse cx="40" cy="51" rx="4" ry="3" fill="#d8899b"/><path d="M40 54q-5 6-9 1m9-1q5 6 9 1" fill="none" stroke="#8a6770" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 80 80"><circle cx="22" cy="29" r="12" fill="#eac9b8"/><circle cx="58" cy="29" r="12" fill="#eac9b8"/><circle cx="40" cy="45" r="27" fill="#f4dfcf"/><circle cx="31" cy="42" r="2.5" fill="#655d58"/><circle cx="49" cy="42" r="2.5" fill="#655d58"/><ellipse cx="40" cy="51" rx="5" ry="4" fill="#bd8f83"/><path d="M34 56q6 6 12 0" fill="none" stroke="#8a6e66" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 80 80"><ellipse cx="40" cy="46" rx="27" ry="24" fill="#fff0ad"/><circle cx="26" cy="24" r="9" fill="#fff0ad"/><circle cx="42" cy="20" r="10" fill="#fff0ad"/><circle cx="55" cy="25" r="8" fill="#fff0ad"/><circle cx="32" cy="43" r="2.4" fill="#62594c"/><circle cx="49" cy="43" r="2.4" fill="#62594c"/><path d="M39 49l9 3-9 4z" fill="#edaa75"/></svg>`,
    `<svg viewBox="0 0 80 80"><path d="M15 34 19 13l17 15m8 0 17-15 4 23" fill="#d8e9d3" stroke="#9fbd9c" stroke-width="2"/><path d="M14 43q0-20 26-20t26 20v13q-2 13-26 13T14 56z" fill="#e6f0df"/><circle cx="31" cy="47" r="2.4" fill="#58675c"/><circle cx="49" cy="47" r="2.4" fill="#58675c"/><path d="M37 53h6m-3 0q-4 5-8 1m8-1q4 5 8 1" fill="none" stroke="#7e9280" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 80 80"><path d="M13 36 18 12l19 16M67 36 62 12 43 28" fill="#f2b8a7" stroke="#d78b7f" stroke-width="2"/><path d="M13 44q0-22 27-22t27 22q0 27-27 27T13 44" fill="#ffd5c8"/><path d="M22 48q5-8 10 0m16 0q5-8 10 0" fill="none" stroke="#715b59" stroke-width="3"/><path d="M36 54q4-4 8 0l-4 4z" fill="#bd7180"/><path d="M40 58q-4 5-8 1m8-1q4 5 8 1" fill="none" stroke="#8e6666" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 80 80"><path d="M13 34 20 9l19 20m9 0L67 9l4 27" fill="#efc4a4" stroke="#c89377" stroke-width="2"/><path d="M13 45q0-22 27-22t27 22q0 26-27 26T13 45" fill="#f8dfc5"/><circle cx="31" cy="45" r="2.5" fill="#655d58"/><circle cx="49" cy="45" r="2.5" fill="#655d58"/><ellipse cx="40" cy="53" rx="5" ry="4" fill="#be8f82"/><path d="M34 58q6 6 12 0" fill="none" stroke="#8a6e66" stroke-width="2"/><path d="M23 34q17 8 34 0" fill="none" stroke="#d1a786" stroke-width="3"/></svg>`,
    `<svg viewBox="0 0 80 80"><path d="M14 36 19 12l19 18m9 0L66 12l4 25" fill="#f5c6a6" stroke="#db9a78" stroke-width="2"/><path d="M13 45q0-23 27-23t27 23q0 26-27 26T13 45" fill="#ffe1c6"/><circle cx="31" cy="46" r="2.5" fill="#655d58"/><circle cx="49" cy="46" r="2.5" fill="#655d58"/><path d="m36 53 4-3 4 3-4 4z" fill="#d08a83"/><path d="M40 57v4m0 0q-4 4-7 0m7 0q4 4 7 0" fill="none" stroke="#8a6e66" stroke-width="2"/><circle cx="24" cy="54" r="4" fill="#f0a8a0" opacity=".7"/><circle cx="56" cy="54" r="4" fill="#f0a8a0" opacity=".7"/></svg>`,
    `<svg viewBox="0 0 80 80"><circle cx="22" cy="28" r="13" fill="#d8bdad"/><circle cx="58" cy="28" r="13" fill="#d8bdad"/><circle cx="40" cy="45" r="28" fill="#ead8ca"/><circle cx="31" cy="42" r="2.5" fill="#665b56"/><circle cx="49" cy="42" r="2.5" fill="#665b56"/><ellipse cx="40" cy="51" rx="9" ry="7" fill="#fff2e8"/><ellipse cx="40" cy="49" rx="4" ry="3" fill="#b88279"/><path d="M36 55q4 4 8 0" fill="none" stroke="#8a6e66" stroke-width="2"/></svg>`
  ];
  function spawnScrollAnimal() {
    if (reduceMotion || !animalHost || animalHost.childElementCount >= 8) return;
    const critter = document.createElement("span"), fromLeft = Math.random() < 0.5;
    critter.className = `floating-animal ${fromLeft ? "from-left" : "from-right"}`;
    critter.style.top = `${52 + Math.random() * 36}vh`;
    critter.style.setProperty("--float-duration", `${6.2 + Math.random() * 2.4}s`);
    critter.innerHTML = animalArt[Math.floor(Math.random() * animalArt.length)];
    animalHost.appendChild(critter);
    window.setTimeout(() => critter.remove(), 9000);
  }
  let previousScrollY = window.scrollY, lastAnimalScrollY = window.scrollY, lastAnimalTime = 0;
  window.addEventListener("scroll", () => {
    const currentY = window.scrollY, now = performance.now();
    if (!reduceMotion && currentY > previousScrollY && currentY - lastAnimalScrollY > 75 && now - lastAnimalTime > 260) {
      spawnScrollAnimal();
      lastAnimalScrollY = currentY; lastAnimalTime = now;
    }
    previousScrollY = currentY;
  }, { passive: true });
  loadWishes();
})();







