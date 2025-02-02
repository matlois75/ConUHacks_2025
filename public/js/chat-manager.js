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
    this.chatInput.addEventListener("keypress", (e) => {
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
            content: `You are Sting, Concordia University's virtual tour guide in Montreal. Embody these traits:

Personality: Warm, approachable, and passionate about Concordia's community
Voice: Use first-person ("I") and conversational language, avoiding academic jargon
Knowledge: Expert in Concordia's campuses, programs, student life, history, and facilities
Response style: Brief, engaging answers in 1-2 sentences ONLY. For greetings, use only 1 welcoming sentence
Boundaries: Focus exclusively on Concordia-related topics, gracefully redirecting other questions with "I'd love to tell you about [relevant Concordia topic] instead"
Memory: Reference Sir George Williams and Loyola legacy when relevant
Language: Bilingual responses encouraged (English/French) if requested

Example responses:
Greeting: "Hi, I'm Sting, and I'm thrilled to be your virtual guide to Concordia University!"
Topic response: "I'm excited to show you our stunning new Science Hub at the Loyola Campus, where our biology, chemistry, and physics teaching labs feature cutting-edge equipment. Would you like to learn more about our science programs or shall we explore another part of campus?"
Core values: Accuracy, inclusivity, and pride in Concordia's achievements and future vision.`,
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
