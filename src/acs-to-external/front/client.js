import {
  VideoStreamRenderer,
  LocalVideoStream,
  CallClient,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient } from "@azure/communication-chat";
import {
  getEndpointUrl,
  getPhoneNumber,
  randomAuth,
  login,
} from "./utils/utils.js";
import { UI } from "./ui/ui.js";

/** @typedef {import("@azure/communication-calling").Call} Call */
/** @typedef {import("@azure/communication-chat").ChatThreadClient} ChatThreadClient */
/** @typedef {import("@azure/communication-calling").CallAgent} CallAgent */
/** @typedef {import("@azure/communication-calling").DeviceManager} DeviceManager */

/** @type {LocalVideoStream} */
let localVideoStream;

// Toggle this to true in lab 4
const USE_AUTH = false;

async function main() {
  const gui = new UI();
  const { token, acsId } = await handleLogin(gui, USE_AUTH);
  // Remove the login screen which is on by default
  gui.toggleLogin();
  gui.showAcsId(acsId);

  // TODO: Create a new instance of the CallClient, callAgent, and ChatClient

  const deviceManager = await callClient.getDeviceManager();
  await deviceManager.askDevicePermission({ video: true, audio: true });
  await registerEvents(gui, callAgent, chatClient, deviceManager);
}

/**
 * @param {UI} gui
 * @param {CallAgent} callAgent
 * @param {ChatClient} chatClient
 * @param {DeviceManager} deviceManager
 */
async function registerEvents(gui, callAgent, chatClient, deviceManager) {
  gui.dispatch("Idle");

  // Call
  gui.callButton.addEventListener("click", async () => {
    const meetingLink = gui.meetingLinkInput.value;
    await startCall(meetingLink, callAgent, chatClient, gui);
    const call = callAgent.calls?.[0];
    call.on("stateChanged", () => updateUi(gui, call));
  });
  gui.hangUpButton.addEventListener("click", async () => {
    await hangsUp(callAgent, chatClient);
    await gui.dispatch("Idle");
  });

  // Chat
  gui.sendMessageButton.addEventListener("click", () => {
    const threadId = callAgent.calls?.[0]?.info?.threadId;
    if (!threadId) {
      throw new Error("Attempted to send message without a call");
    }
    sendMessage(chatClient.getChatThreadClient(threadId), gui.messageBox.value);
  });

  // Video
  gui.startVideoButton.addEventListener("click", () =>
    startVideo(callAgent, deviceManager, gui)
  );
  gui.stopVideoButton.addEventListener("click", () =>
    stopVideo(callAgent, gui)
  );

  // Phone
  gui.startPhoneButton.addEventListener("click", async () => {
    const phoneNumber = gui.phoneInput.value;
    await startPhone(phoneNumber, callAgent, gui);
    const call = callAgent.calls?.[0];
    call.on("stateChanged", () => updateUi(gui, call));
  });

  gui.stopPhoneButton.addEventListener("click", async () => {
    await hangsUp(callAgent, chatClient);
    await gui.dispatch("Idle");
  });
}

async function updateUi(gui, call) {
  console.log(`Call state changed: ${call.state}`);
  gui.dispatch(call.state);
}

document.addEventListener("DOMContentLoaded", main);

/**
 *  Starts the call, creating the audio and chat session.
 * @param {string} meetingLink
 * @param {CallAgent} callAgent
 * @param {ChatClient} chatClient
 * @param {UI} gui
 */
async function startCall(meetingLink, callAgent, chatClient, gui) {
  // TODO
}

/**
 * Stops any call type, ending both the audio (teams/phone) call and chat session if it exists.
 * @param {CallAgent} callAgent
 * @param {ChatClient} chatClient
 */
async function hangsUp(callAgent, chatClient) {
  // TODO
}

/**
 * Sends a message to the chat thread the user is connected to.
 * @param {ChatThreadClient} chatThreadClient
 * @param {string} content
 */
async function sendMessage(chatThreadClient, content) {
  // TODO
}

/**
 * Starts the video stream for the call.
 * @param {CallAgent} callAgent
 * @param {DeviceManager} deviceManager
 * @param {UI} gui
 */
async function startVideo(callAgent, deviceManager, gui) {
  // TODO
}

/**
 *  Stops the video stream for the call.
 * @param {CallAgent} callAgent
 * @param {UI} gui
 */
async function stopVideo(callAgent, gui) {
  // TODO
}

/**
 * Starts a phone call to the given phone number.
 * @param {string} phoneNumber
 * @param {CallAgent} callAgent
 * @param {gui} gui
 */
async function startPhone(phoneNumber, callAgent, gui) {
  // TODO
}

/**
 * Handles the login process, either by using the email input or by getting a random identity from the backend.
 * @param {UI} gui
 * @param {boolean} useAuth
 * @returns
 */
async function handleLogin(gui, useAuth) {
  // If not using auth, get a random identity from the backend
  if (!useAuth) {
    const auth = await randomAuth();
    return { token: auth.token, acsId: auth.user.communicationUserId };
  }

  // Only for demo purpose, don't do that in production:
  // Else, blocks until the user 'logs in'
  return new Promise((res) =>
    gui.loginButton.addEventListener("click", (_) =>
      res(login(gui.emailInput.value))
    )
  );
}
