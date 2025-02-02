class ChatManager {
  constructor() {
    this.chatMessages = document.querySelector(".chat-messages");
    this.chatInput = document.querySelector(".chat-input");
    this.sendButton = document.querySelector(".chat-send");
    this.setupEventListeners();
    this.showWelcomeMessage();
  }

  setupEventListeners() {
    // Handle send button click
    this.sendButton.addEventListener("click", () => this.handleSendMessage());

    // Handle enter key press
    this.chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });
  }

  showWelcomeMessage() {
    const welcomeMessage =
      "Hi! I'm Sting, your Concordia University virtual tour guide. Feel free to ask me anything about the university - I'm here to help you learn about our campus, facilities, history, and more!";
    this.addMessage(welcomeMessage, false);
  }

  async handleSendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessage(message, true);

    // Clear input
    this.chatInput.value = "";
    this.chatInput.style.height = "auto";

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Get response from Hugging Face API
      const response = await this.getStingResponse(message);

      // Remove typing indicator and add response
      this.hideTypingIndicator();
      this.addMessage(response, false);
    } catch (error) {
      console.error("Error getting response:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        false
      );
    }
  }

  addMessage(text, isUser) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${
      isUser ? "user-message" : "sting-message"
    }`;

    if (!isUser) {
      const nameSpan = document.createElement("div");
      nameSpan.className = "message-name";
      nameSpan.textContent = "Sting";
      messageDiv.appendChild(nameSpan);
    }

    const textDiv = document.createElement("div");
    textDiv.className = "message-text";
    textDiv.textContent = text;
    messageDiv.appendChild(textDiv);

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.textContent = "Sting is typing...";
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator =
      this.chatMessages.querySelector(".typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  async getStingResponse(userMessage) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are Sting, Concordia University's (Montreal) virtual tour guide. You are friendly, knowledgeable, and enthusiastic about helping visitors learn about Concordia. You only discuss topics related to Concordia University and politely deflect unrelated questions. You use a warm, welcoming tone and speak in first person as Sting. Keep responses concise but informative.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    const data = await response.json();
    return data.response;
  }
}
