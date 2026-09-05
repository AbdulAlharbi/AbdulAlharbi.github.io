/** Pomodoro timer: a countdown with a circular progress ring and three session lengths. */

const SESSION_MINUTES = { work: 25, shortBreak: 5, longBreak: 15 } as const;

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const circle = document.querySelector<SVGCircleElement>('.progress-ring__circle');
if (!circle) throw new Error('Missing progress ring');
const circumference = 2 * Math.PI * circle.r.baseVal.value;
circle.style.strokeDasharray = String(circumference);
circle.style.strokeDashoffset = String(circumference);

const timeDisplay = byId('time-display');
const sessionButtons = {
  work: byId<HTMLButtonElement>('work-session'),
  shortBreak: byId<HTMLButtonElement>('short-break'),
  longBreak: byId<HTMLButtonElement>('long-break'),
};

let totalTime = SESSION_MINUTES.work * 60; // seconds
let remainingTime = totalTime;
let isRunning = false;
let timerInterval: number | undefined;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function setProgress(value: number, max: number): void {
  circle!.style.strokeDashoffset = String(circumference - (value / max) * circumference);
}

function updateDisplay(): void {
  timeDisplay.textContent = formatTime(remainingTime);
  setProgress(remainingTime, totalTime);
}

function startTimer(): void {
  if (isRunning) return;
  isRunning = true;
  timerInterval = window.setInterval(() => {
    if (remainingTime <= 0) {
      window.clearInterval(timerInterval);
      isRunning = false;
      alert('Time is up!');
      return;
    }
    remainingTime--;
    updateDisplay();
  }, 1000);
}

function pauseTimer(): void {
  isRunning = false;
  window.clearInterval(timerInterval);
}

function resetTimer(): void {
  pauseTimer();
  remainingTime = totalTime;
  updateDisplay();
}

function setSession(kind: keyof typeof SESSION_MINUTES): void {
  Object.values(sessionButtons).forEach((btn) => btn.classList.remove('active'));
  sessionButtons[kind].classList.add('active');
  pauseTimer();
  totalTime = SESSION_MINUTES[kind] * 60;
  remainingTime = totalTime;
  updateDisplay();
}

byId('start-btn').addEventListener('click', startTimer);
byId('pause-btn').addEventListener('click', pauseTimer);
byId('reset-btn').addEventListener('click', resetTimer);
sessionButtons.work.addEventListener('click', () => setSession('work'));
sessionButtons.shortBreak.addEventListener('click', () => setSession('shortBreak'));
sessionButtons.longBreak.addEventListener('click', () => setSession('longBreak'));

updateDisplay();
