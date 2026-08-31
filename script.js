document.addEventListener("DOMContentLoaded", function () {

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

    const clearModal =
  document.getElementById("clearModal");

const cancelClearButton =
  document.getElementById("cancelClearButton");

const confirmClearButton =
  document.getElementById("confirmClearButton");

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


  // ==========================================
  // LOCAL STORAGE
  // ==========================================

  const STORAGE_KEY =
    "focus5Tasks";

  const CLEANUP_KEY =
    "focus5CleanupAt";


  // ==========================================
  // STAN APLIKACJI
  // ==========================================

  let tasks = [];

  let editingTaskId = null;

  let cleanupAt = null;


  // ==========================================
  // TWORZENIE OPCJI GODZINY
  // ==========================================

  function createTimeOption(time, label = time) {

    const option =
      document.createElement("option");

    option.value =
      time;

    option.textContent =
      label;

    return option;

  }


  // ==========================================
  // GODZINY DLA NOWEGO ZADANIA
  // ==========================================

  function populateTaskTimeOptions(
    preservedTime = "",
    allowPastPreserved = false
  ) {

    if (!taskTime) {
      return;
    }


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
          hour * 60 + minute;


        // Nie pokazujemy godzin,
        // które już minęły.

        if (
          optionMinutes <
          currentMinutes
        ) {

          continue;

        }


        const hourText =
          String(hour).padStart(
            2,
            "0"
          );

        const minuteText =
          String(minute).padStart(
            2,
            "0"
          );


        const time =
          hourText +
          ":" +
          minuteText;


        taskTime.appendChild(
          createTimeOption(time)
        );

      }

    }


    // Podczas edycji stare zadanie
    // może mieć godzinę z przeszłości.

    if (preservedTime) {

      const exists =
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

      }


      const canSelect =
        Array.from(
          taskTime.options
        ).some(function (option) {

          return (
            option.value ===
            preservedTime
          );

        });


      if (canSelect) {

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

    if (!cleanupTime) {
      return;
    }


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
          hour * 60 + minute;


        // Jeśli wybrany jest DZISIAJ,
        // ukrywamy minione godziny.

        if (
          selectedDate === today &&
          optionMinutes <
          currentMinutes
        ) {

          continue;

        }


        const hourText =
          String(hour).padStart(
            2,
            "0"
          );

        const minuteText =
          String(minute).padStart(
            2,
            "0"
          );


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


      // Obsługa harmonogramów utworzonych
      // wcześniej np. o 18:43.

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

  function loadTasks() {

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
          parsedTasks.slice(0, 5);

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
  // ZAPISYWANIE ZADAŃ
  // ==========================================

  function saveTasks() {

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
          weekday: "short",
          day: "2-digit",
          month: "short"
        }
      );


    const timeFormatter =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }
      );


    currentDate.textContent =
      dateFormatter.format(now);

    currentTime.textContent =
      timeFormatter.format(now);

  }


  // ==========================================
  // AKTUALNA GODZINA HH:MM
  // ==========================================

  function getCurrentShortTime() {

    const now =
      new Date();


    return new Intl.DateTimeFormat(
      "pl-PL",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(now);

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


    const taskHour =
      Number(timeParts[0]);

    const taskMinute =
      Number(timeParts[1]);


    const taskDate =
      new Date();


    taskDate.setHours(
      taskHour,
      taskMinute,
      0,
      0
    );


    const difference =
      taskDate.getTime() -
      now.getTime();


    const differenceMinutes =
      Math.round(
        difference / 60000
      );


    // Więcej niż godzina do zadania

    if (
      differenceMinutes > 60
    ) {

      return null;

    }


    // Zadanie się zbliża

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


    // Aktualny moment

    if (
      differenceMinutes <= 0 &&
      differenceMinutes >= -1
    ) {

      return {

        text:
          "TERAZ",

        type:
          "now"

      };

    }


    // Zadanie zaległe

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
  // DATA DLA INPUT TYPE="DATE"
  // ==========================================

  function getDateInputValue(date) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    return (
      year +
      "-" +
      month +
      "-" +
      day
    );

  }


  // ==========================================
  // DOMYŚLNA DATA CLEANUP
  // ==========================================

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


    if (limitReached) {

      addTaskButton.textContent =
        "Limit 5 osiągnięty";

    } else {

      addTaskButton.textContent =
        "+ Dodaj zadanie";

    }

  }


  // ==========================================
  // RENDEROWANIE ZADAŃ
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


      // TYTUŁ

      titleElement.textContent =
        task.title;


      // GODZINA

      if (task.time) {

        timeElement.textContent =
          task.time;

      } else {

        timeElement.style.display =
          "none";

      }


      // STATUS CZASU

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


      // NOTATKA

      if (task.note) {

        noteElement.textContent =
          task.note;

      } else {

        noteElement.style.display =
          "none";

      }


      // STATUS WYKONANIA

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
    function (event) {

      event.preventDefault();


      const title =
        taskTitle.value.trim();

      const time =
        taskTime.value;

      const note =
        taskNote.value.trim();


      if (!title) {
        return;
      }


      // EDYCJA

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


        saveTasks();

        resetForm();

        renderTasks();

        return;

      }


      // LIMIT 5 — dodatkowe zabezpieczenie

      if (
        tasks.length >= 5
      ) {

        updateTaskLimitState();

        return;

      }


      // NOWE ZADANIE

      const newTask = {

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

      };


      tasks.push(
        newTask
      );


      saveTasks();

      renderTasks();

      resetForm();

    }
  );


  // ==========================================
  // OBSŁUGA PRZYCISKÓW ZADAŃ
  // ==========================================

  taskList.addEventListener(
    "click",
    function (event) {

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


      // WYKONAJ / COFNIJ

      if (
        clickedButton.classList.contains(
          "task-check"
        )
      ) {

        toggleTask(taskId);

        return;

      }


      // EDYTUJ

      if (
        clickedButton.classList.contains(
          "task-edit"
        )
      ) {

        startEditingTask(taskId);

        return;

      }


      // USUŃ

      if (
        clickedButton.classList.contains(
          "task-delete"
        )
      ) {

        deleteTask(taskId);

      }

    }
  );


  // ==========================================
  // WYKONANIE ZADANIA
  // ==========================================

  function toggleTask(taskId) {

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


    if (task.completed) {

      task.completedAt =
        getCurrentShortTime();

    } else {

      task.completedAt =
        null;

    }


    saveTasks();

    renderTasks();

  }


  // ==========================================
  // USUWANIE JEDNEGO ZADANIA
  // ==========================================

  function deleteTask(taskId) {

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


    saveTasks();

    renderTasks();

  }


  // ==========================================
  // CZYSZCZENIE CAŁEJ LISTY
  // ==========================================

 // ==========================================
