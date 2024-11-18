import "../utils/types.js";

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

    // Phone UI elements
    this.startPhoneButton = document.getElementById("call-phone-button");
    this.stopPhoneButton = document.getElementById("hang-up-phone-button");
    this.phoneInput = document.getElementById("callee-phone-input");

    // Login UI elements
    this.loginButton = document.getElementById("login-button");
    this.emailInput = document.getElementById("email");
    this.loginContainer = document.querySelector(".login-container");
    this.acsIdElement = document.getElementById("acs-id");
    this.userFlavorText = document.getElementById("display-name");
  }

  async dispatch(state) {
    this.callStateElement.innerText = state;
    console.log("Dispatching state: ", state);
    switch (state) {
      case "Disconnected":
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

        // Phone
        this.startPhoneButton.disabled = false;
        this.stopPhoneButton.disabled = true;
        break;
      case "Connected":
        // Call
        this.callButton.disabled = true;
        this.hangUpButton.disabled = false;

        // Chat
        if (this.meetingLinkInput.value != "") {
          this.chatBox.style.display = "block";
          this.messagesContainer.innerHTML = this.messages;

          // Video
          this.startVideoButton.disabled = false;
        } else {
          // Phone
          this.startPhoneButton.disabled = true;
          this.stopPhoneButton.disabled = false;
        }

        break;
    }
  }

  toggleLogin() {
    if (this.loginContainer.classList.contains("hidden")) {
      this.loginContainer.classList.remove("hidden");
    } else {
      this.loginContainer.classList.add("hidden");
    }
  }

  /**
   * Displays the user information
   * @param {User} user
   */
  displayUserInfo(user) {
    this.acsIdElement.innerText = user.acsId;
    if (user.email) {
      const sb = [user.email];
      const greet = user.created ? "(new user)" : "(existing user)";
      sb.push(greet);
      this.userFlavorText.innerText = sb.join(" ");
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
    this.localVideoContainer.appendChild(view.target);
  }

  async hideLocalVideo() {
    this.localVideoStreamRenderer.dispose();

    this.startVideoButton.disabled = false;
    this.stopVideoButton.disabled = true;
    this.localVideoContainer.innerHTML = "";
    this.localVideoContainer.hidden = true;
  }
}
