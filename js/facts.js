class FactDisplay {
  constructor() {
    this.facts = [
      "The Hall Building was inaugurated in 1966 as part of Sir George Williams University, before it merged with Loyola College to form Concordia University.",
      "The iconic brutalist architecture of the Hall Building represents a significant period in Montreal's architectural history.",
      "LB Clarke Theatre, located on the first floor, hosts numerous student performances and university events throughout the year.",
      "The Hall Building's first floor houses Le Gym, Concordia's main fitness center offering state-of-the-art equipment and facilities to students.",
      "The Welcome Center on the first floor serves as the primary information hub for visitors, prospective students, and campus tours.",
      "The Hall Building's first floor connects directly to the Guy-Concordia metro station through an underground tunnel.",
      "The massive windows on the first floor allow abundant natural light and offer views of the bustling downtown Montreal streetscape.",
      "The People's Potato, a vegan soup kitchen run by students, operates from the Hall Building and serves free lunches to the Concordia community.",
      "The first floor houses various student service offices, making it a central hub for administrative support and student resources.",
      "The Security Desk on the first floor operates 24/7, ensuring campus safety and providing assistance to students and visitors.",
    ];
    this.recentFacts = new Set();
    this.overlay = document.getElementById("fact-overlay");
    this.factText = document.getElementById("fact-text");
    this.init();
  }

  init() {
    // Show first fact after 5 seconds
    setTimeout(() => {
      this.showFact();
    }, 5000);

    setInterval(() => this.showFact(), 15000); // Show new fact every 15 seconds
  }

  selectFact() {
    let availableFacts = this.facts.filter(
      (fact) => !this.recentFacts.has(fact)
    );
    if (availableFacts.length === 0) {
      this.recentFacts.clear();
      availableFacts = this.facts;
    }

    const randomIndex = Math.floor(Math.random() * availableFacts.length);
    const selectedFact = availableFacts[randomIndex];
    this.recentFacts.add(selectedFact);

    return selectedFact;
  }

  showFact() {
    const fact = this.selectFact();
    this.factText.textContent = fact;
    this.overlay.classList.add("visible");

    // Hide after 10 seconds
    setTimeout(() => {
      this.overlay.classList.remove("visible");
    }, 10000);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const factDisplay = new FactDisplay();
});

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      const tabId = `${button.dataset.tab}-tab`;
      document.getElementById(tabId).classList.add("active");
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.querySelector(".chat-input");

  const adjustHeight = () => {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    // Set the height to match the content
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Handle tab switching
  const tabButtons = document.querySelectorAll(".tab-button");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      const tabId = `${button.dataset.tab}-tab`;
      document.getElementById(tabId).classList.add("active");

      // If switching to chat tab, adjust textarea height
      if (button.dataset.tab === "chat") {
        adjustHeight();
      }
    });
  });

  // Regular textarea event listeners
  textarea.addEventListener("input", adjustHeight);
  textarea.addEventListener("focus", adjustHeight);

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Trigger send action here
      textarea.value = ""; // Clear input
      adjustHeight(); // Adjust height after clearing
    }
  });
});
