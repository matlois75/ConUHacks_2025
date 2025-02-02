class FactDisplay {
  constructor() {
    this.facts = [];
    this.recentFacts = new Set();
    this.overlay = document.getElementById("fact-overlay");
    this.factText = document.getElementById("fact-text");
    this.fetchFacts();
  }

  async fetchFacts() {
    try {
      const response = await fetch("js/concordia-info.json");
      const data = await response.json();
      if (data["hall-floor-1"]) {
        this.facts = data["hall-floor-1"];
      } else {
        console.error("No facts found in JSON.");
      }
      this.init(); // Initialize after facts are loaded
    } catch (err) {
      console.error("Error loading facts:", err);
    }
  }

  init() {
    // Show first fact after 5 seconds
    setTimeout(() => {
      this.showFact();
    }, 5000);

    setInterval(() => this.showFact(), 15000); // Show new fact every 15 seconds

    this.overlay.addEventListener("click", () => {
      // Find and click the Sting tab
      const stingTab = document.querySelector('.tab-button[data-tab="chat"]');
      if (stingTab) {
        stingTab.click();
      }
    });

    // Make the fact overlay appear clickable
    this.overlay.style.cursor = "pointer";
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
      // Remove active class from all buttons and contents when tab is not open
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content when tab is open
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
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      const tabId = `${button.dataset.tab}-tab`;
      document.getElementById(tabId).classList.add("active");

      // If switching to chat tab, adjust textarea height and focus input
      if (button.dataset.tab === "chat") {
        adjustHeight();
        const chatInput = document.querySelector(".chat-input");
        chatInput.focus();
      }
    });
  });

  textarea.addEventListener("input", adjustHeight);
  textarea.addEventListener("focus", adjustHeight);
});
