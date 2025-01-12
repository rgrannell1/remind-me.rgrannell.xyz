const APP_TITLE = "remind-me";

const timers = {};

async function perMinute(state) {
  const clients = await self.clients.matchAll();

  const stillWaiting = state.remainingMinutes > 0;

  if (stillWaiting) {
    state.remainingMinutes -= 1;

    clients.forEach((client) => {
      client.postMessage({
        type: "update-reminder",
        id,
        remainingMinutes: state.remainingMinutes,
      });
    });

    return;
  }

  clearInterval(interval);
  delete timers[id];

  self.registration.showNotification(APP_TITLE, {
    body: message,
    vibrate: [200, 100, 200],
    tag: id,
  });

  clients.forEach((client) => {
    client.postMessage({
      type: "reminder-complete",
      id,
    });
  });
}

function onSetReminder(event) {
  const { id, time, message } = event.data;

  let state = {
    remainingMinutes: time,
    message,
  };

  const interval = setInterval(perMinute.bind(state, null), 60_000);

  timers[id] = interval;
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "set-reminder") {
    onSetReminder(event);
  }
});
