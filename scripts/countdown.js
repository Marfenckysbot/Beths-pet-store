// EDIT: Days until target (relative)
export const launch = { countdownDays: 20 };

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("countdown-timer");
  if (!el) return;
  const ms = launch.countdownDays * 24 * 60 * 60 * 1000;
  const target = Date.now() + ms;

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    el.textContent = `${days} day${days !== 1 ? "s" : ""}`;
    if (diff <= 0) clearInterval(timer);
  };
  tick();
  const timer = setInterval(tick, 1000 * 60 * 60);
});

function startCountdown(targetDate) {
  const timer = document.getElementById('countdown-timer');
  const update = () => {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      timer.innerHTML = "🎉 Event is Live!";
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    timer.innerHTML = `${days}d ${hours}h ${mins}m ${secs}s`;
  };
  setInterval(update, 1000);
}
startCountdown(new Date("2025-09-15T10:00:00"));