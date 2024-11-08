import { CallClient } from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";
import { CommunicationIdentityClient } from "@azure/communication-identity";
import { ChatClient } from "@azure/communication-chat";
let call;
let callAgent;
let chatClient;
let chatThreadClient;
let token;

const meetingLinkInput = document.getElementById("teams-link-input");
const callButton = document.getElementById("join-meeting-button");
const hangUpButton = document.getElementById("hang-up-button");
const callStateElement = document.getElementById("call-state");

const messagesContainer = document.getElementById("messages-container");
const chatBox = document.getElementById("chat-box");
const sendMessageButton = document.getElementById("send-message");
const messageBox = document.getElementById("message-box");

var userId = "";
var messages = "";
var chatThreadId = "";
async function getToken() {
  const response = await fetch(`${process.env.BACKEND_URL}/token`);
  const data = await response.json();
  return data.token;
}

async function init() {
  const callClient = new CallClient();
  token = await getToken();
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  callAgent = await callClient.createCallAgent(tokenCredential, {
    displayName: "ACS user",
  });
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
  /*try {
    call = joinCall(meetingLinkInput.value, callAgent);
  } catch {
    throw new Error(
      "Could not join meeting - have you set your connection string?"
    );
  }*/

  try {
    call = await callAgent.join({ meetingLink: meetingLinkInput.value }, {});
  } catch {
    throw new Error(
      "Could not join meeting - have you set your connection string?"
    );
  }
  // Chat thread ID is provided from the call info, after connection.
  call.on("stateChanged", async () => {
    callStateElement.innerText = call.state;

    if (call.state === "Connected" && !chatThreadClient) {
      console.log("CONNECTED!");
      //const endpointUrl = env["COMMUNICATION_SERVICES_ENDPOINT_URL"];
      const endpointUrl = "<URL>";
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
