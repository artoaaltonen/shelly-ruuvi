let settings = {
  relayId: 0,
  ruuviId: "", // ruuvi address (something like ae7734ffee01)
  minTemp: 20, // turn relay on when minTemp is reached
  maxTemp: 23, // turn relay off when maxTemp is reached
};

function getRelayStatus()
{
  Shelly.call("Switch.GetStatus", { id: settings.relayId }, handleRelayStatus);
}

function handleRelayStatus(result)
{
  if (!result.output) {
    checkMinTemp();
  } else {
    checkMaxTemp();
  }
}

function checkMinTemp()
{
  Shelly.call("HTTP.GET", { url: "https://hub.artoaaltonen.com/sensor/" + settings.ruuviId + "/temperature/is-lte/" + JSON.stringify(settings.minTemp), timeout: 15, ssl_ca: "*" }, handleMinTemp);
}

function handleMinTemp(response)
{
  if (response.code !== 200) {
    print("Keep relay OFF. Temperature >= " + JSON.stringify(settings.minTemp));
    return;
  }

  print("Turn relay ON.");
  Shelly.call("Switch.Set", { id: settings.relayId, on: true });
}

function checkMaxTemp()
{
  Shelly.call("HTTP.GET", { url: "https://hub.artoaaltonen.com/sensor/" + settings.ruuviId + "/temperature/is-gte/" + JSON.stringify(settings.maxTemp), timeout: 15, ssl_ca: "*" }, handleMaxTemp);
}

function handleMaxTemp(response)
{
  if (response.code !== 200) {
    print("Keep relay ON. Temperature <= " + JSON.stringify(settings.maxTemp));
    return;
  }

  print("Turn relay OFF.");
  Shelly.call("Switch.Set", { id: settings.relayId, on: false });
}

Timer.set(60000, true, getRelayStatus);

getRelayStatus();
