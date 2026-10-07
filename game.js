/* =========================================================
   NEON DASH
   Complete game.js for the supplied index.html
   Original neon rhythm platformer
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       DOM
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    const canvas = $("game-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (!canvas || !ctx) {
        console.error("Neon Dash: #game-canvas was not found.");
        return;
    }

    /* =====================================================
       GAME STATE
    ===================================================== */

    const GAME = {
        screen: "main-menu",
        state: "MENU",

        level: null,
        levelId: null,
        practice: false,

        animationFrame: 0,
        lastTime: 0,

        worldWidth: 0,
        cameraX: 0,

        speed: 320,
        baseSpeed: 320,

        gravity: 1800,

        player: {
            x: 120,
            y: 0,
            size: 34,
            velocityY: 0,
            grounded: false,
            rotation: 0,
            gravityDirection: 1,
            mode: "cube"
        },

        input: {
            jump: false,
            jumpPressed: false
        },

        attempts: 0,
        progress: 0,
        coinsCollected: 0,
        collectedCoins: new Set(),

        particles: [],

        shake: 0,

        settings: {
            progress: true,
            shake: true,
            practice: true,
            particles: true,
            glow: true,
            background: true,
            musicVolume: 70,
            soundVolume: 80
        },

        save: {
            coins: 0,
            diamonds: 0,
            stars: 0,
            completed: 0,
            created: 0,
            creatorPoints: 0,
            achievements: {},
            levels: {}
        },

        editor: {
            objects: [],
            history: [],
            future: [],
            selectedTool: "select"
        }
    };

    /* =====================================================
       LEVEL DATA
    ===================================================== */

    const LEVELS = [
        {
            id: 1,
            name: "Neon Start",
            difficulty: "easy",
            length: "SHORT",
            stars: 5,
            worldWidth: 9000,
            speed: 300,
            color: "#00eaff",

            objects: [
                { type: "ground", x: 0, y: 500, w: 9000, h: 120 },

                { type: "spike", x: 650, y: 466, w: 38, h: 34 },
                { type: "spike", x: 950, y: 466, w: 38, h: 34 },

                { type: "block", x: 1250, y: 400, w: 100, h: 100 },
                { type: "spike", x: 1430, y: 466, w: 38, h: 34 },

                { type: "coin", x: 1600, y: 360, id: "1a" },

                { type: "block", x: 1850, y: 350, w: 110, h: 150 },
                { type: "spike", x: 2050, y: 466, w: 38, h: 34 },
                { type: "spike", x: 2100, y: 466, w: 38, h: 34 },

                { type: "gravity", x: 2350, y: 250 },

                { type: "spike", x: 2650, y: 100, w: 38, h: 34, inverted: true },
                { type: "spike", x: 2850, y: 100, w: 38, h: 34, inverted: true },

                { type: "gravity", x: 3100, y: 250 },

                { type: "coin", x: 3350, y: 390, id: "1b" },

                { type: "block", x: 3600, y: 430, w: 100, h: 70 },
                { type: "spike", x: 3850, y: 466, w: 38, h: 34 },

                { type: "speed", x: 4200, y: 250, value: 1.25 },

                { type: "spike", x: 4550, y: 466, w: 38, h: 34 },
                { type: "spike", x: 4600, y: 466, w: 38, h: 34 },

                { type: "block", x: 4900, y: 390, w: 100, h: 110 },
                { type: "coin", x: 5050, y: 320, id: "1c" },

                { type: "spike", x: 5400, y: 466, w: 38, h: 34 },
                { type: "spike", x: 5650, y: 466, w: 38, h: 34 },

                { type: "block", x: 6000, y: 350, w: 100, h: 150 },

                { type: "spike", x: 6250, y: 466, w: 38, h: 34 },
                { type: "spike", x: 6300, y: 466, w: 38, h: 34 },

                { type: "speed", x: 6650, y: 250, value: 1.4 },

                { type: "coin", x: 7000, y: 360, id: "1d" },

                { type: "spike", x: 7350, y: 466, w: 38, h: 34 },
                { type: "spike", x: 7400, y: 466, w: 38, h: 34 },
                { type: "spike", x: 7450, y: 466, w: 38, h: 34 },

                { type: "finish", x: 8500, y: 350, w: 50, h: 150 }
            ]
        },

        {
            id: 2,
            name: "Neon Rush",
            difficulty: "normal",
            length: "MEDIUM",
            stars: 7,
            worldWidth: 12500,
            speed: 350,
            color: "#a855f7",

            objects: [
                { type: "ground", x: 0, y: 500, w: 12500, h: 120 },

                { type: "spike", x: 650, y: 466, w: 38, h: 34 },
                { type: "spike", x: 700, y: 466, w: 38, h: 34 },

                { type: "block", x: 1000, y: 400, w: 120, h: 100 },
                { type: "coin", x: 1180, y: 330, id: "2a" },

                { type: "spike", x: 1400, y: 466, w: 38, h: 34 },
                { type: "spike", x: 1450, y: 466, w: 38, h: 34 },

                { type: "speed", x: 1700, y: 250, value: 1.35 },

                { type: "block", x: 2050, y: 350, w: 100, h: 150 },
                { type: "block", x: 2300, y: 300, w: 100, h: 200 },

                { type: "spike", x: 2500, y: 466, w: 38, h: 34 },
                { type: "spike", x: 2550, y: 466, w: 38, h: 34 },

                { type: "gravity", x: 2800, y: 250 },

                { type: "spike", x: 3100, y: 100, w: 38, h: 34, inverted: true },
                { type: "spike", x: 3300, y: 100, w: 38, h: 34, inverted: true },

                { type: "coin", x: 3500, y: 170, id: "2b" },

                { type: "gravity", x: 3800, y: 250 },

                { type: "spike", x: 4050, y: 466, w: 38, h: 34 },
                { type: "spike", x: 4100, y: 466, w: 38, h: 34 },
                { type: "spike", x: 4150, y: 466, w: 38, h: 34 },

                { type: "block", x: 4550, y: 390, w: 100, h: 110 },

                { type: "coin", x: 4750, y: 330, id: "2c" },

                { type: "speed", x: 5000, y: 250, value: 1.5 },

                { type: "spike", x: 5350, y: 466, w: 38, h: 34 },
                { type: "spike", x: 5400, y: 466, w: 38, h: 34 },

                { type: "block", x: 5700, y: 350, w: 120, h: 150 },
                { type: "block", x: 5950, y: 300, w: 120, h: 200 },

                { type: "spike", x: 6200, y: 466, w: 38, h: 34 },

                { type: "gravity", x: 6500, y: 250 },

                { type: "spike", x: 6900, y: 100, w: 38, h: 34, inverted: true },

                { type: "gravity", x: 7200, y: 250 },

                { type: "spike", x: 7450, y: 466, w: 38, h: 34 },
                { type: "spike", x: 7500, y: 466, w: 38, h: 34 },

                { type: "coin", x: 7800, y: 370, id: "2d" },

                { type: "speed", x: 8100, y: 250, value: 1.7 },

                { type: "spike", x: 8500, y: 466, w: 38, h: 34 },
                { type: "spike", x: 8550, y: 466, w: 38, h: 34 },
                { type: "spike", x: 8600, y: 466, w: 38, h: 34 },

                { type: "block", x: 9000, y: 350, w: 120, h: 150 },

                { type: "coin", x: 9200, y: 300, id: "2e" },

                { type: "spike", x: 9600, y: 466, w: 38, h: 34 },
                { type: "spike", x: 9650, y: 466, w: 38, h: 34 },

                { type: "block", x: 10000, y: 380, w: 100, h: 120 },

                { type: "spike", x: 10400, y: 466, w: 38, h: 34 },
                { type: "spike", x: 10450, y: 466, w: 38, h: 34 },

                { type: "finish", x: 11800, y: 350, w: 50, h: 150 }
            ]
        },

        {
            id: 3,
            name: "Neon Circuit",
            difficulty: "hard",
            length: "LONG",
            stars: 10,
            worldWidth: 15500,
            speed: 390,
            color: "#ff3bd4",

            objects: [
                { type: "ground", x: 0, y: 500, w: 15500, h: 120 },

                { type: "spike", x: 600, y: 466, w: 38, h: 34 },
                { type: "spike", x: 650, y: 466, w: 38, h: 34 },

                { type: "block", x: 900, y: 350, w: 100, h: 150 },

                { type: "speed", x: 1150, y: 250, value: 1.4 },

                { type: "spike", x: 1500, y: 466, w: 38, h: 34 },
                { type: "spike", x: 1550, y: 466, w: 38, h: 34 },
                { type: "spike", x: 1600, y: 466, w: 38, h: 34 },

                { type: "coin", x: 1850, y: 350, id: "3a" },

                { type: "gravity", x: 2150, y: 250 },

                { type: "spike", x: 2500, y: 100, w: 38, h: 34, inverted: true },
                { type: "spike", x: 2700, y: 100, w: 38, h: 34, inverted: true },
                { type: "spike", x: 2900, y: 100, w: 38, h: 34, inverted: true },

                { type: "gravity", x: 3200, y: 250 },

                { type: "block", x: 3500, y: 350, w: 100, h: 150 },
                { type: "block", x: 3700, y: 300, w: 100, h: 200 },

                { type: "coin", x: 3900, y: 250, id: "3b" },

                { type: "spike", x: 4200, y: 466, w: 38, h: 34 },
                { type: "spike", x: 4250, y: 466, w: 38, h: 34 },

                { type: "speed", x: 4500, y: 250, value: 1.6 },

                { type: "spike", x: 4900, y: 466, w: 38, h: 34 },
                { type: "spike", x: 4950, y: 466, w: 38, h: 34 },
                { type: "spike", x: 5000, y: 466, w: 38, h: 34 },

                { type: "gravity", x: 5300, y: 250 },

                { type: "spike", x: 5600, y: 100, w: 38, h: 34, inverted: true },
                { type: "coin", x: 5800, y: 180, id: "3c" },

                { type: "gravity", x: 6100, y: 250 },

                { type: "block", x: 6400, y: 350, w: 120, h: 150 },

                { type: "spike", x: 6750, y: 466, w: 38, h: 34 },
                { type: "spike", x: 6800, y: 466, w: 38, h: 34 },

                { type: "speed", x: 7100, y: 250, value: 1.8 },

                { type: "block", x: 7500, y: 350, w: 100, h: 150 },
                { type: "block", x: 7750, y: 300, w: 100, h: 200 },

                { type: "spike", x: 8000, y: 466, w: 38, h: 34 },

                { type: "coin", x: 8250, y: 320, id: "3d" },

                { type: "spike", x: 8500, y: 466, w: 38, h: 34 },
                { type: "spike", x: 8550, y: 466, w: 38, h: 34 },
                { type: "spike", x: 8600, y: 466, w: 38, h: 34 },

                { type: "gravity", x: 8900, y: 250 },

                { type: "spike", x: 9200, y: 100, w: 38, h: 34, inverted: true },
                { type: "spike", x: 9450, y: 100, w: 38, h: 34, inverted: true },

                { type: "gravity", x: 9700, y: 250 },

                { type: "speed", x: 10000, y: 250, value: 2 },

                { type: "spike", x: 10400, y: 466, w: 38, h: 34 },
                { type: "spike", x: 10450, y: 466, w: 38, h: 34 },
                { type: "spike", x: 10500, y: 466, w: 38, h: 34 },

                { type: "block", x: 10900, y: 350, w: 120, h: 150 },

                { type: "coin", x: 11100, y: 300, id: "3e" },

                { type: "spike", x: 11400, y: 466, w: 38, h: 34 },
                { type: "spike", x: 11450, y: 466, w: 38, h: 34 },

                { type: "block", x: 11800, y: 320, w: 100, h: 180 },

                { type: "speed", x: 12100, y: 250, value: 2.1 },

                { type: "spike", x: 12500, y: 466, w: 38, h: 34 },
                { type: "spike", x: 12550, y: 466, w: 38, h: 34 },
                { type: "spike", x: 12600, y: 466, w: 38, h: 34 },

                { type: "coin", x: 12900, y: 360, id: "3f" },

                { type: "spike", x: 13300, y: 466, w: 38, h: 34 },
                { type: "spike", x: 13350, y: 466, w: 38, h: 34 },

                { type: "block", x: 13700, y: 350, w: 120, h: 150 },

                { type: "spike", x: 14100, y: 466, w: 38, h: 34 },
                { type: "spike", x: 14150, y: 466, w: 38, h: 34 },
                { type: "spike", x: 14200, y: 466, w: 38, h: 34 },

                { type: "finish", x: 14900, y: 350, w: 50, h: 150 }
            ]
        },

        {
            id: 4,
            name: "Neon Factory",
            difficulty: "harder",
            length: "LONG",
            stars: 12,
            worldWidth: 17500,
            speed: 410,
            color: "#ff8a00"
        },

        {
            id: 5,
            name: "Neon Storm",
            difficulty: "insane",
            length: "LONG",
            stars: 15,
            worldWidth: 19000,
            speed: 440,
            color: "#6d5dfc"
        },

        {
            id: 6,
            name: "Neon Apocalypse",
            difficulty: "extreme",
            length: "EXTREME",
            stars: 20,
            worldWidth: 22000,
            speed: 470,
            color: "#ff304f"
        }
    ];

    /* =====================================================
       GENERATE SIMPLE LEVELS 4-6
    ===================================================== */

    function generateHardLevel(level) {
        if (level.objects) return;

        level.objects = [
            {
                type: "ground",
                x: 0,
                y: 500,
                w: level.worldWidth,
                h: 120
            }
        ];

        const spacing = level.difficulty === "extreme" ? 220 : 280;

        for (let x = 600, index = 0; x < level.worldWidth - 700; x += spacing) {
            const pattern = index % 7;

            if (pattern === 0) {
                level.objects.push({
                    type: "spike",
                    x,
                    y: 466,
                    w: 38,
                    h: 34
                });
            }

            if (pattern === 1) {
                level.objects.push({
                    type: "spike",
                    x,
                    y: 466,
                    w: 38,
                    h: 34
                });

                level.objects.push({
                    type: "spike",
                    x: x + 50,
                    y: 466,
                    w: 38,
                    h: 34
                });
            }

            if (pattern === 2) {
                level.objects.push({
                    type: "block",
                    x,
                    y: 360,
                    w: 110,
                    h: 140
                });
            }

            if (pattern === 3) {
                level.objects.push({
                    type: "speed",
                    x,
                    y: 250,
                    value: 1.3
                });
            }

            if (pattern === 4) {
                level.objects.push({
                    type: "spike",
                    x,
                    y: 466,
                    w: 38,
                    h: 34
                });

                level.objects.push({
                    type: "coin",
                    x: x + 110,
                    y: 350,
                    id: `${level.id}-${index}`
                });
            }

            if (pattern === 5) {
                level.objects.push({
                    type: "block",
                    x,
                    y: 400,
                    w: 100,
                    h: 100
                });

                level.objects.push({
                    type: "spike",
                    x: x + 130,
                    y: 466,
                    w: 38,
                    h: 34
                });
            }

            if (pattern === 6) {
                level.objects.push({
                    type: "gravity",
                    x,
                    y: 250
                });
            }

            index++;
        }

        level.objects.push({
            type: "finish",
            x: level.worldWidth - 600,
            y: 350,
            w: 50,
            h: 150
        });
    }

    LEVELS.forEach(generateHardLevel);

    /* =====================================================
       SAVE SYSTEM
    ===================================================== */

    function loadSave() {
        try {
            const saved = localStorage.getItem("neonDashSave");

            if (saved) {
                const parsed = JSON.parse(saved);

                GAME.save = {
                    ...GAME.save,
                    ...parsed,
                    levels: parsed.levels || {},
                    achievements: parsed.achievements || {}
                };
            }
        } catch (error) {
            console.warn("Could not load save:", error);
        }

        updateAllStats();
    }

    function saveGame() {
        try {
            localStorage.setItem(
                "neonDashSave",
                JSON.stringify(GAME.save)
            );
        } catch (error) {
            console.warn("Could not save game:", error);
        }
    }

    /* =====================================================
       SCREEN SYSTEM
    ===================================================== */

    function allScreens() {
        return document.querySelectorAll(".screen");
    }

    function showScreen(id) {
        allScreens().forEach(screen => {
            screen.classList.remove("active");
        });

        const target = $(id);

        if (target) {
            target.classList.add("active");
            GAME.screen = id;
        }

        hideOverlays();

        if (id !== "game-screen") {
            stopGameLoop();
            GAME.state = "MENU";
        }

        updateTopBar(id);
    }

    function updateTopBar(screen) {
        const backButton = $("back-button");
        const title = $("top-title");

        if (!backButton || !title) return;

        if (screen === "main-menu") {
            backButton.style.visibility = "hidden";
            title.textContent = "NEON DASH";
        } else {
            backButton.style.visibility = "visible";

            const titles = {
                "level-select": "LEVEL SELECT",
                "level-details": "LEVEL DETAILS",
                "game-screen": "NEON DASH",
                "online": "ONLINE LEVELS",
                "profile": "PROFILE",
                "shop": "SHOP",
                "achievements": "ACHIEVEMENTS",
                "editor": "LEVEL EDITOR",
                "settings": "SETTINGS"
            };

            title.textContent = titles[screen] || "NEON DASH";
        }
    }

    function hideOverlays() {
        [
            "pause-overlay",
            "death-overlay",
            "complete-overlay"
        ].forEach(id => {
            const el = $(id);
            if (el) el.classList.add("hidden");
        });
    }

    function showOverlay(id) {
        const el = $(id);
        if (el) el.classList.remove("hidden");
    }

    /* =====================================================
       NOTIFICATION
    ===================================================== */

    let notificationTimer = null;

    function notify(message) {
        const box = $("notification");
        const text = $("notification-text");

        if (!box || !text) return;

        text.textContent = message;
        box.classList.add("show");

        clearTimeout(notificationTimer);

        notificationTimer = setTimeout(() => {
            box.classList.remove("show");
        }, 2200);
    }

    /* =====================================================
       LEVEL SELECT
    ===================================================== */

    function renderLevelList(filter = "all") {
        const container = $("level-list");
        if (!container) return;

        container.innerHTML = "";

        LEVELS.forEach(level => {
            if (filter !== "all" && level.difficulty !== filter) {
                return;
            }

            const data = GAME.save.levels[level.id] || {
                best: 0,
                attempts: 0,
                coins: []
            };

            const article = document.createElement("article");

            article.className = "level-card";
            article.dataset.levelId = level.id;
            article.dataset.difficulty = level.difficulty;

            article.innerHTML = `
                <div class="level-icon ${level.difficulty}">
                    <i class="fa-solid fa-bolt"></i>
                </div>

                <div class="level-info">
                    <h3>${level.name}</h3>
                    <p>${level.difficulty.toUpperCase()} • ${level.length}</p>

                    <div class="level-meta">
                        <span>★ ${level.stars}</span>
                        <span>● 3</span>
                        <span>${data.best || 0}%</span>
                    </div>
                </div>

                <div class="level-progress">
                    <div class="progress-track">
                        <div class="progress-fill"
                             style="width:${data.best || 0}%">
                        </div>
                    </div>

                    <span>${data.best || 0}%</span>
                </div>
            `;

            article.addEventListener("click", () => {
                openLevelDetails(level.id);
            });

            container.appendChild(article);
        });
    }

    function openLevelDetails(id) {
        const level = LEVELS.find(l => l.id === Number(id));

        if (!level) return;

        GAME.levelId = level.id;

        const data = GAME.save.levels[level.id] || {
            best: 0,
            attempts: 0,
            coins: []
        };

        $("detail-level-name").textContent = level.name;
        $("detail-difficulty").textContent = level.difficulty.toUpperCase();
        $("detail-difficulty-text").textContent = level.difficulty.toUpperCase();
        $("detail-length").textContent = level.length;
        $("detail-stars").textContent = `★ ${level.stars}`;
        $("detail-coins").textContent = `${(data.coins || []).length} / 3`;
        $("detail-best").textContent = `${data.best || 0}%`;
        $("detail-attempts").textContent = data.attempts || 0;

        const icon = $("detail-level-icon");

        if (icon) {
            icon.className = `large-level-icon ${level.difficulty}`;
        }

        showScreen("level-details");
    }

    /* =====================================================
       GAME START
    ===================================================== */

    function startLevel(id, practice = false) {
        const level = LEVELS.find(l => l.id === Number(id));

        if (!level) {
            notify("Level not found");
            return;
        }

        GAME.level = level;
        GAME.levelId = level.id;
        GAME.practice = practice;

        GAME.state = "PLAYING";
        GAME.progress = 0;
        GAME.coinsCollected = 0;
        GAME.collectedCoins = new Set();
        GAME.cameraX = 0;
        GAME.speed = level.speed;
        GAME.baseSpeed = level.speed;
        GAME.gravity = 1800;
        GAME.shake = 0;

        GAME.player.x = 120;
        GAME.player.y = 420;
        GAME.player.velocityY = 0;
        GAME.player.grounded = false;
        GAME.player.rotation = 0;
        GAME.player.gravityDirection = 1;
        GAME.player.mode = "cube";

        if (!GAME.save.levels[level.id]) {
            GAME.save.levels[level.id] = {
                best: 0,
                attempts: 0,
                coins: []
            };
        }

        GAME.save.levels[level.id].attempts++;

        saveGame();

        $("game-level-title").textContent = level.name.toUpperCase();

        showScreen("game-screen");

        resizeCanvas();

        hideOverlays();

        startGameLoop();

        notify(practice ? "Practice mode" : "GO!");

        beep(420, 0.06);
    }

    function restartLevel() {
        if (!GAME.levelId) return;

        startLevel(GAME.levelId, GAME.practice);
    }

    /* =====================================================
       GAME LOOP
    ===================================================== */

    function startGameLoop() {
        stopGameLoop();

        GAME.lastTime = performance.now();

        GAME.animationFrame = requestAnimationFrame(gameLoop);
    }

    function stopGameLoop() {
        if (GAME.animationFrame) {
            cancelAnimationFrame(GAME.animationFrame);
            GAME.animationFrame = 0;
        }
    }

    function gameLoop(time) {
        GAME.animationFrame = requestAnimationFrame(gameLoop);

        let dt = (time - GAME.lastTime) / 1000;

        GAME.lastTime = time;

        dt = Math.min(dt, 0.033);

        if (GAME.state === "PLAYING") {
            update(dt);
        }

        draw();
    }

    /* =====================================================
       UPDATE
    ===================================================== */

    function update(dt) {
        if (!GAME.level) return;

        const player = GAME.player;

        player.x += GAME.speed * dt;

        player.velocityY += GAME.gravity * player.gravityDirection * dt;

        player.y += player.velocityY * dt;

        handlePlatforms();

        handleWorldObjects();

        updateRotation(dt);

        GAME.cameraX = Math.max(
            0,
            player.x - canvas.width * 0.28
        );

        GAME.cameraX = Math.min(
            GAME.cameraX,
            Math.max(0, GAME.level.worldWidth - canvas.width)
        );

        GAME.progress = Math.min(
            100,
            Math.floor(
                (player.x /
                    Math.max(1, GAME.level.worldWidth - 500)) *
                    100
            )
        );

        updateHUD();

        updateParticles(dt);

        if (GAME.shake > 0) {
            GAME.shake -= dt * 30;

            if (GAME.shake < 0) {
                GAME.shake = 0;
            }
        }

        GAME.input.jumpPressed = false;

        if (
            player.y > canvas.height + 200 ||
            player.y < -300
        ) {
            die();
        }
    }

    /* =====================================================
       PLATFORM PHYSICS
    ===================================================== */

    function handlePlatforms() {
        const p = GAME.player;

        const previousBottom =
            p.y - p.velocityY * 0.016 + p.size;

        const bottom = p.y + p.size;

        p.grounded = false;

        if (p.gravityDirection === 1) {
            const floorY = 500;

            if (
                bottom >= floorY &&
                p.y < floorY + 100
            ) {
                p.y = floorY - p.size;
                p.velocityY = 0;
                p.grounded = true;
            }
        } else {
            const ceilingY = 0;

            if (
                p.y <= ceilingY &&
                p.y > -100
            ) {
                p.y = ceilingY;
                p.velocityY = 0;
                p.grounded = true;
            }
        }

        for (const object of GAME.level.objects) {
            if (
                object.type !== "block" &&
                object.type !== "platform"
            ) {
                continue;
            }

            if (!rectsOverlap(
                p.x,
                p.y,
                p.size,
                p.size,
                object.x,
                object.y,
                object.w,
                object.h
            )) {
                continue;
            }

            if (p.gravityDirection === 1) {
                const platformTop = object.y;

                if (
                    previousBottom <= platformTop + 12 &&
                    p.velocityY >= 0
                ) {
                    p.y = platformTop - p.size;
                    p.velocityY = 0;
                    p.grounded = true;
                } else {
                    die();
                    return;
                }
            } else {
                const platformBottom = object.y + object.h;

                if (
                    p.y >= platformBottom - 12 &&
                    p.velocityY <= 0
                ) {
                    p.y = platformBottom;
                    p.velocityY = 0;
                    p.grounded = true;
                } else {
                    die();
                    return;
                }
            }
        }
    }

    /* =====================================================
       OBJECT COLLISIONS
    ===================================================== */

    function handleWorldObjects() {
        const p = GAME.player;

        for (const object of GAME.level.objects) {
            if (
                object.x > p.x + 180 ||
                object.x + (object.w || 40) < p.x - 100
            ) {
                continue;
            }

            if (object.type === "spike") {
                if (
                    rectsOverlap(
                        p.x + 5,
                        p.y + 5,
                        p.size - 10,
                        p.size - 10,
                        object.x,
                        object.y,
                        object.w || 38,
                        object.h || 34
                    )
                ) {
                    die();
                    return;
                }
            }

            if (object.type === "coin") {
                if (GAME.collectedCoins.has(object.id)) {
                    continue;
                }

                if (
                    circleRectCollision(
                        object.x,
                        object.y,
                        15,
                        p.x,
                        p.y,
                        p.size,
                        p.size
                    )
                ) {
                    collectCoin(object);
                }
            }

            if (object.type === "speed") {
                if (
                    !object.used &&
                    rectsOverlap(
                        p.x,
                        p.y,
                        p.size,
                        p.size,
                        object.x,
                        object.y,
                        50,
                        100
                    )
                ) {
                    object.used = true;
                    GAME.speed = GAME.baseSpeed * object.value;
                    burst(p.x, p.y, GAME.level.color);
                    beep(700, 0.05);
                }
            }

            if (object.type === "gravity") {
                if (
                    !object.used &&
                    rectsOverlap(
                        p.x,
                        p.y,
                        p.size,
                        p.size,
                        object.x,
                        object.y,
                        60,
                        100
                    )
                ) {
                    object.used = true;

                    p.gravityDirection *= -1;

                    p.velocityY = 0;

                    burst(p.x, p.y, "#ffffff");

                    beep(900, 0.08);
                }
            }

            if (object.type === "finish") {
                if (
                    rectsOverlap(
                        p.x,
                        p.y,
                        p.size,
                        p.size,
                        object.x,
                        object.y,
                        object.w,
                        object.h
                    )
                ) {
                    completeLevel();
                    return;
                }
            }
        }
    }

    /* =====================================================
       JUMP
    ===================================================== */

    function jump() {
        if (GAME.state !== "PLAYING") return;

        const p = GAME.player;

        if (!p.grounded) return;

        p.velocityY =
            -650 * p.gravityDirection;

        p.grounded = false;

        burst(
            p.x + p.size / 2,
            p.y + p.size,
            GAME.level ? GAME.level.color : "#00eaff"
        );

        beep(520, 0.055);
    }

    /* =====================================================
       INPUT
    ===================================================== */

    function pressJump() {
        if (GAME.state === "PLAYING") {
            jump();
        }
    }

    document.addEventListener("keydown", event => {
        if (
            event.code === "Space" ||
            event.code === "ArrowUp" ||
            event.code === "KeyW"
        ) {
            event.preventDefault();

            if (!GAME.input.jump) {
                GAME.input.jumpPressed = true;
                GAME.input.jump = true;
                pressJump();
            }
        }

        if (event.code === "Escape") {
            event.preventDefault();

            if (GAME.state === "PLAYING") {
                pauseGame();
            } else if (GAME.state === "PAUSED") {
                resumeGame();
            }
        }

        if (event.code === "KeyR") {
            if (
                GAME.state === "PLAYING" ||
                GAME.state === "DEAD" ||
                GAME.state === "COMPLETE"
            ) {
                restartLevel();
            }
        }
    });

    document.addEventListener("keyup", event => {
        if (
            event.code === "Space" ||
            event.code === "ArrowUp" ||
            event.code === "KeyW"
        ) {
            GAME.input.jump = false;
        }
    });

    canvas.addEventListener("pointerdown", event => {
        event.preventDefault();
        pressJump();
    });

    const mobileAction = $("mobile-action");

    if (mobileAction) {
        mobileAction.addEventListener("pointerdown", event => {
            event.preventDefault();
            pressJump();
        });
    }

    /* =====================================================
       PAUSE
    ===================================================== */

    function pauseGame() {
        if (GAME.state !== "PLAYING") return;

        GAME.state = "PAUSED";

        showOverlay("pause-overlay");
    }

    function resumeGame() {
        if (GAME.state !== "PAUSED") return;

        GAME.state = "PLAYING";

        const overlay = $("pause-overlay");

        if (overlay) {
            overlay.classList.add("hidden");
        }

        GAME.lastTime = performance.now();
    }

    /* =====================================================
       DEATH
    ===================================================== */

    function die() {
        if (GAME.state !== "PLAYING") return;

        GAME.state = "DEAD";

        GAME.shake =
            GAME.settings.shake ? 12 : 0;

        burst(
            GAME.player.x,
            GAME.player.y,
            "#ff315c",
            30
        );

        beep(100, 0.15);

        const progress =
            Math.max(0, Math.min(100, GAME.progress));

        const deathProgress = $("death-progress");
        const deathAttempt = $("death-attempt");

        if (deathProgress) {
            deathProgress.textContent =
                `${progress}%`;
        }

        if (deathAttempt) {
            const data =
                GAME.save.levels[GAME.levelId];

            deathAttempt.textContent =
                data ? data.attempts : GAME.attempts;
        }

        updateBestProgress(progress);

        showOverlay("death-overlay");
    }

    /* =====================================================
       COMPLETE
    ===================================================== */

    function completeLevel() {
        if (GAME.state !== "PLAYING") return;

        GAME.state = "COMPLETE";
        GAME.progress = 100;

        GAME.player.x =
            GAME.level.worldWidth - 500;

        const data =
            GAME.save.levels[GAME.levelId];

        if (!data) return;

        data.best = 100;

        const collected =
            Array.from(GAME.collectedCoins);

        data.coins = Array.from(
            new Set([
                ...(data.coins || []),
                ...collected
            ])
        ).slice(0, 3);

        GAME.save.stars += GAME.level.stars;

        GAME.save.completed++;

        GAME.save.coins +=
            GAME.coinsCollected * 10;

        updateAchievementProgress();

        saveGame();

        $("complete-attempts").textContent =
            data.attempts;

        $("complete-coins").textContent =
            `${GAME.coinsCollected} / 3`;

        $("complete-stars").textContent =
            GAME.level.stars;

        showOverlay("complete-overlay");

        burst(
            GAME.player.x,
            GAME.player.y,
            GAME.level.color,
            50
        );

        beep(900, 0.1);
        setTimeout(() => beep(1200, 0.15), 100);
    }

    function updateBestProgress(progress) {
        if (!GAME.levelId) return;

        const data =
            GAME.save.levels[GAME.levelId];

        if (!data) return;

        if (progress > (data.best || 0)) {
            data.best = progress;
            saveGame();
        }

        updateLevelCards();
    }

    function updateLevelCards() {
        renderLevelList(
            document.querySelector(
                ".filter-button.active"
            )?.dataset.difficulty || "all"
        );
    }

    /* =====================================================
       COINS
    ===================================================== */

    function collectCoin(object) {
        GAME.collectedCoins.add(object.id);

        GAME.coinsCollected++;

        burst(
            object.x,
            object.y,
            "#ffd43b",
            15
        );

        beep(1000, 0.05);

        updateHUD();
    }

    /* =====================================================
       ROTATION
    ===================================================== */

    function updateRotation(dt) {
        const p = GAME.player;

        if (!p.grounded) {
            p.rotation +=
                dt *
                7 *
                (p.gravityDirection === 1 ? 1 : -1);
        } else {
            const quarter =
                Math.round(
                    p.rotation /
                    (Math.PI / 2)
                );

            p.rotation +=
                (quarter *
                    (Math.PI / 2) -
                    p.rotation) *
                Math.min(1, dt * 12);
        }
    }

    /* =====================================================
       HUD
    ===================================================== */

    function updateHUD() {
        const progressBar =
            $("game-progress-bar");

        const progressText =
            $("game-progress-text");

        if (progressBar) {
            progressBar.style.width =
                `${GAME.progress}%`;
        }

        if (progressText) {
            progressText.textContent =
                `${GAME.progress}%`;
        }

        const data =
            GAME.save.levels[GAME.levelId];

        if (data) {
            updateLevelCards();
        }
    }

    /* =====================================================
       CANVAS RESIZE
    ===================================================== */

    function resizeCanvas() {
        const rect =
            canvas.getBoundingClientRect();

        const width =
            Math.max(320, rect.width || window.innerWidth);

        const height =
            Math.max(300, rect.height || window.innerHeight);

        const dpr =
            Math.min(window.devicePixelRatio || 1, 2);

        canvas.width =
            Math.floor(width * dpr);

        canvas.height =
            Math.floor(height * dpr);

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );
    }

    window.addEventListener(
        "resize",
        resizeCanvas
    );

    /* =====================================================
       DRAW
    ===================================================== */

    function draw() {
        const rect =
            canvas.getBoundingClientRect();

        const width =
            Math.max(320, rect.width || window.innerWidth);

        const height =
            Math.max(300, rect.height || window.innerHeight);

        ctx.clearRect(0, 0, width, height);

        drawBackground(width, height);

        if (!GAME.level) {
            return;
        }

        ctx.save();

        if (
            GAME.settings.shake &&
            GAME.shake > 0
        ) {
            ctx.translate(
                (Math.random() - 0.5) * GAME.shake,
                (Math.random() - 0.5) * GAME.shake
            );
        }

        drawWorld(width, height);

        ctx.restore();

        drawParticles();
        drawPlayer();
    }

    /* =====================================================
       BACKGROUND
    ===================================================== */

    function drawBackground(width, height) {
        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );

        gradient.addColorStop(
            0,
            "#050516"
        );

        gradient.addColorStop(
            1,
            "#0b1027"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

        if (!GAME.settings.background) {
            return;
        }

        ctx.save();

        ctx.globalAlpha = 0.2;

        const gridSize = 50;

        const offset =
            -(GAME.cameraX * 0.25) %
            gridSize;

        ctx.strokeStyle =
            GAME.level?.color ||
            "#00eaff";

        ctx.lineWidth = 1;

        for (
            let x = offset;
            x < width;
            x += gridSize
        ) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (
            let y = 0;
            y < height;
            y += gridSize
        ) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();

        for (let i = 0; i < 6; i++) {
            const x =
                ((i * 280 -
                    GAME.cameraX * 0.1) %
                    (width + 400)) -
                200;

            const y =
                100 +
                i * 70;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3 + i,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                GAME.level?.color ||
                "#00eaff";

            ctx.globalAlpha = 0.18;

            ctx.fill();

            ctx.globalAlpha = 1;
        }
    }

    /* =====================================================
       WORLD
    ===================================================== */

    function drawWorld(width, height) {
        const groundY = 500;

        ctx.save();

        ctx.translate(
            -GAME.cameraX,
            0
        );

        for (const object of GAME.level.objects) {
            drawObject(object);
        }

        /* Ground glow */

        ctx.fillStyle = "#111936";

        ctx.fillRect(
            GAME.cameraX,
            groundY,
            width,
            height - groundY
        );

        ctx.strokeStyle =
            GAME.level.color;

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(
            GAME.cameraX,
            groundY
        );

        ctx.lineTo(
            GAME.cameraX + width,
            groundY
        );

        ctx.stroke();

        ctx.restore();
    }

    /* =====================================================
       OBJECT DRAWING
    ===================================================== */

    function drawObject(object) {
        const color =
            GAME.level.color ||
            "#00eaff";

        if (object.type === "ground") {
            ctx.fillStyle = "#10172f";

            ctx.fillRect(
                object.x,
                object.y,
                object.w,
                object.h
            );

            ctx.strokeStyle = color;

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.moveTo(
                object.x,
                object.y
            );

            ctx.lineTo(
                object.x + object.w,
                object.y
            );

            ctx.stroke();

            return;
        }

        if (
            object.type === "block" ||
            object.type === "platform"
        ) {
            glowRect(
                object.x,
                object.y,
                object.w,
                object.h,
                color
            );

            ctx.fillStyle = "#121a36";

            ctx.fillRect(
                object.x,
                object.y,
                object.w,
                object.h
            );

            ctx.strokeStyle = color;

            ctx.lineWidth = 2;

            ctx.strokeRect(
                object.x,
                object.y,
                object.w,
                object.h
            );

            return;
        }

        if (object.type === "spike") {
            ctx.save();

            if (object.inverted) {
                ctx.translate(
                    0,
                    object.y * 2 +
                    object.h
                );

                ctx.scale(1, -1);
            }

            ctx.beginPath();

            ctx.moveTo(
                object.x,
                object.y + object.h
            );

            ctx.lineTo(
                object.x +
                    object.w / 2,
                object.y
            );

            ctx.lineTo(
                object.x + object.w,
                object.y + object.h
            );

            ctx.closePath();

            ctx.fillStyle = "#ff315c";

            ctx.shadowBlur =
                GAME.settings.glow ? 15 : 0;

            ctx.shadowColor =
                "#ff315c";

            ctx.fill();

            ctx.restore();

            return;
        }

        if (object.type === "coin") {
            if (
                GAME.collectedCoins.has(
                    object.id
                )
            ) {
                return;
            }

            ctx.save();

            ctx.beginPath();

            ctx.arc(
                object.x,
                object.y,
                14,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "#ffd43b";

            ctx.shadowBlur =
                GAME.settings.glow ? 18 : 0;

            ctx.shadowColor =
                "#ffd43b";

            ctx.fill();

            ctx.shadowBlur = 0;

            ctx.strokeStyle = "#fff2a3";

            ctx.lineWidth = 2;

            ctx.stroke();

            ctx.restore();

            return;
        }

        if (object.type === "speed") {
            drawPortal(
                object.x,
                object.y,
                "#f59e0b",
                ">>"
            );

            return;
        }

        if (object.type === "gravity") {
            drawPortal(
                object.x,
                object.y,
                "#a855f7",
                "↕"
            );

            return;
        }

        if (object.type === "finish") {
            ctx.save();

            ctx.strokeStyle =
                "#ffffff";

            ctx.lineWidth = 4;

            ctx.beginPath();

            ctx.moveTo(
                object.x,
                object.y
            );

            ctx.lineTo(
                object.x,
                object.y + object.h
            );

            ctx.stroke();

            ctx.fillStyle =
                GAME.level.color;

            ctx.beginPath();

            ctx.moveTo(
                object.x,
                object.y
            );

            ctx.lineTo(
                object.x + 70,
                object.y + 25
            );

            ctx.lineTo(
                object.x,
                object.y + 50
            );

            ctx.closePath();

            ctx.fill();

            ctx.restore();
        }
    }

    function glowRect(x, y, w, h, color) {
        if (!GAME.settings.glow) return;

        ctx.save();

        ctx.shadowBlur = 18;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;

        ctx.strokeRect(
            x,
            y,
            w,
            h
        );

        ctx.restore();
    }

    function drawPortal(
        x,
        y,
        color,
        text
    ) {
        ctx.save();

        ctx.beginPath();

        ctx.ellipse(
            x + 25,
            y + 50,
            25,
            50,
            0,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle = color;

        ctx.lineWidth = 5;

        ctx.shadowBlur =
            GAME.settings.glow ? 20 : 0;

        ctx.shadowColor = color;

        ctx.stroke();

        ctx.shadowBlur = 0;

        ctx.fillStyle = color;

        ctx.font =
            "bold 20px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            text,
            x + 25,
            y + 50
        );

        ctx.restore();
    }

    /* =====================================================
       PLAYER
    ===================================================== */

    function drawPlayer() {
        if (!GAME.level) return;

        const p = GAME.player;

        const screenX =
            p.x - GAME.cameraX;

        const screenY =
            p.y;

        ctx.save();

        ctx.translate(
            screenX + p.size / 2,
            screenY + p.size / 2
        );

        ctx.rotate(p.rotation);

        if (GAME.settings.glow) {
            ctx.shadowBlur = 20;

            ctx.shadowColor =
                GAME.level.color;
        }

        ctx.fillStyle =
            GAME.level.color;

        ctx.fillRect(
            -p.size / 2,
            -p.size / 2,
            p.size,
            p.size
        );

        ctx.shadowBlur = 0;

        ctx.strokeStyle =
            "#ffffff";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            -p.size / 2,
            -p.size / 2,
            p.size,
            p.size
        );

        /* Eye */

        ctx.fillStyle =
            "#050516";

        ctx.fillRect(
            -7,
            -7,
            14,
            14
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            -4,
            -5,
            4,
            4
        );

        ctx.restore();
    }

    /* =====================================================
       PARTICLES
    ===================================================== */

    function burst(
        x,
        y,
        color,
        amount = 12
    ) {
        if (!GAME.settings.particles) {
            return;
        }

        for (
            let i = 0;
            i < amount;
            i++
        ) {
            const angle =
                Math.random() *
                Math.PI *
                2;

            const speed =
                50 +
                Math.random() * 220;

            GAME.particles.push({
                x,
                y,
                vx:
                    Math.cos(angle) *
                    speed,
                vy:
                    Math.sin(angle) *
                    speed,
                life:
                    0.3 +
                    Math.random() * 0.5,
                maxLife:
                    0.3 +
                    Math.random() * 0.5,
                size:
                    2 +
                    Math.random() * 4,
                color
            });
        }
    }

    function updateParticles(dt) {
        for (
            let i =
                GAME.particles.length - 1;
            i >= 0;
            i--
        ) {
            const particle =
                GAME.particles[i];

            particle.x +=
                particle.vx * dt;

            particle.y +=
                particle.vy * dt;

            particle.vy +=
                500 * dt;

            particle.life -= dt;

            if (particle.life <= 0) {
                GAME.particles.splice(
                    i,
                    1
                );
            }
        }
    }

    function drawParticles() {
        for (const particle of GAME.particles) {
            const alpha =
                Math.max(
                    0,
                    particle.life /
                        particle.maxLife
                );

            ctx.save();

            ctx.globalAlpha = alpha;

            ctx.fillStyle =
                particle.color;

            ctx.beginPath();

            ctx.arc(
                particle.x -
                    GAME.cameraX,
                particle.y,
                particle.size,
                0,
                Math.PI * 2
            );

            ctx.fill();

            ctx.restore();
        }
    }

    /* =====================================================
       COLLISION HELPERS
    ===================================================== */

    function rectsOverlap(
        ax,
        ay,
        aw,
        ah,
        bx,
        by,
        bw,
        bh
    ) {
        return (
            ax < bx + bw &&
            ax + aw > bx &&
            ay < by + bh &&
            ay + ah > by
        );
    }

    function circleRectCollision(
        cx,
        cy,
        radius,
        rx,
        ry,
        rw,
        rh
    ) {
        const closestX =
            Math.max(
                rx,
                Math.min(cx, rx + rw)
            );

        const closestY =
            Math.max(
                ry,
                Math.min(cy, ry + rh)
            );

        const dx =
            cx - closestX;

        const dy =
            cy - closestY;

        return (
            dx * dx +
            dy * dy <
            radius * radius
        );
    }

    /* =====================================================
       AUDIO
    ===================================================== */

    let audioContext = null;

    function getAudioContext() {
        if (!audioContext) {
            const AudioCtx =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioCtx) {
                return null;
            }

            audioContext =
                new AudioCtx();
        }

        if (
            audioContext.state ===
            "suspended"
        ) {
            audioContext.resume();
        }

        return audioContext;
    }

    function beep(
        frequency,
        duration
    ) {
        if (
            GAME.settings.soundVolume <= 0
        ) {
            return;
        }

        const audio =
            getAudioContext();

        if (!audio) return;

        const oscillator =
            audio.createOscillator();

        const gain =
            audio.createGain();

        oscillator.type = "square";

        oscillator.frequency.value =
            frequency;

        gain.gain.value =
            Math.min(
                0.08,
                GAME.settings.soundVolume /
                    1000
            );

        oscillator.connect(gain);

        gain.connect(
            audio.destination
        );

        oscillator.start();

        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime +
                duration
        );

        oscillator.stop(
            audio.currentTime +
                duration
        );
    }

    /* =====================================================
       TOP BAR / PROFILE STATS
    ===================================================== */

    function updateAllStats() {
        setText(
            "coin-counter",
            GAME.save.coins
        );

        setText(
            "diamond-counter",
            GAME.save.diamonds
        );

        setText(
            "star-counter",
            GAME.save.stars
        );

        setText(
            "completed-counter",
            GAME.save.completed
        );

        setText(
            "created-counter",
            GAME.save.created
        );

        setText(
            "profile-stars",
            GAME.save.stars
        );

        setText(
            "profile-coins",
            GAME.save.coins
        );

        setText(
            "profile-diamonds",
            GAME.save.diamonds
        );

        setText(
            "profile-creator-points",
            GAME.save.creatorPoints
        );

        setText(
            "shop-coins",
            GAME.save.coins
        );
    }

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = value;
        }
    }

    /* =====================================================
       ACHIEVEMENTS
    ===================================================== */

    const ACHIEVEMENTS = [
        {
            name: "FIRST STEP",
            condition: () =>
                GAME.save.completed >= 1
        },
        {
            name: "COLLECTOR",
            condition: () =>
                GAME.save.coins >= 100
        },
        {
            name: "SPEEDRUNNER",
            condition: () =>
                GAME.save.completed >= 1
        },
        {
            name: "CREATOR",
            condition: () =>
                GAME.save.created >= 1
        },
        {
            name: "MASTER",
            condition: () =>
                GAME.save.completed >= 50
        },
        {
            name: "PERFECT RUN",
            condition: () =>
                GAME.save.completed >= 1
        }
    ];

    function updateAchievementProgress() {
        const cards =
            document.querySelectorAll(
                ".achievement-card"
            );

        cards.forEach(
            (card, index) => {
                const achievement =
                    ACHIEVEMENTS[index];

                if (!achievement) return;

                const unlocked =
                    achievement.condition();

                const progress =
                    card.querySelector(
                        ".achievement-progress"
                    );

                if (unlocked) {
                    card.classList.add(
                        "unlocked"
                    );

                    if (progress) {
                        progress.textContent =
                            "COMPLETE";
                    }
                }
            }
        );
    }

    /* =====================================================
       SETTINGS
    ===================================================== */

    function setupSettings() {
        const checkboxSettings = {
            "setting-progress": "progress",
            "setting-shake": "shake",
            "setting-practice": "practice",
            "setting-particles": "particles",
            "setting-glow": "glow",
            "setting-background": "background"
        };

        Object.entries(
            checkboxSettings
        ).forEach(
            ([id, key]) => {
                const input = $(id);

                if (!input) return;

                input.checked =
                    GAME.settings[key];

                input.addEventListener(
                    "change",
                    () => {
                        GAME.settings[key] =
                            input.checked;

                        saveSettings();
                    }
                );
            }
        );

        const musicVolume =
            $("music-volume");

        const soundVolume =
            $("sound-volume");

        if (musicVolume) {
            musicVolume.value =
                GAME.settings.musicVolume;

            musicVolume.addEventListener(
                "input",
                () => {
                    GAME.settings.musicVolume =
                        Number(
                            musicVolume.value
                        );

                    saveSettings();
                }
            );
        }

        if (soundVolume) {
            soundVolume.value =
                GAME.settings.soundVolume;

            soundVolume.addEventListener(
                "input",
                () => {
                    GAME.settings.soundVolume =
                        Number(
                            soundVolume.value
                        );

                    saveSettings();
                }
            );
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(
                "neonDashSettings",
                JSON.stringify(
                    GAME.settings
                )
            );
        } catch (_) {}
    }

    function loadSettings() {
        try {
            const saved =
                localStorage.getItem(
                    "neonDashSettings"
                );

            if (saved) {
                GAME.settings = {
                    ...GAME.settings,
                    ...JSON.parse(saved)
                };
            }
        } catch (_) {}
    }

    /* =====================================================
       MUSIC / SOUND BUTTONS
    ===================================================== */

    let musicEnabled = true;
    let soundEnabled = true;

    function setupAudioButtons() {
        const musicButton =
            $("music-button");

        const soundButton =
            $("sound-button");

        if (musicButton) {
            musicButton.addEventListener(
                "click",
                () => {
                    musicEnabled =
                        !musicEnabled;

                    notify(
                        musicEnabled
                            ? "Music ON"
                            : "Music OFF"
                    );
                }
            );
        }

        if (soundButton) {
            soundButton.addEventListener(
                "click",
                () => {
                    soundEnabled =
                        !soundEnabled;

                    GAME.settings.soundVolume =
                        soundEnabled
                            ? 80
                            : 0;

                    notify(
                        soundEnabled
                            ? "Sound ON"
                            : "Sound OFF"
                    );
                }
            );
        }
    }

    /* =====================================================
       DAILY CHALLENGE
    ===================================================== */

    function setupDaily() {
        const button =
            document.querySelector(
                '[data-action="daily"]'
            );

        if (!button) return;

        button.addEventListener(
            "click",
            () => {
                startLevel(4, false);
            }
        );
    }

    /* =====================================================
       NAVIGATION
    ===================================================== */

    function setupNavigation() {
        document
            .querySelectorAll(
                "[data-screen]"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    event => {
                        event.preventDefault();

                        const target =
                            button.dataset.screen;

                        if (
                            target &&
                            $(target)
                        ) {
                            showScreen(target);
                        }
                    }
                );
            });

        const back =
            $("back-button");

        if (back) {
            back.addEventListener(
                "click",
                () => {
                    if (
                        GAME.screen ===
                        "game-screen"
                    ) {
                        exitLevel();
                        return;
                    }

                    if (
                        GAME.screen ===
                        "level-details"
                    ) {
                        showScreen(
                            "level-select"
                        );
                        return;
                    }

                    showScreen(
                        "main-menu"
                    );
                }
            );
        }
    }

    /* =====================================================
       LEVEL BUTTONS
    ===================================================== */

    function setupLevelButtons() {
        const play =
            $("play-level-button");

        const practice =
            $("practice-level-button");

        if (play) {
            play.addEventListener(
                "click",
                () => {
                    startLevel(
                        GAME.levelId,
                        false
                    );
                }
            );
        }

        if (practice) {
            practice.addEventListener(
                "click",
                () => {
                    if (
                        !GAME.settings.practice
                    ) {
                        notify(
                            "Practice is disabled in settings"
                        );

                        return;
                    }

                    startLevel(
                        GAME.levelId,
                        true
                    );
                }
            );
        }
    }

    /* =====================================================
       GAME BUTTONS
    ===================================================== */

    function setupGameButtons() {
        const pause =
            $("pause-button");

        const resume =
            $("resume-button");

        const restart =
            $("restart-button");

        const exit =
            $("exit-level-button");

        const deathRetry =
            $("death-retry-button");

        const deathMenu =
            $("death-menu-button");

        const completeReplay =
            $("complete-replay-button");

        const completeMenu =
            $("complete-menu-button");

        if (pause) {
            pause.addEventListener(
                "click",
                pauseGame
            );
        }

        if (resume) {
            resume.addEventListener(
                "click",
                resumeGame
            );
        }

        if (restart) {
            restart.addEventListener(
                "click",
                () => {
                    hideOverlays();
                    restartLevel();
                }
            );
        }

        if (exit) {
            exit.addEventListener(
                "click",
                exitLevel
            );
        }

        if (deathRetry) {
            deathRetry.addEventListener(
                "click",
                () => {
                    hideOverlays();
                    restartLevel();
                }
            );
        }

        if (deathMenu) {
            deathMenu.addEventListener(
                "click",
                () => {
                    hideOverlays();
                    showScreen(
                        "level-select"
                    );
                }
            );
        }

        if (completeReplay) {
            completeReplay.addEventListener(
                "click",
                () => {
                    hideOverlays();
                    restartLevel();
                }
            );
        }

        if (completeMenu) {
            completeMenu.addEventListener(
                "click",
                () => {
                    hideOverlays();
                    showScreen(
                        "level-select"
                    );
                }
            );
        }
    }

    function exitLevel() {
        hideOverlays();

        stopGameLoop();

        GAME.state = "MENU";

        showScreen(
            "level-details"
        );

        if (GAME.levelId) {
            openLevelDetails(
                GAME.levelId
            );
        }
    }

    /* =====================================================
       DIFFICULTY FILTER
    ===================================================== */

    function setupDifficultyFilters() {
        document
            .querySelectorAll(
                ".filter-button"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        document
                            .querySelectorAll(
                                ".filter-button"
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        renderLevelList(
                            button.dataset
                                .difficulty
                        );
                    }
                );
            });
    }

    /* =====================================================
       ONLINE SEARCH
    ===================================================== */

    function setupOnlineSearch() {
        const search =
            $("level-search");

        if (!search) return;

        search.addEventListener(
            "input",
            () => {
                const query =
                    search.value
                        .trim()
                        .toLowerCase();

                document
                    .querySelectorAll(
                        ".online-level-card"
                    )
                    .forEach(card => {
                        const text =
                            card.textContent
                                .toLowerCase();

                        card.style.display =
                            !query ||
                            text.includes(query)
                                ? ""
                                : "none";
                    });
            }
        );
    }

    /* =====================================================
       SHOP
    ===================================================== */

    function setupShop() {
        document
            .querySelectorAll(
                ".shop-item"
            )
            .forEach(item => {
                item.addEventListener(
                    "click",
                    () => {
                        if (
                            item.classList.contains(
                                "owned"
                            )
                        ) {
                            notify(
                                "Already owned"
                            );

                            return;
                        }

                        const text =
                            item.textContent;

                        const match =
                            text.match(
                                /(\d+)\s*COINS/i
                            );

                        const price =
                            match
                                ? Number(
                                      match[1]
                                  )
                                : 0;

                        if (
                            GAME.save.coins <
                            price
                        ) {
                            notify(
                                `You need ${price} coins`
                            );

                            return;
                        }

                        GAME.save.coins -=
                            price;

                        item.classList.add(
                            "owned"
                        );

                        const span =
                            item.querySelector(
                                "span"
                            );

                        if (span) {
                            span.textContent =
                                "OWNED";
                        }

                        saveGame();

                        updateAllStats();

                        notify(
                            "Item purchased"
                        );
                    }
                );
            });
    }

    /* =====================================================
       RESET SAVE
    ===================================================== */

    function setupReset() {
        const button =
            $("reset-save");

        if (!button) return;

        button.addEventListener(
            "click",
            () => {
                const confirmed =
                    window.confirm(
                        "Reset all Neon Dash progress?"
                    );

                if (!confirmed) {
                    return;
                }

                localStorage.removeItem(
                    "neonDashSave"
                );

                localStorage.removeItem(
                    "neonDashSettings"
                );

                location.reload();
            }
        );
    }

    /* =====================================================
       EDITOR
    ===================================================== */

    function setupEditor() {
        const editorCanvas =
            $("editor-canvas");

        if (!editorCanvas) return;

        const editorCtx =
            editorCanvas.getContext("2d");

        function resizeEditor() {
            const rect =
                editorCanvas.getBoundingClientRect();

            const dpr =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            editorCanvas.width =
                Math.max(
                    320,
                    rect.width * dpr
                );

            editorCanvas.height =
                Math.max(
                    300,
                    rect.height * dpr
                );

            editorCtx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );

            drawEditor();
        }

        function drawEditor() {
            const rect =
                editorCanvas.getBoundingClientRect();

            const w =
                Math.max(320, rect.width);

            const h =
                Math.max(300, rect.height);

            editorCtx.clearRect(
                0,
                0,
                w,
                h
            );

            editorCtx.fillStyle =
                "#080b1c";

            editorCtx.fillRect(
                0,
                0,
                w,
                h
            );

            editorCtx.strokeStyle =
                "rgba(0,234,255,.12)";

            for (
                let x = 0;
                x < w;
                x += 40
            ) {
                editorCtx.beginPath();

                editorCtx.moveTo(
                    x,
                    0
                );

                editorCtx.lineTo(
                    x,
                    h
                );

                editorCtx.stroke();
            }

            for (
                let y = 0;
                y < h;
                y += 40
            ) {
                editorCtx.beginPath();

                editorCtx.moveTo(
                    0,
                    y
                );

                editorCtx.lineTo(
                    w,
                    y
                );

                editorCtx.stroke();
            }

            for (
                const object of GAME.editor.objects
            ) {
                editorCtx.fillStyle =
                    object.type === "spike"
                        ? "#ff315c"
                        : "#00eaff";

                editorCtx.fillRect(
                    object.x,
                    object.y,
                    object.w || 40,
                    object.h || 40
                );
            }
        }

        function addEditorObject(
            type
        ) {
            GAME.editor.history.push(
                JSON.stringify(
                    GAME.editor.objects
                )
            );

            GAME.editor.future = [];

            GAME.editor.objects.push({
                type,
                x:
                    100 +
                    GAME.editor.objects.length *
                        50,
                y: 400,
                w: 40,
                h: 40
            });

            drawEditor();
        }

        document
            .querySelectorAll(
                ".editor-category"
            )
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        document
                            .querySelectorAll(
                                ".editor-category"
                            )
                            .forEach(
                                b =>
                                    b.classList.remove(
                                        "active"
                                    )
                            );

                        button.classList.add(
                            "active"
                        );

                        const text =
                            button.textContent
                                .trim()
                                .toLowerCase();

                        if (
                            text.includes(
                                "hazard"
                            )
                        ) {
                            addEditorObject(
                                "spike"
                            );
                        } else if (
                            text.includes(
                                "coin"
                            )
                        ) {
                            addEditorObject(
                                "coin"
                            );
                        } else if (
                            text.includes(
                                "portal"
                            )
                        ) {
                            addEditorObject(
                                "portal"
                            );
                        } else {
                            addEditorObject(
                                "block"
                            );
                        }
                    }
                );
            });

        const undo =
            $("editor-undo");

        const redo =
            $("editor-redo");

        if (undo) {
            undo.addEventListener(
                "click",
                () => {
                    if (
                        GAME.editor.history.length ===
                        0
                    ) {
                        return;
                    }

                    GAME.editor.future.push(
                        JSON.stringify(
                            GAME.editor.objects
                        )
                    );

                    GAME.editor.objects =
                        JSON.parse(
                            GAME.editor.history.pop()
                        );

                    drawEditor();
                }
            );
        }

        if (redo) {
            redo.addEventListener(
                "click",
                () => {
                    if (
                        GAME.editor.future.length ===
                        0
                    ) {
                        return;
                    }

                    GAME.editor.history.push(
                        JSON.stringify(
                            GAME.editor.objects
                        )
                    );

                    GAME.editor.objects =
                        JSON.parse(
                            GAME.editor.future.pop()
                        );

                    drawEditor();
                }
            );
        }

        const save =
            $("editor-save");

        if (save) {
            save.addEventListener(
                "click",
                () => {
                    try {
                        localStorage.setItem(
                            "neonDashEditor",
                            JSON.stringify(
                                GAME.editor.objects
                            )
                        );

                        GAME.save.created++;

                        GAME.save.creatorPoints +=
                            10;

                        saveGame();

                        updateAllStats();

                        notify(
                            "Level saved"
                        );
                    } catch (_) {
                        notify(
                            "Could not save level"
                        );
                    }
                }
            );
        }

        const test =
            $("editor-test");

        if (test) {
            test.addEventListener(
                "click",
                () => {
                    notify(
                        "Editor test mode is ready for your custom objects"
                    );
                }
            );
        }

        const play =
            $("editor-play");

        if (play) {
            play.addEventListener(
                "click",
                () => {
                    startLevel(1, false);
                }
            );
        }

        window.addEventListener(
            "resize",
            resizeEditor
        );

        resizeEditor();
    }

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function init() {
        loadSettings();
        loadSave();

        setupNavigation();
        setupLevelButtons();
        setupGameButtons();
        setupDifficultyFilters();
        setupSettings();
        setupAudioButtons();
        setupDaily();
        setupOnlineSearch();
        setupShop();
        setupReset();
        setupEditor();

        renderLevelList("all");

        updateAllStats();

        updateAchievementProgress();

        resizeCanvas();

        showScreen("main-menu");

        notify("Welcome to Neon Dash");

        console.log(
            "Neon Dash initialized successfully."
        );
    }

    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
