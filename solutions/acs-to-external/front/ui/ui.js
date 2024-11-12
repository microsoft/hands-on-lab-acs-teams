export class UI {
  constructor() {
    // Call UI elements
    this.meetingLinkInput = document.getElementById("teams-link-input");
    this.callButton = document.getElementById("join-meeting-button");
    this.hangUpButton = document.getElementById("hang-up-button");
    this.callStateElement = document.getElementById("call-state");

    // Chat UI elements
    this.messagesContainer = document.getElementById("messages-container");
    this.chatBox = document.getElementById("chat-box");
    this.sendMessageButton = document.getElementById("send-message");
    this.messageBox = document.getElementById("message-box");
    this.messages = "";

    // Video UI elements
    this.startVideoButton = document.getElementById("start-video-button");
    this.stopVideoButton = document.getElementById("stop-video-button");
    this.localVideoContainer = document.getElementById("localVideoContainer");
  }

  async dispatch(state) {
    this.callStateElement.innerText = state;
    console.log("Dispatching state: ", state);
    switch (state) {
      case "Idle":
        // Call
        this.hangUpButton.disabled = true;
        this.callButton.disabled = false;
        this.callStateElement.innerText = "-";
        // Chat
        this.chatBox.style.display = "none";

        // Video
        this.startVideoButton.disabled = true;
        this.stopVideoButton.disabled = true;
        break;
      case "Connected":
        // Call
        this.callButton.disabled = true;
        this.hangUpButton.disabled = false;

        // Chat
        this.chatBox.style.display = "block";
        this.messagesContainer.innerHTML = this.messages;

        // Video
        this.startVideoButton.disabled = false;
        break;
    }
  }

  renderMessage(message, isSent) {
    const flavor = isSent ? "darker" : "lighter";
    this.messages += `<div class="container ${flavor}">` + message + "</div>";
    this.messagesContainer.innerHTML = this.messages;
  }

  async displayLocalVideo(localRenderer) {
    this.localVideoStreamRenderer = localRenderer;
    const view = await this.localVideoStreamRenderer.createView();

    this.startVideoButton.disabled = true;
    this.stopVideoButton.disabled = false;
    this.localVideoContainer.hidden = false;
    this.localVideoContainer.appendChild(view);
  }

  async hideLocalVideo() {
    this.localVideoStreamRenderer.dispose();

    this.startVideoButton.disabled = false;
    this.stopVideoButton.disabled = true;
    this.localVideoContainer.innerHTML = "";
    this.localVideoContainer.hidden = true;
  }
}
