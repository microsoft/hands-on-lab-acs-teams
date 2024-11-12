import {
  VideoStreamRenderer,
  LocalVideoStream,
  CallClient,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient } from "@azure/communication-chat";
import { getEndpointUrl, getToken } from "./utils/utils.js";
import { UI } from "./ui/ui.js";

/** @typedef {import("@azure/communication-calling").Call} Call */
/** @typedef {import("@azure/communication-chat").ChatThreadClient} ChatThreadClient */
/** @typedef {import("@azure/communication-calling").CallAgent} CallAgent */
/** @typedef {import("@azure/communication-calling").DeviceManager} DeviceManager */

/** @type {LocalVideoStream} */
let localVideoStream;

async function main() {
  const callClient = new CallClient();
  const creds = new AzureCommunicationTokenCredential(await getToken());

  const callAgent = await callClient.createCallAgent(creds, {
    displayName: "ACS user",
  });
  const chatClient = new ChatClient(await getEndpointUrl(), creds);

  const deviceManager = await callClient.getDeviceManager();
  await deviceManager.askDevicePermission({ video: true, audio: true });
  await registerEvents(callAgent, chatClient, deviceManager);
}

/**
 *
 * @param {CallAgent} callAgent
 * @param {ChatClient} chatClient
 * @param {DeviceManager} deviceManager
 */
async function registerEvents(callAgent, chatClient, deviceManager) {
  const gui = new UI();
  gui.dispatch("Idle");

  // Call
  gui.callButton.addEventListener("click", () =>
    startCall(callAgent, chatClient, gui)
  );
  gui.hangUpButton.addEventListener("click", async () => {
    await endCall(callAgent, chatClient);
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
}

main().catch(console.error);

/**
 *  Starts the call, creating the audio and chat session.
 * @param {CallAgent} callAgent
 * @param {ChatClient} chatClient
 * @param {UI} gui
 */
async function startCall(callAgent, chatClient, gui) {
  const meetingLink = gui.meetingLinkInput.value;
  const call = await callAgent.join({ meetingLink }, {});

  call.on("stateChanged", async () => {
    console.log(`Call state changed: ${call.state}`);
    gui.dispatch(call.state);

    let isFirstConnection = true;
    if (call.state === "Connected" && isFirstConnection) {
      isFirstConnection = false;

      await chatClient.startRealtimeNotifications();
      chatClient.on("chatMessageReceived", (e) => {
        const isOwnMessage = e.sender.communicationUserId === "";
        gui.renderMessage(e.message, isOwnMessage);
      });
    }
  });
}

/**
 * Stops the call, ending the audio and chat session.
 * @param {CallAgent} callAgent
 * @param {ChatClient} chatClient
 */
async function endCall(callAgent, chatClient) {
  await callAgent.calls?.[0]?.hangUp();
  chatClient.stopRealtimeNotifications();
}

/**
 * Sends a message to the chat thread the user is connected to.
 * @param {ChatThreadClient} chatThreadClient
 * @param {string} content
 */
async function sendMessage(chatThreadClient, content) {
  const opt = { senderDisplayName: "Jack" };
  await chatThreadClient.sendMessage({ content }, opt);
}

/**
 * Starts the video stream for the call.
 * @param {CallAgent} callAgent
 * @param {DeviceManager} deviceManager
 * @param {UI} gui
 */
async function startVideo(callAgent, deviceManager, gui) {
  const cameras = await deviceManager.getCameras();
  if (cameras.length <= 0) {
    throw new Error("No camera device found on the system");
  }

  // Local video loopback
  localVideoStream = new LocalVideoStream(cameras[0]);
  const renderer = new VideoStreamRenderer(localVideoStream);
  gui.displayLocalVideo(renderer);

  // Sending video stream to remote
  const call = callAgent.calls?.[0];
  if (!call) {
    throw new Error("No call found");
  }
  await call.startVideo(localVideoStream);
}

/**
 *  Stops the video stream for the call.
 * @param {CallAgent} callAgent
 * @param {UI} gui
 */
async function stopVideo(callAgent, gui) {
  // Local video
  await gui.hideLocalVideo();

  // Stop sending video stream to remote
  const call = callAgent.calls?.[0];
  await call.stopVideo(localVideoStream);
}