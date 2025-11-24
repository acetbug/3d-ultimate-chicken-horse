export class UIManager {
    private uiLayer: HTMLElement;

    constructor() {
        this.uiLayer = document.getElementById('ui-layer') as HTMLElement;
    }

    public showMessage(message: string) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ui-message';
        msgDiv.innerText = message;
        this.uiLayer.appendChild(msgDiv);
        setTimeout(() => {
            this.uiLayer.removeChild(msgDiv);
        }, 3000);
    }

    public showTitleScreen(
        onHost: (nickname: string) => void,
        onJoin: (nickname: string, hostId: string) => void
    ) {
        this.uiLayer.innerHTML = ''; // Clear existing UI

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.textAlign = 'center';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.padding = '40px';
        container.style.borderRadius = '10px';
        container.style.color = 'white';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.pointerEvents = 'auto'; // Enable interaction

        const title = document.createElement('h1');
        title.innerText = 'Ultimate Chicken Horse 3D';
        container.appendChild(title);

        const nicknameInput = document.createElement('input');
        nicknameInput.placeholder = 'Enter Nickname';
        nicknameInput.style.padding = '10px';
        nicknameInput.style.marginBottom = '20px';
        nicknameInput.style.display = 'block';
        nicknameInput.style.width = '100%';
        nicknameInput.value = 'Player' + Math.floor(Math.random() * 1000);
        container.appendChild(nicknameInput);

        // Host Section
        const hostBtn = document.createElement('button');
        hostBtn.innerText = 'Host Game';
        hostBtn.style.padding = '10px 20px';
        hostBtn.style.margin = '10px';
        hostBtn.style.cursor = 'pointer';
        hostBtn.onclick = () => onHost(nicknameInput.value);
        container.appendChild(hostBtn);

        container.appendChild(document.createElement('br'));

        // Join Section
        const joinInput = document.createElement('input');
        joinInput.placeholder = 'Enter Host ID';
        joinInput.style.padding = '10px';
        joinInput.style.margin = '10px';
        container.appendChild(joinInput);

        const joinBtn = document.createElement('button');
        joinBtn.innerText = 'Join Game';
        joinBtn.style.padding = '10px 20px';
        joinBtn.style.margin = '10px';
        joinBtn.style.cursor = 'pointer';
        joinBtn.onclick = () => onJoin(nicknameInput.value, joinInput.value);
        container.appendChild(joinBtn);

        this.uiLayer.appendChild(container);
    }

    public showLobbyScreen(
        myId: string,
        players: any[],
        isHost: boolean,
        onCharacterSelect: (charId: string) => void,
        onStart: () => void
    ) {
        this.uiLayer.innerHTML = '';

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.textAlign = 'center';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        container.style.padding = '40px';
        container.style.borderRadius = '10px';
        container.style.color = 'white';
        container.style.minWidth = '400px';
        container.style.pointerEvents = 'auto'; // Enable interaction

        const title = document.createElement('h2');
        title.innerText = 'Lobby';
        container.appendChild(title);

        if (isHost) {
            const idContainer = document.createElement('div');
            idContainer.style.display = 'flex';
            idContainer.style.alignItems = 'center';
            idContainer.style.justifyContent = 'center';
            idContainer.style.gap = '10px';
            idContainer.style.marginBottom = '20px';

            const idLabel = document.createElement('span');
            idLabel.innerText = 'Host ID: ';
            idContainer.appendChild(idLabel);

            const idInput = document.createElement('input');
            idInput.value = myId || 'Connecting...';
            idInput.readOnly = true;
            idInput.style.padding = '5px';
            idInput.style.width = '200px';
            idInput.style.textAlign = 'center';
            idContainer.appendChild(idInput);

            const copyBtn = document.createElement('button');
            copyBtn.innerText = 'Copy';
            copyBtn.style.padding = '5px 10px';
            copyBtn.style.cursor = 'pointer';
            copyBtn.onclick = () => {
                if (myId) {
                    navigator.clipboard.writeText(myId);
                    copyBtn.innerText = 'Copied!';
                    setTimeout(() => copyBtn.innerText = 'Copy', 2000);
                }
            };
            idContainer.appendChild(copyBtn);

            container.appendChild(idContainer);
        }

        // Player List
        const list = document.createElement('div');
        list.style.textAlign = 'left';
        list.style.margin = '20px 0';
        players.forEach(p => {
            const pDiv = document.createElement('div');
            pDiv.innerText = `${p.nickname} (${p.character}) ${p.isHost ? '[HOST]' : ''}`;
            pDiv.style.padding = '5px';
            pDiv.style.borderBottom = '1px solid #444';
            list.appendChild(pDiv);
        });
        container.appendChild(list);

        // Character Selection
        const charTitle = document.createElement('h3');
        charTitle.innerText = 'Select Character';
        container.appendChild(charTitle);

        const chars = ['chicken', 'penguin', 'robot']; // Example characters
        const charContainer = document.createElement('div');
        charContainer.style.display = 'flex';
        charContainer.style.justifyContent = 'center';
        charContainer.style.gap = '10px';
        
        chars.forEach(char => {
            const btn = document.createElement('button');
            btn.innerText = char.toUpperCase();
            btn.style.padding = '10px';
            btn.onclick = () => onCharacterSelect(char);
            charContainer.appendChild(btn);
        });
        container.appendChild(charContainer);

        // Start Button (Host Only)
        if (isHost) {
            const startBtn = document.createElement('button');
            startBtn.innerText = 'START GAME';
            startBtn.style.marginTop = '20px';
            startBtn.style.padding = '15px 30px';
            startBtn.style.fontSize = '18px';
            startBtn.style.backgroundColor = '#4CAF50';
            startBtn.style.color = 'white';
            startBtn.style.border = 'none';
            startBtn.style.cursor = 'pointer';
            startBtn.onclick = onStart;
            container.appendChild(startBtn);
        } else {
            const waitMsg = document.createElement('p');
            waitMsg.innerText = 'Waiting for host to start...';
            waitMsg.style.marginTop = '20px';
            waitMsg.style.fontStyle = 'italic';
            container.appendChild(waitMsg);
        }

        this.uiLayer.appendChild(container);
    }

    public updateScore(scores: { [id: string]: number }) {
        // Update score board
        console.log(scores);
    }

    public createItemPicker(onSelect: (itemId: string) => void) {
        const container = document.createElement('div');
        container.id = 'item-picker';
        container.style.position = 'absolute';
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.pointerEvents = 'auto';

        const items = [
            { id: 'box_wood', label: 'Wood Box' },
            { id: 'spikes', label: 'Spikes' }
        ];

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.innerText = item.label;
            btn.style.padding = '10px 20px';
            btn.style.fontSize = '16px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                onSelect(item.id);
                container.style.display = 'none';
            };
            container.appendChild(btn);
        });

        this.uiLayer.appendChild(container);
    }

    public showItemPicker(show: boolean) {
        const picker = document.getElementById('item-picker');
        if (picker) {
            picker.style.display = show ? 'flex' : 'none';
        }
    }

    public clearUI() {
        this.uiLayer.innerHTML = '';
    }

    public showScoreScreen(scores: { nickname: string, current: number, added: number }[], goalScore: number, onComplete: () => void) {
        this.uiLayer.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.backgroundColor = '#f0e6d2'; // Paper-like background
        container.style.padding = '40px';
        container.style.borderRadius = '5px';
        container.style.color = '#333';
        container.style.width = '80%';
        container.style.maxWidth = '800px';
        container.style.fontFamily = '"Comic Sans MS", "Chalkboard SE", sans-serif'; // Hand-drawn feel
        container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        container.style.border = '2px solid #333';
        
        const title = document.createElement('h2');
        title.innerText = 'Round Results';
        title.style.textAlign = 'center';
        title.style.marginBottom = '30px';
        container.appendChild(title);
        
        const chartContainer = document.createElement('div');
        chartContainer.style.position = 'relative';
        chartContainer.style.marginTop = '20px';
        chartContainer.style.paddingRight = '50px'; // Space for goal
        container.appendChild(chartContainer);

        // Goal Line
        // const goalScore = 50; // Passed as argument now
        const goalLine = document.createElement('div');
        goalLine.style.position = 'absolute';
        goalLine.style.left = '100%'; // Assuming 100% width is goal? No, let's scale.
        // Let's say width 100% = goalScore * 1.2 (buffer)
        const maxScale = goalScore * 1.2;
        const goalPercent = (goalScore / maxScale) * 100;
        
        goalLine.style.left = `${goalPercent}%`;
        goalLine.style.top = '0';
        goalLine.style.bottom = '0';
        goalLine.style.width = '2px';
        goalLine.style.backgroundColor = 'red';
        goalLine.style.zIndex = '10';
        
        const goalLabel = document.createElement('div');
        goalLabel.innerText = 'GOAL';
        goalLabel.style.position = 'absolute';
        goalLabel.style.top = '-25px';
        goalLabel.style.left = '50%';
        goalLabel.style.transform = 'translateX(-50%)';
        goalLabel.style.color = 'red';
        goalLabel.style.fontWeight = 'bold';
        goalLine.appendChild(goalLabel);
        
        chartContainer.appendChild(goalLine);
        
        // Animate rows
        scores.forEach((s, i) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '15px';
            row.style.height = '40px';
            
            // Name
            const name = document.createElement('div');
            name.innerText = s.nickname;
            name.style.width = '100px';
            name.style.fontWeight = 'bold';
            name.style.textAlign = 'right';
            name.style.paddingRight = '10px';
            row.appendChild(name);
            
            // Bar Track
            const barTrack = document.createElement('div');
            barTrack.style.flexGrow = '1';
            barTrack.style.height = '100%';
            barTrack.style.position = 'relative';
            barTrack.style.backgroundColor = 'rgba(0,0,0,0.05)';
            barTrack.style.borderLeft = '2px solid #333';
            row.appendChild(barTrack);
            
            // Base Score Bar (Hatched pattern)
            const baseBar = document.createElement('div');
            const basePercent = ((s.current - s.added) / maxScale) * 100;
            baseBar.style.width = `${basePercent}%`;
            baseBar.style.height = '100%';
            baseBar.style.position = 'absolute';
            baseBar.style.left = '0';
            baseBar.style.backgroundColor = '#444';
            baseBar.style.backgroundImage = 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.2) 5px, rgba(255,255,255,0.2) 10px)';
            baseBar.style.border = '2px solid #333';
            baseBar.style.boxSizing = 'border-box';
            barTrack.appendChild(baseBar);
            
            // Added Score Bar (Solid color)
            const addedBar = document.createElement('div');
            const addedPercent = (s.added / maxScale) * 100;
            addedBar.style.width = '0%'; // Start at 0 for animation
            addedBar.style.height = '100%';
            addedBar.style.position = 'absolute';
            addedBar.style.left = `${basePercent}%`;
            addedBar.style.backgroundColor = '#ffcc00'; // Yellow/Orange
            addedBar.style.border = '2px solid #333';
            addedBar.style.borderLeft = 'none';
            addedBar.style.boxSizing = 'border-box';
            addedBar.style.transition = 'width 1s ease-out';
            barTrack.appendChild(addedBar);
            
            chartContainer.appendChild(row);
            
            // Animation Sequence
            setTimeout(() => {
                addedBar.style.width = `${addedPercent}%`;
            }, i * 1000 + 500);
        });
        
        this.uiLayer.appendChild(container);
        
        // Complete after all animations
        setTimeout(() => {
            onComplete();
        }, scores.length * 1000 + 3000);
    }

    public showWinScreen(winnerName: string, onBackToLobby: () => void) {
        this.uiLayer.innerHTML = '';
        
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        container.style.padding = '60px';
        container.style.borderRadius = '15px';
        container.style.color = 'white';
        container.style.textAlign = 'center';
        container.style.border = '4px solid gold';
        container.style.pointerEvents = 'auto'; // Enable interaction
        
        const title = document.createElement('h1');
        title.innerText = 'WINNER!';
        title.style.fontSize = '48px';
        title.style.color = 'gold';
        title.style.marginBottom = '20px';
        container.appendChild(title);
        
        const name = document.createElement('h2');
        name.innerText = winnerName;
        name.style.fontSize = '36px';
        name.style.marginBottom = '40px';
        container.appendChild(name);
        
        const btn = document.createElement('button');
        btn.innerText = 'BACK TO LOBBY';
        btn.style.padding = '15px 30px';
        btn.style.fontSize = '20px';
        btn.style.cursor = 'pointer';
        btn.style.backgroundColor = '#4CAF50';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.onclick = onBackToLobby;
        container.appendChild(btn);
        
        this.uiLayer.appendChild(container);
    }
}
