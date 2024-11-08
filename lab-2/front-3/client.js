import { CallClient, VideoStreamRenderer, LocalVideoStream } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { ChatClient } from "@azure/communication-chat";
let call;
let callAgent;
let chatClient;
let chatThreadClient;
let deviceManager;
let token;
let localVideoStream;
let localVideoStreamRenderer;
let removeLocalVideoStream;
let createLocalVideoStream;
let displayLocalVideoStream;

const meetingLinkInput = document.getElementById("teams-link-input");
const callButton = document.getElementById("join-meeting-button");
const hangUpButton = document.getElementById("hang-up-button");
const callStateElement = document.getElementById("call-state");


const messagesContainer = document.getElementById("messages-container");
const chatBox = document.getElementById("chat-box");
const sendMessageButton = document.getElementById("send-message");
const messageBox = document.getElementById("message-box");

const startVideoButton = document.getElementById("start-video-button");
const stopVideoButton = document.getElementById("stop-video-button");
const localVideoContainer = document.getElementById('localVideoContainer');


var userId = "";
var messages = "";
var chatThreadId = "";
async function getToken() {
  const response = await fetch(`${process.env.BACKEND_URL}/token`);
  const data = await response.json();
  return data.token;
}

async function getEndpointUrl() {
  const response = await fetch(`${process.env.BACKEND_URL}/getEndpointUrl`);
  const data = await response.json();
  return data.endpoint;
}

async function init() {
  const callClient = new CallClient();
  token = await getToken();
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential, {
    displayName: "ACS user",
  });
  deviceManager = await callClient.getDeviceManager();
  await deviceManager.askDevicePermission({ video: true });
  await deviceManager.askDevicePermission({ audio: true });
  callButton.disabled = false;

  console.log("Azure Communication Chat client created!");
  const connectionStateCallback = (args) => {
    console.log(args); // it will return an object with oldState and newState, each of having a value of either of 'Connected' | 'Disconnected'
    // it will also return reason, either of 'invalidToken' | 'connectionIssue'
  };
  callAgent.on("connectionStateChanged", connectionStateCallback);
}

init().catch(console.error);

callButton.addEventListener("click", async () => {
  // join with meeting link
  try {
    const localVideoStream = await createLocalVideoStream();
    const videoOptions = localVideoStream ? { localVideoStreams: [localVideoStream] } : undefined;
    // call = await callAgent.join({ meetingLink: meetingLinkInput.value }, { videoOptions: videoOptions });
    console.log(meetingLinkInput.value);
    call = await callAgent.join({ meetingLink: meetingLinkInput.value }, { videoOptions: videoOptions });

    // // Subscribe to the call's properties and events.
    console.log("Joining call with meeting link: " + meetingLinkInput.value);

  } catch(error)  {
    console.error(error);
    throw new Error(
      "Could not join meeting - have you set your connection string?"
    );
  }
  // Chat thread ID is provided from the call info, after connection.
  call.on("stateChanged", async () => {
    callStateElement.innerText = call.state;

    if (call.state === "Connected" && !chatThreadClient) {
      console.log("CONNECTED!");
      const endpointUrl = await getEndpointUrl();
      chatClient = new ChatClient(
        endpointUrl,
        new AzureCommunicationTokenCredential(token)
      );
      chatThreadId = call.info?.threadId;
      console.log("Chat thread ID: " + chatThreadId);
      chatThreadClient = chatClient.getChatThreadClient(chatThreadId);

      chatBox.style.display = "block";
      messagesContainer.innerHTML = messages;

      // open notifications channel
      await chatClient.startRealtimeNotifications();

      // subscribe to new message notifications
      chatClient.on("chatMessageReceived", (e) => {
        console.log("Notification chatMessageReceived!");

        // check whether the notification is intended for the current thread
        if (chatThreadId != e.threadId) {
          return;
        }

        if (e.sender.communicationUserId != userId) {
          renderReceivedMessage(e.message);
        } else {
          renderSentMessage(e.message);
        }
      });
    }
  });

  call.on('isLocalVideoStartedChanged', () => {
    console.log(`isLocalVideoStarted changed: ${call.isLocalVideoStarted}`);
  });
  console.log(`isLocalVideoStarted: ${call.isLocalVideoStarted}`);
  call.localVideoStreams.forEach(async (lvs) => {
    localVideoStream = lvs;
    await displayLocalVideoStream();
  });
  call.on('localVideoStreamsUpdated', e => {
    e.added.forEach(async (lvs) => {
      localVideoStream = lvs;
      await displayLocalVideoStream();
    });
    e.removed.forEach(lvs => {
      removeLocalVideoStream();
    });
  });

  // toggle button and chat box states
  hangUpButton.disabled = false;
  callButton.disabled = true;

  console.log(call);
});

async function renderReceivedMessage(message) {
  messages += '<div class="container lighter">' + message + "</div>";
  messagesContainer.innerHTML = messages;
}

async function renderSentMessage(message) {
  messages += '<div class="container darker">' + message + "</div>";
  messagesContainer.innerHTML = messages;
}

hangUpButton.addEventListener("click", async () => {
  // end the current call
  await call.hangUp();
  // Stop notifications
  chatClient.stopRealtimeNotifications();

  // toggle button states
  hangUpButton.disabled = true;
  callButton.disabled = false;
  callStateElement.innerText = "-";

  // toggle chat states
  chatBox.style.display = "none";
  messages = "";
  // Remove local ref
  chatThreadClient = undefined;
});

sendMessageButton.addEventListener("click", async () => {
  let message = messageBox.value;

  let sendMessageRequest = { content: message };
  let sendMessageOptions = { senderDisplayName: "Jack" };
  let sendChatMessageResult = await chatThreadClient.sendMessage(
    sendMessageRequest,
    sendMessageOptions
  );
  let messageId = sendChatMessageResult.id;

  messageBox.value = "";
  console.log(`Message sent!, message id:${messageId}`);
});


/**
 * Start your local video stream.
 * This will send your local video stream to remote participants so they can view it.
 */
startVideoButton.onclick = async () => {
  try {
      const localVideoStream = await createLocalVideoStream();
      await call.startVideo(localVideoStream);
  } catch (error) {
      console.error(error);
  }
}

/**
* Stop your local video stream.
* This will stop your local video stream from being sent to remote participants.
*/
stopVideoButton.onclick = async () => {
  try {
      await call.stopVideo(localVideoStream);
  } catch (error) {
      console.error(error);
  }
}

/**
* To render a LocalVideoStream, you need to create a new instance of VideoStreamRenderer, and then
* create a new VideoStreamRendererView instance using the asynchronous createView() method.
* You may then attach view.target to any UI element. 
*/
createLocalVideoStream = async () => {
  const camera = (await deviceManager.getCameras())[0];
  if (camera) {
      return new LocalVideoStream(camera);
  } else {
      console.error(`No camera device found on the system`);
  }
}

/**
* Display your local video stream preview in your UI
*/
displayLocalVideoStream = async () => {
  try {
      localVideoStreamRenderer = new VideoStreamRenderer(localVideoStream);
      const view = await localVideoStreamRenderer.createView();
      localVideoContainer.hidden = false;
      localVideoContainer.appendChild(view.target);
  } catch (error) {
      console.error(error);
  } 
}

/**
* Remove your local video stream preview from your UI
*/
removeLocalVideoStream = async() => {
  try {
      localVideoStreamRenderer.dispose();
      localVideoContainer.hidden = true;
  } catch (error) {
      console.error(error);
  } 
}
