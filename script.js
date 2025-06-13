// script.js - FINAL PRO UPGRADE ⭐

const greetingEl = document.getElementById('greeting');
const modeToggleBtn = document.getElementById('mode-toggle');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksContainer = document.getElementById('tasks');
const voiceBtn = document.getElementById('voice-btn');
const quoteEl = document.getElementById('quote');
const moodSelect = document.getElementById('mood');
const moodMsg = document.getElementById('mood-msg');
const audioDelete = document.getElementById('audio-delete');
const progressBarFill = document.querySelector('.progress-bar-fill');
const progressText = document.getElementById('progress-text');
const celebrationOverlay = document.getElementById('celebration-overlay');
const confettiCanvas = document.getElementById('confetti-canvas');
const loader = document.getElementById('loader');
const appContainer = document.getElementById('app-container');

let isDarkMode = false;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let streak = parseInt(localStorage.getItem('taskStreak')) || 0;
let lastDate = localStorage.getItem('lastTaskDate');

setTimeout(() => {
  loader.style.display = 'none';
  appContainer.style.display = 'block';
}, 2000);

function updateGreeting() {
  const hour = new Date().getHours();
  greetingEl.textContent = hour < 12
    ? 'Good Morning! ☀️'
    : hour < 18
    ? 'Good Afternoon! 🌤️'
    : 'Good Evening! 🌙';
}
updateGreeting();

modeToggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark-mode', isDarkMode);
  modeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙';
});

function fetchDailyQuote() {
  fetch("https://type.fit/api/quotes")
    .then(res => res.json())
    .then(data => {
      const random = data[Math.floor(Math.random() * data.length)];
      quoteEl.textContent = `"${random.text}" - ${random.author || 'Unknown'}`;
    })
    .catch(() => displayRandomQuote());
}

function displayRandomQuote() {
  const quotes = [
    "Believe you can and you're halfway there.",
    "Push yourself, because no one else is going to do it for you.",
    "Small steps every day lead to big results.",
    "Dream it. Plan it. Do it."
  ];
  const idx = Math.floor(Math.random() * quotes.length);
  quoteEl.textContent = `"${quotes[idx]}"`;
}

fetchDailyQuote();

moodSelect.addEventListener('change', () => {
  const mood = moodSelect.value;
  const messages = {
    happy: "That's awesome! Keep smiling 😊",
    sad: "It's okay to feel sad sometimes. Take care 💙",
    neutral: "Hope your day gets better 🌈",
    excited: "Energy is contagious! Enjoy your day ✨"
  };
  const moodQuotes = {
    happy: "Keep up the joyful spirit! Today is yours 🌈",
    sad: "You are stronger than you think 💖",
    neutral: "Let’s make this day a masterpiece 🎨",
    excited: "Chase your dreams with full energy 🚀"
  };
  moodMsg.textContent = messages[mood] || '';
  quoteEl.textContent = `"${moodQuotes[mood]}"`;
});

function renderTasks() {
  tasksContainer.innerHTML = '';
  if (tasks.length === 0) {
    tasksContainer.innerHTML = '<p style="text-align:center;">No tasks yet! Add something 🙂</p>';
    updateProgress();
    return;
  }

  tasks.forEach(({ id, text, category }) => {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${category.toLowerCase()}`;
    taskDiv.setAttribute('data-id', id);

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = `[${category}] ${text}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&times;';
    deleteBtn.onclick = () => deleteTask(id);

    taskDiv.appendChild(taskText);
    taskDiv.appendChild(deleteBtn);
    tasksContainer.appendChild(taskDiv);
  });

  updateProgress();
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateStreak() {
  const today = new Date().toDateString();
  if (lastDate && lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (new Date(lastDate).toDateString() === yesterday.toDateString()) {
      streak++;
    } else {
      streak = 1;
    }
  } else if (!lastDate) {
    streak = 1;
  }
  lastDate = today;
  localStorage.setItem('taskStreak', streak);
  localStorage.setItem('lastTaskDate', today);
}

function addTask() {
  const text = taskInput.value.trim();
  const category = categorySelect.value;

  if (!text || !category) {
    alert('Please enter a task and select a category.');
    return;
  }

  const newTask = {
    id: Date.now(),
    text,
    category
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  updateStreak();

  taskInput.value = '';
  categorySelect.selectedIndex = 0;
  tasksContainer.scrollTop = tasksContainer.scrollHeight;
  celebrationOverlay.style.display = "none";
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  audioDelete.play();
}

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    taskInput.placeholder = "Listening... 🎙️";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    taskInput.value = transcript;
    taskInput.placeholder = "Add a new task...";
    addTask();
  };

  recognition.onerror = (event) => {
    alert("Voice input error: " + event.error);
    taskInput.placeholder = "Add a new task...";
  };

  recognition.onend = () => {
    taskInput.placeholder = "Add a new task...";
  };

  voiceBtn.addEventListener('click', () => recognition.start());
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = 'Voice recognition not supported';
}

function updateProgress() {
  const total = tasks.length;
  const percent = total ? 100 : 0;
  progressBarFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}% Completed`;

  if (percent === 100 && total > 0) {
    celebrationOverlay.style.display = 'block';
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      emojis: ['🎉', '✨', '💖', '🌟']
    });
  } else {
    celebrationOverlay.style.display = 'none';
  }
}

addTaskBtn.addEventListener('click', addTask);
renderTasks();