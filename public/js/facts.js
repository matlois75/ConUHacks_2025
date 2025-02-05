class FactDisplay {
  constructor() {
    this.facts = [];
    this.currentRoom = "webster-floor-2";
    this.recentFacts = new Set();
    this.overlay = document.getElementById("fact-overlay");
    this.factText = document.getElementById("fact-text");
    this.infoCache = null;

    this.handleRoomChange = this.handleRoomChange.bind(this);
    this.handleHashChange = this.handleHashChange.bind(this);

    this.setupEventListeners();
    this.setupTabFunctionality(); // Added this back
    this.fetchFacts();
  }

  setupEventListeners() {
    document.addEventListener("roomChanged", (e) => {
      this.handleRoomChange(e.detail.roomId);
    });

    window.addEventListener("hashchange", this.handleHashChange);

    const initialHash = window.location.hash.slice(1);
    if (initialHash) {
      this.handleRoomChange(initialHash);
    }
  }

  // Added tab functionality back
  setupTabFunctionality() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
  
    // Remove any default active classes on page load
    tabButtons.forEach((button) => button.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.dataset.tab;
        const targetContent = document.getElementById(`${tabName}-tab`);
        const isActive = button.classList.contains("active");
  
        if (isActive) {
          // Toggle content visibility without removing the active class on the button
          targetContent.classList.toggle("active");
        } else {
          // Ensure one tab is always styled: remove active state from all buttons and content
          tabButtons.forEach((btn) => btn.classList.remove("active"));
          tabContents.forEach((content) => content.classList.remove("active"));
  
          // Activate clicked button and show its associated content
          button.classList.add("active");
          targetContent.classList.add("active");
        }
      });
    });
  }

  handleRoomChange(roomId) {
    this.changeRoom(this.mapRoomIdToInfoKey(roomId));
  }

  handleHashChange() {
    const roomId = window.location.hash.slice(1);
    if (roomId) {
      this.handleRoomChange(roomId);
    }
  }

  mapRoomIdToInfoKey(roomId) {
    const mapping = {
      library: "webster-floor-1",
      "library-second-floor": "webster-floor-2",
      "library-lobby": "webster-floor-1",
      "lecture-hall": "hall-floor-1",
    };
    return mapping[roomId] || this.currentRoom;
  }

  async fetchFacts() {
    try {
      const response = await fetch("/js/concordia-info.json");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      this.infoCache = await response.json();
      this.updateFactsForCurrentRoom();
      this.init();
    } catch (err) {
      console.error("Error loading facts:", err);
    }
  }

  updateFactsForCurrentRoom() {
    if (!this.infoCache) return;
    this.facts = this.infoCache[this.currentRoom] || [];
    this.recentFacts.clear();
  }

  changeRoom(newRoomId) {
    if (this.currentRoom === newRoomId) return;
    this.currentRoom = newRoomId;
    this.updateFactsForCurrentRoom();
    this.showFact(); // Force the next fact to be from the new room
  }

  init() {
    if (!this.overlay || !this.factText) return;

    setTimeout(() => this.showFact(), 5000);
    setInterval(() => this.showFact(), 15000);

    this.overlay.addEventListener("click", () => {
      const stingTab = document.querySelector('.tab-button[data-tab="chat"]');
      if (stingTab) stingTab.click();
    });

    this.overlay.style.cursor = "pointer";
  }

  selectFact() {
    if (this.facts.length === 0) return null;

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
    if (!fact) return;

    this.factText.textContent = fact;
    this.overlay.classList.add("visible");

    setTimeout(() => {
      this.overlay.classList.remove("visible");
    }, 10000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.factDisplay = new FactDisplay();
});
