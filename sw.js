const APP_TITLE = "remind-me";

const timers = {};

function setImmediateInterval(fn, interval) {
  fn();
  return setInterval(fn, interval);
}

async function perMinute(state) {
  const clients = await self.clients.matchAll();

  const stillWaiting = state.remainingMinutes > 0;

  // post updates back to the main thread
  if (stillWaiting) {
    state.remainingMinutes -= 1;

    clients.forEach((client) => {
      client.postMessage({
        type: "update-reminder",
        id: state.id,
        remainingMinutes: state.remainingMinutes,
      });
    });

    return;
  }

  clearInterval(timers[state.interval]);
  delete timers[state.interval];

  self.registration.showNotification(APP_TITLE, {
    body: state.message,
    vibrate: [200, 100, 200],
    tag: state.id,
  });

  clients.forEach((client) => {
    client.postMessage({
      type: "reminder-complete",
      id: state.id,
    });
  });
}

function onSetReminder(event) {
  const { id, time, message } = event.data;

  let state = {
    remainingMinutes: time,
    message,
    id
  };

  const interval = setImmediateInterval(() => perMinute(state), 60_000);
  state.interval = interval;

  timers[id] = interval;
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "set-reminder") {
    onSetReminder(event);
  }
});