// MODAL CZYSZCZENIA LISTY
// ==========================================

function openClearModal() {

  if (tasks.length === 0) {
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


// Otwórz

clearAllButton.addEventListener(
  "click",
  function () {

    openClearModal();

  }
);


// Anuluj

cancelClearButton.addEventListener(
  "click",
  function () {

    closeClearModal();

  }
);


// Potwierdź

confirmClearButton.addEventListener(
  "click",
  function () {

    clearAllTasks();

    closeClearModal();

  }
);


// Kliknięcie tła

clearModal.addEventListener(
  "click",
  function (event) {

    if (
      event.target === clearModal
    ) {

      closeClearModal();

    }

  }
);


// ESC

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      clearModal.classList.contains("open")
    ) {

      closeClearModal();

    }

  }
);


  function clearAllTasks() {

    tasks =
      [];


    editingTaskId =
      null;


    localStorage.removeItem(
      STORAGE_KEY
    );


    resetForm();

    renderTasks();

  }


  // ==========================================
  // EDYCJA ZADANIA
  // ==========================================

  function startEditingTask(taskId) {

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


    // Jeżeli zadanie jest już zaległe,
    // zachowujemy jego wcześniejszą godzinę.

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


  // ==========================================
  // ANULOWANIE EDYCJI
  // ==========================================

  cancelEditButton.addEventListener(
    "click",
    function () {

      resetForm();

    }
  );


  // ==========================================
  // RESET FORMULARZA
  // ==========================================

  function resetForm() {

    editingTaskId =
      null;


    taskForm.reset();


    // Po resecie aktualizujemy dostępne
    // godziny według bieżącego czasu.

    populateTaskTimeOptions();


    cancelEditButton.hidden =
      true;


    updateTaskLimitState();


    taskTitle.focus();

  }


  // ==========================================
  // AUTO CLEANUP — WCZYTYWANIE
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


  // ==========================================
  // PRZYWRACANIE PÓL AUTO CLEANUP
  // ==========================================

  function restoreCleanupFields() {

    if (!cleanupAt) {
      return;
    }


    const targetDate =
      new Date(cleanupAt);


    cleanupDate.value =
      getDateInputValue(
        targetDate
      );


    const hours =
      String(
        targetDate.getHours()
      ).padStart(2, "0");


    const minutes =
      String(
        targetDate.getMinutes()
      ).padStart(2, "0");


    const time =
      hours +
      ":" +
      minutes;


    populateCleanupTimeOptions(
      time,
      true
    );

  }


  // ==========================================
  // ZMIANA DATY AUTO CLEANUP
  // ==========================================

  cleanupDate.addEventListener(
    "change",
    function () {

      const previousTime =
        cleanupTime.value;


      populateCleanupTimeOptions(
        previousTime
      );

    }
  );


  // ==========================================
  // AUTO CLEANUP — USTAWIENIE
  // ==========================================

  setCleanupButton.addEventListener(
    "click",
    function () {

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

        alert(
          "Nie udało się odczytać wybranej daty."
        );

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


  // ==========================================
  // WYŁĄCZANIE AUTO CLEANUP
  // ==========================================

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


  // ==========================================
  // FORMATOWANIE ODLICZANIA
  // ==========================================

  function formatCountdown(
    milliseconds
  ) {

    const totalSeconds =
      Math.max(
        0,
        Math.floor(
          milliseconds / 1000
        )
      );


    const hours =
      Math.floor(
        totalSeconds / 3600
      );


    const minutes =
      Math.floor(
        (totalSeconds % 3600) / 60
      );


    const seconds =
      totalSeconds % 60;


    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );

  }


  // ==========================================
  // STATUS AUTO CLEANUP
  // ==========================================

  function updateCleanupStatus() {

    if (!cleanupAt) {

      cleanupStatus.textContent =
        "Automatyczne czyszczenie jest wyłączone.";


      cancelCleanupButton.hidden =
        true;

      return;

    }


    const now =
      Date.now();


    // Termin minął

    if (
      now >= cleanupAt
    ) {

      clearAllTasks();

      removeCleanupSchedule();


      cleanupStatus.textContent =
        "Lista została automatycznie wyczyszczona.";

      return;

    }


    const targetDate =
      new Date(cleanupAt);


    const formattedDate =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        }
      ).format(targetDate);


    const formattedTime =
      new Intl.DateTimeFormat(
        "pl-PL",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      ).format(targetDate);


    const remaining =
      cleanupAt -
      now;


    cleanupStatus.textContent =
      "Lista zostanie wyczyszczona " +
      formattedDate +
      " o " +
      formattedTime +
      " · pozostało " +
      formatCountdown(
        remaining
      );


    cancelCleanupButton.hidden =
      false;

  }


  // ==========================================
  // START APLIKACJI
  // ==========================================

  loadTasks();

  loadCleanupSchedule();

  setDefaultCleanupDate();


  // Lista godzin zadania:
  // tylko pozostała część dnia.

  populateTaskTimeOptions();


  // Lista godzin cleanup:
  // zależna od wybranego dnia.

  populateCleanupTimeOptions();


  // Jeśli istnieje aktywny harmonogram,
  // sprawdzamy najpierw, czy nie wygasł.

  updateCleanupStatus();


  if (cleanupAt) {

    restoreCleanupFields();

  }


  updateClock();

  renderTasks();


  // ==========================================
  // INTERWAŁY
  // ==========================================

  // Zegar

  setInterval(
    updateClock,
    1000
  );


  // Auto cleanup

  setInterval(
    updateCleanupStatus,
    1000
  );


  // Status "za X min / TERAZ / po terminie"

  setInterval(
    function () {

      renderTasks();

    },
    30000
  );


  // Aktualizujemy dostępne godziny
  // nowych zadań co minutę.

  setInterval(
    function () {

      if (
        editingTaskId === null
      ) {

        const currentValue =
          taskTime.value;


        populateTaskTimeOptions(
          currentValue
        );

      }

    },
    60000
  );


  // Aktualizujemy również godziny cleanup,
  // jeżeli nie ma aktywnego harmonogramu.

  setInterval(
    function () {

      if (!cleanupAt) {

        const currentValue =
          cleanupTime.value;


        populateCleanupTimeOptions(
          currentValue
        );

      }

    },
    60000
  );

});