document.addEventListener(
  "DOMContentLoaded",
  async function () {

  // ==========================================
  // ELEMENTY HTML
  // ==========================================

  const currentDate =
    document.getElementById("currentDate");

  const currentTime =
    document.getElementById("currentTime");

  const taskForm =
    document.getElementById("taskForm");

  const taskTitle =
    document.getElementById("taskTitle");

  const taskTime =
    document.getElementById("taskTime");

  const taskNote =
    document.getElementById("taskNote");

  const taskList =
    document.getElementById("taskList");

  const taskCount =
    document.getElementById("taskCount");

  const emptyState =
    document.getElementById("emptyState");

  const taskTemplate =
    document.getElementById("taskTemplate");

  const addTaskButton =
    document.getElementById("addTaskButton");

  const cancelEditButton =
    document.getElementById("cancelEditButton");

  const clearAllButton =
    document.getElementById("clearAllButton");

  const taskLimitMessage =
    document.getElementById("taskLimitMessage");


  // AUTO CLEANUP

  const cleanupDate =
    document.getElementById("cleanupDate");

  const cleanupTime =
    document.getElementById("cleanupTime");

  const setCleanupButton =
    document.getElementById("setCleanupButton");

  const cancelCleanupButton =
    document.getElementById("cancelCleanupButton");

  const cleanupStatus =
    document.getElementById("cleanupStatus");


  // MODAL CZYSZCZENIA

  const clearModal =
    document.getElementById("clearModal");

  const cancelClearButton =
    document.getElementById("cancelClearButton");

  const confirmClearButton =
    document.getElementById("confirmClearButton");


  // PIN

  const pinStatus =
    document.getElementById("pinStatus");

  const setPinButton =
    document.getElementById("setPinButton");

  const lockNowButton =
    document.getElementById("lockNowButton");

  const disablePinButton =
    document.getElementById("disablePinButton");

  const pinModal =
    document.getElementById("pinModal");

  const pinInput =
    document.getElementById("pinInput");

  const pinConfirmInput =
    document.getElementById("pinConfirmInput");

  const pinModalMessage =
    document.getElementById("pinModalMessage");

  const cancelPinButton =
    document.getElementById("cancelPinButton");

  const savePinButton =
    document.getElementById("savePinButton");

  const lockScreen =
    document.getElementById("lockScreen");

  const unlockPinInput =
    document.getElementById("unlockPinInput");

  const unlockButton =
    document.getElementById("unlockButton");

  const unlockMessage =
    document.getElementById("unlockMessage");

  const resetFocusButton =
    document.getElementById("resetFocusButton");


  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  const STORAGE_KEY =
    "focus5Tasks";

  const CLEANUP_KEY =
    "focus5CleanupAt";

  const PIN_ENABLED_KEY =
    "focus5PinEnabled";

  const PIN_SALT_KEY =
    "focus5PinSalt";

  const PIN_VERIFIER_KEY =
    "focus5PinVerifier";

  const ENCRYPTED_TASKS_KEY =
    "focus5EncryptedTasks";


  // ==========================================
  // CRYPTO
  // ==========================================

  const PIN_VERIFIER_TEXT =
    "focus5-pin-verifier-v1";

  const PBKDF2_ITERATIONS =
    200000;


  // ==========================================
  // STAN APLIKACJI
  // ==========================================

  let tasks = [];

  let editingTaskId =
    null;

  let cleanupAt =
    null;

  let pinEnabled =
    localStorage.getItem(
      PIN_ENABLED_KEY
    ) === "true";

  let sessionKey =
    null;

  let isLocked =
    pinEnabled;


  // ==========================================
  // BASE64
  // ==========================================

  function bytesToBase64(bytes) {

    let binary =
      "";


    bytes.forEach(function (byte) {

      binary +=
        String.fromCharCode(byte);

    });


    return btoa(binary);

  }


  function base64ToBytes(base64) {

    const binary =
      atob(base64);


    const bytes =
      new Uint8Array(
        binary.length
      );


    for (
      let i = 0;
      i < binary.length;
      i++
    ) {

      bytes[i] =
        binary.charCodeAt(i);

    }


    return bytes;

  }


  // ==========================================
  // GENEROWANIE KLUCZA Z PIN-U
  // ==========================================

  async function derivePinKey(
    pin,
    salt
  ) {

    const encoder =
      new TextEncoder();


    const keyMaterial =
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(pin),
        "PBKDF2",
        false,
        [
          "deriveKey"
        ]
      );


    return crypto.subtle.deriveKey(
      {
        name:
          "PBKDF2",

        salt:
          salt,

        iterations:
          PBKDF2_ITERATIONS,

        hash:
          "SHA-256"
      },

      keyMaterial,

      {
        name:
          "AES-GCM",

        length:
          256
      },

      false,

      [
        "encrypt",
        "decrypt"
      ]
    );

  }


  // ==========================================
  // SZYFROWANIE
  // ==========================================

  async function encryptString(
    text,
    key
  ) {

    const encoder =
      new TextEncoder();


    const iv =
      crypto.getRandomValues(
        new Uint8Array(12)
      );


    const encrypted =
      await crypto.subtle.encrypt(
        {
          name:
            "AES-GCM",

          iv:
            iv
        },

        key,

        encoder.encode(text)
      );


    return JSON.stringify({

      iv:
        bytesToBase64(iv),

      data:
        bytesToBase64(
          new Uint8Array(
            encrypted
          )
        )

    });

  }


  // ==========================================
  // ODSZYFROWANIE
  // ==========================================

  async function decryptString(
    bundleString,
    key
  ) {

    const bundle =
      JSON.parse(bundleString);


    const iv =
      base64ToBytes(
        bundle.iv
      );

    const encrypted =
      base64ToBytes(
        bundle.data
      );


    const decrypted =
      await crypto.subtle.decrypt(
        {
          name:
            "AES-GCM",

          iv:
            iv
        },

        key,

        encrypted
      );


    return new TextDecoder()
      .decode(decrypted);

  }


  // ==========================================
  // WALIDACJA PIN-U
  // ==========================================

  function isValidPin(pin) {

    return /^\d{4}$/.test(pin);

  }


  function restrictPinInput(input) {

    input.addEventListener(
      "input",
      function () {

        input.value =
          input.value
            .replace(/\D/g, "")
            .slice(0, 4);

      }
    );

  }


  restrictPinInput(pinInput);

  restrictPinInput(
    pinConfirmInput
  );

  restrictPinInput(
    unlockPinInput
  );


  // ==========================================
  // TWORZENIE OPCJI GODZINY
  // ==========================================

  function createTimeOption(
    time,
    label = time
  ) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      time;

    option.textContent =
      label;

    return option;

  }


  // ==========================================
  // GODZINY ZADANIA
  // ==========================================

  function populateTaskTimeOptions(
    preservedTime = "",
    allowPastPreserved = false
  ) {

    taskTime.innerHTML =
      "";


    taskTime.appendChild(
      createTimeOption(
        "",
        "Bez godziny"
      )
    );


    const now =
      new Date();


    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();


    for (
      let hour = 0;
      hour < 24;
      hour++
    ) {

      for (
        let minute = 0;
        minute < 60;
        minute += 15
      ) {

        const optionMinutes =
          hour * 60 +
          minute;


        if (
          optionMinutes <
          currentMinutes
        ) {

          continue;

        }


        const hourText =
          String(hour)
            .padStart(2, "0");

        const minuteText =
          String(minute)
            .padStart(2, "0");


        const time =
          hourText +
          ":" +
          minuteText;


        taskTime.appendChild(
          createTimeOption(time)
        );

      }

    }


    if (preservedTime) {

      let exists =
        Array.from(
          taskTime.options
        ).some(function (option) {

          return (
            option.value ===
            preservedTime
          );

        });


      if (
        !exists &&
        allowPastPreserved
      ) {

        taskTime.appendChild(
          createTimeOption(
            preservedTime,
            preservedTime +
            " · ustawione wcześniej"
          )
        );

        exists =
          true;

      }


      if (exists) {

        taskTime.value =
          preservedTime;

      }

    }

  }


  // ==========================================
  // GODZINY AUTO CLEANUP
  // ==========================================

  function populateCleanupTimeOptions(
    preservedTime = "",
    allowCustomPreserved = false
  ) {

    cleanupTime.innerHTML =
      "";


    cleanupTime.appendChild(
      createTimeOption(
        "",
        "Wybierz godzinę"
      )
    );


    const now =
      new Date();

    const today =
      getDateInputValue(now);

    const selectedDate =
      cleanupDate.value;


    const currentMinutes =
      now.getHours() * 60 +
      now.getMinutes();


    for (
      let hour = 0;
      hour < 24;
      hour++
    ) {

      for (
        let minute = 0;
        minute < 60;
        minute += 15
      ) {

        const optionMinutes =
          hour * 60 +
          minute;


        if (
          selectedDate === today &&
          optionMinutes <
          currentMinutes
        ) {

          continue;

        }


        const hourText =
          String(hour)
            .padStart(2, "0");

        const minuteText =
          String(minute)
            .padStart(2, "0");


        const time =
          hourText +
          ":" +
          minuteText;


        cleanupTime.appendChild(
          createTimeOption(time)
        );

      }

    }


    if (preservedTime) {

      let exists =
        Array.from(
          cleanupTime.options
        ).some(function (option) {

          return (
            option.value ===
            preservedTime
          );

        });


      if (
        !exists &&
        allowCustomPreserved
      ) {

        cleanupTime.appendChild(
          createTimeOption(
            preservedTime
          )
        );

        exists =
          true;

      }


      if (exists) {

        cleanupTime.value =
          preservedTime;

      }

    }

  }


  // ==========================================
  // WCZYTYWANIE ZADAŃ
  // ==========================================

  async function loadTasks() {

    if (pinEnabled) {

      tasks = [];

      return;

    }


    const savedTasks =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!savedTasks) {

      tasks = [];

      return;

    }


    try {

      const parsedTasks =
        JSON.parse(savedTasks);


      if (
        Array.isArray(parsedTasks)
      ) {

        tasks =
          parsedTasks.slice(
            0,
            5
          );

      } else {

        tasks = [];

      }

    } catch (error) {

      console.error(
        "Nie udało się wczytać zadań:",
        error
      );


      tasks = [];

    }

  }


  // ==========================================
  // WCZYTYWANIE ZASZYFROWANYCH ZADAŃ
  // ==========================================

  async function loadEncryptedTasks(
    key
  ) {

    const encryptedTasks =
      localStorage.getItem(
        ENCRYPTED_TASKS_KEY
      );


    if (!encryptedTasks) {

      tasks = [];

      return;

    }


    const decrypted =
      await decryptString(
        encryptedTasks,
        key
      );


    const parsed =
      JSON.parse(decrypted);


    if (
      Array.isArray(parsed)
    ) {

      tasks =
        parsed.slice(0, 5);

    } else {

      tasks = [];

    }

  }


  // ==========================================
  // ZAPISYWANIE ZADAŃ
  // ==========================================

  async function saveTasks() {

    if (pinEnabled) {

      if (!sessionKey) {

        return;

      }


      const encrypted =
        await encryptString(
          JSON.stringify(tasks),
          sessionKey
        );


      localStorage.setItem(
        ENCRYPTED_TASKS_KEY,
        encrypted
      );


      localStorage.removeItem(
        STORAGE_KEY
      );


      return;

    }


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tasks)
    );

  }


  // ==========================================
  // DATA I GODZINA
  // ==========================================

  function updateClock() {

    const now =
      new Date();


    const dateFormatter =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          weekday:
            "short",

          day:
            "2-digit",

          month:
            "short"
        }
      );


    const timeFormatter =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          hour:
            "2-digit",

          minute:
            "2-digit",

          second:
            "2-digit"
        }
      );


    currentDate.textContent =
      dateFormatter.format(now);

    currentTime.textContent =
      timeFormatter.format(now);

  }


  function getCurrentShortTime() {

    return new Intl.DateTimeFormat(
      "pl-PL",
      {
        hour:
          "2-digit",

        minute:
          "2-digit"
      }
    ).format(
      new Date()
    );

  }


  // ==========================================
  // STATUS CZASU ZADANIA
  // ==========================================

  function getTaskTimeStatus(task) {

    if (
      !task.time ||
      task.completed
    ) {

      return null;

    }


    const now =
      new Date();


    const timeParts =
      task.time.split(":");


    const taskDate =
      new Date();


    taskDate.setHours(
      Number(timeParts[0]),
      Number(timeParts[1]),
      0,
      0
    );


    const differenceMinutes =
      Math.round(
        (
          taskDate.getTime() -
          now.getTime()
        ) /
        60000
      );


    if (
      differenceMinutes >
      60
    ) {

      return null;

    }


    if (
      differenceMinutes > 0
    ) {

      return {

        text:
          "za " +
          differenceMinutes +
          " min",

        type:
          "soon"

      };

    }


    if (
      differenceMinutes >= -1
    ) {

      return {

        text:
          "TERAZ",

        type:
          "now"

      };

    }


    return {

      text:
        Math.abs(
          differenceMinutes
        ) +
        " min po terminie",

      type:
        "overdue"

    };

  }


  // ==========================================
  // DATA INPUT
  // ==========================================

  function getDateInputValue(date) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );


    return (
      year +
      "-" +
      month +
      "-" +
      day
    );

  }


  function setDefaultCleanupDate() {

    const today =
      getDateInputValue(
        new Date()
      );


    cleanupDate.min =
      today;


    if (!cleanupDate.value) {

      cleanupDate.value =
        today;

    }

  }


  // ==========================================
  // LIMIT 5
  // ==========================================

  function updateTaskLimitState() {

    const limitReached =
      tasks.length >= 5;


    if (
      editingTaskId !== null
    ) {

      addTaskButton.disabled =
        false;

      taskLimitMessage.hidden =
        true;

      addTaskButton.textContent =
        "Zapisz zmiany";

      return;

    }


    addTaskButton.disabled =
      limitReached;


    taskLimitMessage.hidden =
      !limitReached;


    addTaskButton.textContent =
      limitReached
        ? "Limit 5 osiągnięty"
        : "+ Dodaj zadanie";

  }


  // ==========================================
  // RENDEROWANIE
  // ==========================================

  function renderTasks() {

    taskList.innerHTML =
      "";


    taskCount.textContent =
      tasks.length;


    clearAllButton.disabled =
      tasks.length === 0;


    updateTaskLimitState();


    if (
      tasks.length === 0
    ) {

      emptyState.style.display =
        "block";

      return;

    }


    emptyState.style.display =
      "none";


    tasks.forEach(function (task) {

      const fragment =
        taskTemplate.content.cloneNode(
          true
        );


      const taskItem =
        fragment.querySelector(
          ".task-item"
        );

      const titleElement =
        fragment.querySelector(
          ".task-title"
        );

      const timeElement =
        fragment.querySelector(
          ".task-time"
        );

      const timeStatusElement =
        fragment.querySelector(
          ".task-time-status"
        );

      const noteElement =
        fragment.querySelector(
          ".task-note"
        );

      const completedTimeElement =
        fragment.querySelector(
          ".task-completed-time"
        );

      const checkButton =
        fragment.querySelector(
          ".task-check"
        );


      taskItem.dataset.id =
        task.id;


      titleElement.textContent =
        task.title;


      if (task.time) {

        timeElement.textContent =
          task.time;

      } else {

        timeElement.style.display =
          "none";

      }


      const timeStatus =
        getTaskTimeStatus(task);


      if (
        timeStatus &&
        timeStatusElement
      ) {

        timeStatusElement.textContent =
          timeStatus.text;


        timeStatusElement.classList.add(
          timeStatus.type
        );


        timeStatusElement.style.display =
          "inline-block";

      } else if (
        timeStatusElement
      ) {

        timeStatusElement.style.display =
          "none";

      }


      if (task.note) {

        noteElement.textContent =
          task.note;

      } else {

        noteElement.style.display =
          "none";

      }


      if (task.completed) {

        taskItem.classList.add(
          "completed"
        );


        checkButton.setAttribute(
          "aria-label",
          "Oznacz zadanie jako niewykonane"
        );


        if (task.completedAt) {

          completedTimeElement.textContent =
            "Zakończono: " +
            task.completedAt;

        }

      } else {

        checkButton.setAttribute(
          "aria-label",
          "Oznacz zadanie jako wykonane"
        );


        completedTimeElement.style.display =
          "none";

      }


      taskList.appendChild(
        fragment
      );

    });

  }


  // ==========================================
  // DODAWANIE / EDYCJA
  // ==========================================

  taskForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      if (isLocked) {
        return;
      }


      const title =
        taskTitle.value.trim();

      const time =
        taskTime.value;

      const note =
        taskNote.value.trim();


      if (!title) {
        return;
      }


      if (
        editingTaskId !== null
      ) {

        const task =
          tasks.find(function (task) {

            return (
              task.id ===
              editingTaskId
            );

          });


        if (!task) {

          resetForm();

          return;

        }


        task.title =
          title;

        task.time =
          time;

        task.note =
          note;


        await saveTasks();

        resetForm();

        renderTasks();

        return;

      }


      if (
        tasks.length >= 5
      ) {

        updateTaskLimitState();

        return;

      }


      tasks.push({

        id:
          Date.now(),

        title:
          title,

        time:
          time,

        note:
          note,

        completed:
          false,

        completedAt:
          null

      });


      await saveTasks();

      renderTasks();

      resetForm();

    }
  );


  // ==========================================
  // PRZYCISKI ZADAŃ
  // ==========================================

  taskList.addEventListener(
    "click",
    async function (event) {

      if (isLocked) {
        return;
      }


      const clickedButton =
        event.target.closest(
          "button"
        );


      if (!clickedButton) {
        return;
      }


      const taskItem =
        clickedButton.closest(
          ".task-item"
        );


      if (!taskItem) {
        return;
      }


      const taskId =
        Number(
          taskItem.dataset.id
        );


      if (
        clickedButton.classList.contains(
          "task-check"
        )
      ) {

        await toggleTask(
          taskId
        );

        return;

      }


      if (
        clickedButton.classList.contains(
          "task-edit"
        )
      ) {

        startEditingTask(
          taskId
        );

        return;

      }


      if (
        clickedButton.classList.contains(
          "task-delete"
        )
      ) {

        await deleteTask(
          taskId
        );

      }

    }
  );


  async function toggleTask(
    taskId
  ) {

    const task =
      tasks.find(function (task) {

        return (
          task.id === taskId
        );

      });


    if (!task) {
      return;
    }


    task.completed =
      !task.completed;


    task.completedAt =
      task.completed
        ? getCurrentShortTime()
        : null;


    await saveTasks();

    renderTasks();

  }


  async function deleteTask(
    taskId
  ) {

    tasks =
      tasks.filter(function (task) {

        return (
          task.id !== taskId
        );

      });


    if (
      editingTaskId === taskId
    ) {

      resetForm();

    }


    await saveTasks();

    renderTasks();

  }


  // ==========================================
  // EDYCJA
  // ==========================================

  function startEditingTask(
    taskId
  ) {

    const task =
      tasks.find(function (task) {

        return (
          task.id === taskId
        );

      });


    if (!task) {
      return;
    }


    editingTaskId =
      task.id;


    taskTitle.value =
      task.title;


    populateTaskTimeOptions(
      task.time || "",
      true
    );


    taskTime.value =
      task.time || "";


    taskNote.value =
      task.note || "";


    addTaskButton.disabled =
      false;

    taskLimitMessage.hidden =
      true;

    addTaskButton.textContent =
      "Zapisz zmiany";


    cancelEditButton.hidden =
      false;


    taskTitle.focus();


    taskForm.scrollIntoView({
      behavior:
        "smooth",

      block:
        "center"
    });

  }


  cancelEditButton.addEventListener(
    "click",
    function () {

      resetForm();

    }
  );


  function resetForm() {

    editingTaskId =
      null;


    taskForm.reset();


    populateTaskTimeOptions();


    cancelEditButton.hidden =
      true;


    updateTaskLimitState();


    if (!isLocked) {

      taskTitle.focus();

    }

  }


  // ==========================================
  // CLEAR MODAL
  // ==========================================

  function openClearModal() {

    if (
      tasks.length === 0 ||
      isLocked
    ) {

      return;

    }


    clearModal.classList.add(
      "open"
    );

    clearModal.setAttribute(
      "aria-hidden",
      "false"
    );


    confirmClearButton.focus();

  }


  function closeClearModal() {

    clearModal.classList.remove(
      "open"
    );

    clearModal.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  clearAllButton.addEventListener(
    "click",
    function () {

      openClearModal();

    }
  );


  cancelClearButton.addEventListener(
    "click",
    function () {

      closeClearModal();

    }
  );


  confirmClearButton.addEventListener(
    "click",
    async function () {

      await clearAllTasks();

      closeClearModal();

    }
  );


  clearModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        clearModal
      ) {

        closeClearModal();

      }

    }
  );


  // ==========================================
  // CZYSZCZENIE ZADAŃ
  // ==========================================

  async function clearAllTasks() {

    tasks =
      [];

    editingTaskId =
      null;


    if (pinEnabled) {

      if (sessionKey) {

        await saveTasks();

      } else {

        // Auto-wipe może nastąpić,
        // gdy aplikacja jest zablokowana.
        // Usuwamy wtedy zaszyfrowaną listę.

        localStorage.removeItem(
          ENCRYPTED_TASKS_KEY
        );

      }

    } else {

      localStorage.removeItem(
        STORAGE_KEY
      );

    }


    resetForm();

    renderTasks();

  }


  // ==========================================
  // CLEANUP
  // ==========================================

  function loadCleanupSchedule() {

    const savedCleanup =
      localStorage.getItem(
        CLEANUP_KEY
      );


    if (!savedCleanup) {

      cleanupAt =
        null;

      return;

    }


    const parsedCleanup =
      Number(savedCleanup);


    if (
      !Number.isFinite(
        parsedCleanup
      )
    ) {

      localStorage.removeItem(
        CLEANUP_KEY
      );

      cleanupAt =
        null;

      return;

    }


    cleanupAt =
      parsedCleanup;

  }


  function restoreCleanupFields() {

    if (!cleanupAt) {
      return;
    }


    const targetDate =
      new Date(
        cleanupAt
      );


    cleanupDate.value =
      getDateInputValue(
        targetDate
      );


    const hours =
      String(
        targetDate.getHours()
      ).padStart(
        2,
        "0"
      );


    const minutes =
      String(
        targetDate.getMinutes()
      ).padStart(
        2,
        "0"
      );


    populateCleanupTimeOptions(
      hours +
      ":" +
      minutes,

      true
    );

  }


  cleanupDate.addEventListener(
    "change",
    function () {

      populateCleanupTimeOptions(
        cleanupTime.value
      );

    }
  );


  setCleanupButton.addEventListener(
    "click",
    function () {

      if (isLocked) {
        return;
      }


      const selectedDate =
        cleanupDate.value;

      const selectedTime =
        cleanupTime.value;


      if (!selectedDate) {

        alert(
          "Wybierz dzień automatycznego czyszczenia."
        );

        return;

      }


      if (!selectedTime) {

        alert(
          "Wybierz godzinę automatycznego czyszczenia."
        );

        return;

      }


      const targetDate =
        new Date(
          selectedDate +
          "T" +
          selectedTime +
          ":00"
        );


      if (
        Number.isNaN(
          targetDate.getTime()
        )
      ) {

        return;

      }


      if (
        targetDate.getTime() <=
        Date.now()
      ) {

        alert(
          "Termin automatycznego czyszczenia musi być w przyszłości."
        );

        return;

      }


      cleanupAt =
        targetDate.getTime();


      localStorage.setItem(
        CLEANUP_KEY,
        String(cleanupAt)
      );


      updateCleanupStatus();

    }
  );


  cancelCleanupButton.addEventListener(
    "click",
    function () {

      removeCleanupSchedule();


      cleanupStatus.textContent =
        "Automatyczne czyszczenie jest wyłączone.";

    }
  );


  function removeCleanupSchedule() {

    cleanupAt =
      null;


    localStorage.removeItem(
      CLEANUP_KEY
    );


    cancelCleanupButton.hidden =
      true;

  }


  function formatCountdown(
    milliseconds
  ) {

    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          milliseconds /
          1000
        )
      );


    const hours =
      Math.floor(
        totalSeconds /
        3600
      );


    const minutes =
      Math.floor(
        (
          totalSeconds %
          3600
        ) /
        60
      );


    const seconds =
      totalSeconds %
      60;


    return (
      String(hours)
        .padStart(2, "0") +
      ":" +
      String(minutes)
        .padStart(2, "0") +
      ":" +
      String(seconds)
        .padStart(2, "0")
    );

  }


  async function updateCleanupStatus() {

    if (!cleanupAt) {

      cleanupStatus.textContent =
        "Automatyczne czyszczenie jest wyłączone.";


      cancelCleanupButton.hidden =
        true;

      return;

    }


    const now =
      Date.now();


    if (
      now >= cleanupAt
    ) {

      await clearAllTasks();

      removeCleanupSchedule();


      cleanupStatus.textContent =
        "Lista została automatycznie wyczyszczona.";

      return;

    }


    const targetDate =
      new Date(
        cleanupAt
      );


    const formattedDate =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          day:
            "2-digit",

          month:
            "2-digit",

          year:
            "numeric"
        }
      ).format(
        targetDate
      );


    const formattedTime =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      ).format(
        targetDate
      );


    cleanupStatus.textContent =
      "Lista zostanie wyczyszczona " +
      formattedDate +
      " o " +
      formattedTime +
      " · pozostało " +
      formatCountdown(
        cleanupAt -
        now
      );


    cancelCleanupButton.hidden =
      false;

  }


  // ==========================================
  // PIN — UI
  // ==========================================

  function updatePinUI() {

    if (pinEnabled) {

      pinStatus.textContent =
        "PIN jest aktywny. Zadania są zapisane w formie zaszyfrowanej.";


      setPinButton.hidden =
        true;

      lockNowButton.hidden =
        false;

      disablePinButton.hidden =
        false;

    } else {

      pinStatus.textContent =
        "PIN jest wyłączony.";


      setPinButton.hidden =
        false;

      lockNowButton.hidden =
        true;

      disablePinButton.hidden =
        true;

    }

  }


  // ==========================================
  // PIN — MODAL
  // ==========================================

  function openPinModal() {

    pinInput.value =
      "";

    pinConfirmInput.value =
      "";

    pinModalMessage.textContent =
      "";


    pinModal.classList.add(
      "open"
    );

    pinModal.setAttribute(
      "aria-hidden",
      "false"
    );


    pinInput.focus();

  }


  function closePinModal() {

    pinModal.classList.remove(
      "open"
    );

    pinModal.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  setPinButton.addEventListener(
    "click",
    function () {

      openPinModal();

    }
  );


  cancelPinButton.addEventListener(
    "click",
    function () {

      closePinModal();

    }
  );


  pinModal.addEventListener(
    "click",
    function (event) {

      if (
        event.target ===
        pinModal
      ) {

        closePinModal();

      }

    }
  );


  // ==========================================
  // WŁĄCZANIE PIN-U
  // ==========================================

  savePinButton.addEventListener(
    "click",
    async function () {

      const pin =
        pinInput.value;

      const confirmation =
        pinConfirmInput.value;


      pinModalMessage.textContent =
        "";


      if (!isValidPin(pin)) {

        pinModalMessage.textContent =
          "PIN musi składać się dokładnie z 4 cyfr.";

        return;

      }


      if (
        pin !== confirmation
      ) {

        pinModalMessage.textContent =
          "Wprowadzone PIN-y nie są identyczne.";

        return;

      }


      if (
        !window.crypto ||
        !crypto.subtle
      ) {

        pinModalMessage.textContent =
          "Ta przeglądarka nie obsługuje wymaganej funkcji szyfrowania.";

        return;

      }


      try {

        savePinButton.disabled =
          true;

        savePinButton.textContent =
          "Włączanie...";


        const salt =
          crypto.getRandomValues(
            new Uint8Array(16)
          );


        const key =
          await derivePinKey(
            pin,
            salt
          );


        const verifier =
          await encryptString(
            PIN_VERIFIER_TEXT,
            key
          );


        const encryptedTasks =
          await encryptString(
            JSON.stringify(tasks),
            key
          );


        localStorage.setItem(
          PIN_SALT_KEY,
          bytesToBase64(
            salt
          )
        );


        localStorage.setItem(
          PIN_VERIFIER_KEY,
          verifier
        );


        localStorage.setItem(
          ENCRYPTED_TASKS_KEY,
          encryptedTasks
        );


        localStorage.setItem(
          PIN_ENABLED_KEY,
          "true"
        );


        localStorage.removeItem(
          STORAGE_KEY
        );


        pinEnabled =
          true;

        isLocked =
          false;

        sessionKey =
          key;


        closePinModal();

        updatePinUI();


      } catch (error) {

        console.error(
          "Nie udało się włączyć PIN-u:",
          error
        );


        pinModalMessage.textContent =
          "Nie udało się włączyć ochrony PIN.";

      } finally {

        savePinButton.disabled =
          false;

        savePinButton.textContent =
          "Włącz PIN";

      }

    }
  );


  // ==========================================
  // WERYFIKACJA PIN-U
  // ==========================================

  async function verifyPin(pin) {

    if (!isValidPin(pin)) {

      return null;

    }


    const saltString =
      localStorage.getItem(
        PIN_SALT_KEY
      );

    const verifier =
      localStorage.getItem(
        PIN_VERIFIER_KEY
      );


    if (
      !saltString ||
      !verifier
    ) {

      return null;

    }


    try {

      const salt =
        base64ToBytes(
          saltString
        );


      const key =
        await derivePinKey(
          pin,
          salt
        );


      const decrypted =
        await decryptString(
          verifier,
          key
        );


      if (
        decrypted !==
        PIN_VERIFIER_TEXT
      ) {

        return null;

      }


      return key;


    } catch (error) {

      return null;

    }

  }


  // ==========================================
  // BLOKADA
  // ==========================================

  function showLockScreen() {

    isLocked =
      true;


    sessionKey =
      null;


    tasks =
      [];


    editingTaskId =
      null;


    renderTasks();


    unlockPinInput.value =
      "";

    unlockMessage.textContent =
      "";


    lockScreen.classList.add(
      "open"
    );

    lockScreen.setAttribute(
      "aria-hidden",
      "false"
    );


    setTimeout(
      function () {

        unlockPinInput.focus();

      },
      50
    );

  }


  function hideLockScreen() {

    isLocked =
      false;


    lockScreen.classList.remove(
      "open"
    );

    lockScreen.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  lockNowButton.addEventListener(
    "click",
    function () {

      if (!pinEnabled) {
        return;
      }


      showLockScreen();

    }
  );


  // ==========================================
  // ODBLOKOWANIE
  // ==========================================

  async function unlockFocus() {

    const pin =
      unlockPinInput.value;


    unlockMessage.textContent =
      "";


    if (!isValidPin(pin)) {

      unlockMessage.textContent =
        "Wprowadź 4 cyfry.";

      return;

    }


    unlockButton.disabled =
      true;

    unlockButton.textContent =
      "Sprawdzanie...";


    try {

      const key =
        await verifyPin(pin);


      if (!key) {

        unlockMessage.textContent =
          "Nieprawidłowy PIN.";

        unlockPinInput.value =
          "";

        unlockPinInput.focus();

        return;

      }


      sessionKey =
        key;


      await loadEncryptedTasks(
        key
      );


      hideLockScreen();


      populateTaskTimeOptions();

      renderTasks();

      updatePinUI();


    } catch (error) {

      console.error(
        "Błąd odblokowania:",
        error
      );


      unlockMessage.textContent =
        "Nie udało się odblokować Focus5.";

    } finally {

      unlockButton.disabled =
        false;

      unlockButton.textContent =
        "Odblokuj";

    }

  }


  unlockButton.addEventListener(
    "click",
    unlockFocus
  );


  unlockPinInput.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter"
      ) {

        unlockFocus();

      }

    }
  );


  // ==========================================
  // WYŁĄCZENIE PIN-U
  // ==========================================

  disablePinButton.addEventListener(
    "click",
    async function () {

      if (
        !pinEnabled ||
        isLocked
      ) {

        return;

      }


      const confirmed =
        confirm(
          "Wyłączyć ochronę PIN? Zadania ponownie będą przechowywane lokalnie bez szyfrowania."
        );


      if (!confirmed) {
        return;
      }


      // Najpierw zapisujemy zadania
      // w zwykłym localStorage.

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
      );


      localStorage.removeItem(
        PIN_ENABLED_KEY
      );

      localStorage.removeItem(
        PIN_SALT_KEY
      );

      localStorage.removeItem(
        PIN_VERIFIER_KEY
      );

      localStorage.removeItem(
        ENCRYPTED_TASKS_KEY
      );


      pinEnabled =
        false;

      sessionKey =
        null;

      isLocked =
        false;


      updatePinUI();

    }
  );


  // ==========================================
  // RESET PRZY UTRACONYM PIN-IE
  // ==========================================

  resetFocusButton.addEventListener(
    "click",
    function () {

      const confirmed =
        confirm(
          "Zresetować Focus5? Wszystkie zapisane zadania, PIN i ustawienie automatycznego czyszczenia zostaną usunięte."
        );


      if (!confirmed) {
        return;
      }


      localStorage.removeItem(
        STORAGE_KEY
      );

      localStorage.removeItem(
        ENCRYPTED_TASKS_KEY
      );

      localStorage.removeItem(
        PIN_ENABLED_KEY
      );

      localStorage.removeItem(
        PIN_SALT_KEY
      );

      localStorage.removeItem(
        PIN_VERIFIER_KEY
      );

      localStorage.removeItem(
        CLEANUP_KEY
      );


      tasks =
        [];

      cleanupAt =
        null;

      pinEnabled =
        false;

      sessionKey =
        null;

      isLocked =
        false;

      editingTaskId =
        null;


      hideLockScreen();

      setDefaultCleanupDate();

      populateCleanupTimeOptions();

      updateCleanupStatus();

      updatePinUI();

      resetForm();

      renderTasks();

    }
  );


  // ==========================================
  // ESC
  // ==========================================

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key !==
        "Escape"
      ) {

        return;

      }


      if (
        clearModal.classList.contains(
          "open"
        )
      ) {

        closeClearModal();

      }


      if (
        pinModal.classList.contains(
          "open"
        )
      ) {

        closePinModal();

      }

    }
  );


  // ==========================================
  // START
  // ==========================================

  await loadTasks();


  loadCleanupSchedule();


  setDefaultCleanupDate();


  populateTaskTimeOptions();

  populateCleanupTimeOptions();


  // Auto-wipe sprawdzamy również wtedy,
  // gdy aplikacja startuje z aktywnym PIN-em.

  await updateCleanupStatus();


  if (cleanupAt) {

    restoreCleanupFields();

  }


  updateClock();

  updatePinUI();

  renderTasks();


  // Jeżeli PIN był wcześniej aktywny,
  // po F5 aplikacja startuje zablokowana.

  if (pinEnabled) {

    showLockScreen();

  }


  // ==========================================
  // INTERWAŁY
  // ==========================================

  setInterval(
    updateClock,
    1000
  );


  setInterval(
    function () {

      updateCleanupStatus();

    },
    1000
  );


  setInterval(
    function () {

      if (!isLocked) {

        renderTasks();

      }

    },
    30000
  );


  setInterval(
    function () {

      if (
        !isLocked &&
        editingTaskId === null
      ) {

        populateTaskTimeOptions(
          taskTime.value
        );

      }

    },
    60000
  );


  setInterval(
    function () {

      if (
        !isLocked &&
        !cleanupAt
      ) {

        populateCleanupTimeOptions(
          cleanupTime.value
        );

      }

    },
    60000
  );

});

