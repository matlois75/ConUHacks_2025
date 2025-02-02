class RoomManager {
    constructor() {
        this.rooms = {
            'library': {
                name: 'Main Library',
                modelUrl: '../assets/models/ben-room-30k.splat',
                description: 'A spacious study area with extensive resources',
                features: ['Silent study zones', 'Group study rooms', 'Digital resources']
            },
            'lecture-hall': {
                name: 'Lecture Hall A',
                modelUrl: 'assets/models/concordia.splat',
                description: 'Modern lecture theater with multimedia capabilities',
                features: ['300 seat capacity', 'Advanced AV system', 'Wheelchair accessible']
            }
            // Add more rooms as needed
        };
        
        this.currentRoom = null;
        this.initializeEventListeners();
        this.updateRoomList();
    }

    initializeEventListeners() {
        // Handle room selection
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const roomId = e.currentTarget.dataset.room;
                this.selectRoom(roomId);
            });
        });
    }

    updateRoomList() {
        const roomList = document.querySelector('.room-selector');
        roomList.innerHTML = ''; // Clear existing content

        // Create room cards
        Object.entries(this.rooms).forEach(([roomId, roomData]) => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.dataset.room = roomId;
            
            roomCard.innerHTML = `
                <h3>${roomData.name}</h3>
                <p>${roomData.description}</p>
                <ul class="room-features">
                    ${roomData.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            `;

            roomList.appendChild(roomCard);
        });

        // Reattach event listeners after updating the list
        this.initializeEventListeners();
    }

    async selectRoom(roomId) {
        if (!this.rooms[roomId]) {
            console.error(`Room ${roomId} not found`);
            return;
        }

        // Update UI to show selected room
        document.querySelectorAll('.room-card').forEach(card => {
            card.classList.toggle('active', card.dataset.room === roomId);
        });

        try {
            // Update room info panel
            this.updateRoomInfo(roomId);
            
            // Load the 3D model
            await this.loadRoomModel(roomId);
            
            // Update URL without page reload
            window.history.pushState({ roomId }, '', `#${roomId}`);
            
            this.currentRoom = roomId;
        } catch (error) {
            console.error('Error loading room:', error);
            // Show error message to user
            document.getElementById('message').textContent = 'Error loading room model';
        }
    }

    updateRoomInfo(roomId) {
        const room = this.rooms[roomId];
        const infoPanel = document.querySelector('.viewer-controls');
        
        infoPanel.innerHTML = `
            <h3>${room.name}</h3>
            <p>${room.description}</p>
            <div class="features">
                <h4>Features:</h4>
                <ul>
                    ${room.features.map(feature => `<li>${feature}</li>`).join('')}
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
        
        // Show loading indicator
        document.getElementById('spinner').style.display = 'flex';
        
        try {
            // This function needs to be implemented in viewer.js
            // It should handle loading the new .splat file
            await window.loadNewModel(modelUrl);
        } finally {
            // Hide loading indicator
            document.getElementById('spinner').style.display = 'none';
        }
    }

    // Handle browser back/forward buttons
    handlePopState(event) {
        if (event.state?.roomId) {
            this.selectRoom(event.state.roomId);
        }
    }
}

// Prevent arrow keys from scrolling the page
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const roomManager = new RoomManager();
    
    // Handle browser navigation
    window.addEventListener('popstate', (e) => roomManager.handlePopState(e));
    
    // Load initial room if specified in URL
    const initialRoom = window.location.hash.slice(1);
    if (initialRoom && roomManager.rooms[initialRoom]) {
        roomManager.selectRoom(initialRoom);
    } else {
        // Load first room as default
        const firstRoomId = Object.keys(roomManager.rooms)[0];
        roomManager.selectRoom(firstRoomId);
    }
});