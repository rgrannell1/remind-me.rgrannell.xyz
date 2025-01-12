/*
 * Check if the browser supports service workers
 */
async function checkPermissions() {
  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Notification permissions are required to set a reminder.");
      return;
    }
  } else if (Notification.permission !== "granted") {
    alert("Notification permissions are required to set a reminder.");
    return;
  } else {
    console.log("Notification permissions already granted.");
  }
}

/* */
document.getElementById("reminder-form").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();
    await checkPermissions();

    const timeInput = document.getElementById("time").value;
    const message = document.getElementById("message").value;

    const minutes = parseInt(timeInput, 10);
    if (isNaN(minutes) || minutes <= 0) {
      alert("Please enter a valid time.");
      return;
    }

    if (!navigator.serviceWorker.controller) {
      alert("Service Worker not ready. Try again later.");
      return;
    }

    console.log("Sending message to service worker...", {
      type: "set-reminder",
      time: minutes,
      message: message,
    });
    navigator.serviceWorker.controller.postMessage({
      type: "set-reminder",
      id: `reminder-${Date.now()}`,
      time: minutes,
      message: message,
    });
  },
);

function onServiceWorkerMessage(event) {
  console.log("Message received from service worker: ", event.data);
  const { type, remainingMinutes } = event.data;

  if (type === "update-reminder") {
    document.title = `Time left: ${remainingMinutes}m`;
  }

  if (type === "reminder-complete") {
    document.title = "Reminder Complete!";
  }
}

/* */
navigator.serviceWorker.addEventListener("message", onServiceWorkerMessage);
