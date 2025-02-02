const canvas = document.getElementById("canvas");
window.gl = canvas.getContext("webgl2", { antialias: false });

if (!gl) {
  console.error("WebGL2 is not supported on this browser.");
  console.error("WebGL2 is not supported on this browser.");
}

class RoomManager {
                
  constructor() {
    this.rooms = {
      "library-second-floor": {
        name: "Webster Library Second Floor",
        modelUrl: "/assets/models/library-2nd.splat",
        description: "Quiet study area with a view of the city",
        features: [
          "Silent Rooms",
          "Computer workstations",
          "Printing Stations",
        ],picture: '/assets/library-2ndF-picture.jpg'
      },
      "library-lobby": {
        name: "Webster Library Lobby",
        modelUrl: "/assets/models/library-lobby.splat",
        description: "A spacious study area with extensive resources",
        features: [
          "Silent study zones",
          "Group study rooms",
          "Digital resources",
        ],
        picture: '/assets/hall-building-picture.jpg'
        
      },
      "lecture-hall": {
        name: "Hall Building Entrance",
        modelUrl: "/assets/models/hall2.splat",
        description: "Modern building with multimedia capabilities",
        features: ["12 floors", "Advanced AV system", "Wheelchair accessible"],
        picture: '/assets/library-picture.jpg'
      },
    };
    this.initializeEventListeners();
    this.currentRoom = null;
    this.updateRoomList(); // Ensure the room list is populated before adding event listeners
  }
                
                

  initializeEventListeners() {
    document.querySelectorAll(".room-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const roomId = e.currentTarget.dataset.room;
        this.selectRoom(roomId);
      });
    });
  }
  initializeEventListeners() {
    document.querySelectorAll(".room-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        const roomId = e.currentTarget.dataset.room;
        this.selectRoom(roomId);
      });
    });
  }

  updateRoomList() {
    const roomList = document.querySelector(".room-selector");
    if (!roomList) {
      console.error("Room selector element not found.");
      return;
    }

    roomList.innerHTML = ""; // Clear existing content

    Object.entries(this.rooms).forEach(([roomId, roomData]) => {
      const roomCard = document.createElement("div");
      roomCard.className = "room-card";
      roomCard.dataset.room = roomId;

      roomCard.innerHTML = `
        <h3>${roomData.name}</h3>
        <p>${roomData.description}</p>
        <img src="${roomData.picture}" alt="${roomData.name}" />
      `;

      roomList.appendChild(roomCard);
    });

    // Attach event listeners to dynamically created elements
    this.initializeEventListeners();
  }

  async selectRoom(roomId) {
    if (!this.rooms[roomId]) {
      console.error(`Room ${roomId} not found`);
      return;
    }

    // Remove previous selection
    document.querySelectorAll(".room-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.room === roomId);
    });

    try {
      // Update UI
      this.updateRoomInfo(roomId);

      // Load the 3D model using the function from viewer.js
      await this.loadRoomModel(roomId);

      // Update URL
      window.history.pushState({ roomId }, "", `#${roomId}`);

      this.currentRoom = roomId;
      // Dispatch room change event
      document.dispatchEvent(
        new CustomEvent("roomChanged", {
          detail: { roomId },
        })
      );
    } catch (error) {
      console.error("Error loading room:", error);
      document.getElementById("message").textContent =
        "Error loading room model";
    }
  }

  updateRoomInfo(roomId) {
    const room = this.rooms[roomId];
    const infoPanel = document.querySelector(".viewer-controls");
    if (!infoPanel) return;

    infoPanel.innerHTML = `
            <h3>${room.name}</h3>
            <p>${room.description}</p>
            <div class="features">
                <h4>Features:</h4>
                <ul>
                    ${room.features
                      .map((feature) => `<li>${feature}</li>`)
                      .join("")}
                </ul>
            </div>
            <div class="controls-text">
                <h4>Navigation Controls:</h4>
                Mouse: Click and drag to look around<br>
                Keyboard: Arrow keys to move, WASD to look around<br>
                Touch: Pinch to zoom, drag to look around
            </div>
        `;
  }

  async loadRoomModel(roomId) {
    const modelUrl = this.rooms[roomId].modelUrl;
    const spinner = document.getElementById("spinner");

    if (!spinner) return;

    spinner.style.display = "flex"; // Show loading indicator

    try {
      if (typeof window.loadNewModel === "function") {
        +(await window.loadNewModel(modelUrl));
      } else {
        throw new Error("loadNewModel function is not defined.");
      }
    } catch (error) {
      console.error("Failed to load model:", error);
    } finally {
      spinner.style.display = "none"; // Hide loading indicator

      const frame = (now) => {
        if (vertexCount === 0) {
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          document.getElementById("spinner").style.display = "block";
        } else {
          document.getElementById("spinner").style.display = "none";
          gl.uniformMatrix4fv(u_view, false, actualViewMatrix);
          gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, 4, vertexCount);
        }
        requestAnimationFrame(frame);
      };
    }
  }

  handlePopState(event) {
    if (event.state?.roomId) {
      this.selectRoom(event.state.roomId);
    }
  }
}

// Prevent arrow keys from scrolling the page (fixed syntax)
window.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
    e.preventDefault();
  }
});

// Initialize RoomManager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const roomManager = new RoomManager();

  window.addEventListener("popstate", (e) => roomManager.handlePopState(e));

  // Load initial room if specified in URL
  const initialRoom = window.location.hash.slice(1);
  if (initialRoom && roomManager.rooms[initialRoom]) {
    roomManager.selectRoom(initialRoom);
  } else {
    const firstRoomId = Object.keys(roomManager.rooms)[0];
    roomManager.selectRoom(firstRoomId);
  }
});

// Toggle fullscreen mode properly
function toggleFullscreen() {
  let viewer = document.getElementById("viewer-wrapper");

  if (!viewer) {
    console.error("Viewer wrapper not found.");
    return;
  }

  if (!document.fullscreenElement) {
    if (viewer.requestFullscreen) {
      viewer.requestFullscreen();
    } else if (viewer.mozRequestFullScreen) {
      viewer.mozRequestFullScreen();
    } else if (viewer.webkitRequestFullscreen) {
      viewer.webkitRequestFullscreen();
    } else if (viewer.msRequestFullscreen) {
      viewer.msRequestFullscreen();
    }
    viewer.classList.add("fullscreen-active");
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    viewer.classList.remove("fullscreen-active");
  }
}
