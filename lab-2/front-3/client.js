import {
  VideoStreamRenderer,
  LocalVideoStream,
  CallClient,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { ChatClient } from "@azure/communication-chat";
import { getEndpointUrl, getToken } from "./utils/utils.js";
import { UI } from "./ui/ui.js";

let call;
let chatThreadClient;
let localVideoStream;

/** @type {UI} */
let gui;

async function main() {
  const callClient = new CallClient();
  const creds = new AzureCommunicationTokenCredential(await getToken());

  const callAgent = await callClient.createCallAgent(creds, {
    displayName: "ACS user",
  });

  const deviceManager = await callClient.getDeviceManager();
  await deviceManager.askDevicePermission({ video: true });
  await deviceManager.askDevicePermission({ audio: true });

  const chatClient = new ChatClient(await getEndpointUrl(), creds);
  console.log("Azure Communication Chat client created!");
  await registerEvents(callAgent, chatClient, deviceManager);
}

async function registerEvents(callAgent, chatClient, deviceManager) {
  gui = new UI();
  gui.dispatch("Idle");

  // Call
  gui.callButton.addEventListener("click", () =>
    startCall(callAgent, chatClient)
  );
  gui.hangUpButton.addEventListener("click", () => endCall(chatClient));

  // Chat
  gui.sendMessageButton.addEventListener("click", () => {
    sendMessage(gui.messageBox.value);
  });

  // Video
  gui.startVideoButton.addEventListener("click", () =>
    startVideo(deviceManager)
  );
  gui.stopVideoButton.addEventListener("click", stopVideo);
}

main().catch(console.error);

async function startCall(callAgent, chatClient) {
  const meetingLink = gui.meetingLinkInput.value;
  call = await callAgent.join({ meetingLink }, {});

  call.on("stateChanged", async () => {
    console.log(`Call state changed: ${call.state}`);
    gui.dispatch(call.state);

    const isFirstConnection = call.state === "Connected" && !chatThreadClient;
    if (isFirstConnection) {
      chatThreadClient = chatClient.getChatThreadClient(call.info?.threadId);
      await chatClient.startRealtimeNotifications();

      chatClient.on("chatMessageReceived", (e) => {
        const isOwnMessage = e.sender.communicationUserId === "";
        gui.renderMessage(e.message, isOwnMessage);
      });
    }
  });
}

async function endCall(chatClient) {
  await call.hangUp();
  chatClient.stopRealtimeNotifications();
  gui.dispatch("Idle");
}

async function sendMessage(message) {
  const request = { content: message };
  const opt = { senderDisplayName: "Jack" };
  let res = await chatThreadClient.sendMessage(request, opt);
  messageBox.value = "";
  console.log(`Message sent!, message id:${res.id}`);
}

async function startVideo(deviceManager) {
  const cameras = await deviceManager.getCameras();
  if (cameras.length <= 0) {
    throw new Error("No camera device found on the system");
  }
  localVideoStream = new LocalVideoStream(cameras[0]);
  const renderer = new VideoStreamRenderer(localVideoStream);
  gui.displayLocalVideo(renderer);
  await call.startVideo(localVideoStream);
}

async function stopVideo() {
  await call.stopVideo(localVideoStream);
  await gui.hideLocalVideo();
}
