const fs = require('fs');
let text = fs.readFileSync('index.html', 'utf8');

// Update standard mode button
text = text.replace(
    /<a href=\"\#\" class=\"cyber-btn\">/g,
    '<a href="simple.html" class="cyber-btn" onclick="showModePopup(event, \'standard\')">'
);

// Update terminal mode button
text = text.replace(
    /onclick=\"showTerminalPopup\(event\)\"/g,
    'onclick="showModePopup(event, \'terminal\')"'
);

// Update proceedToTerminal in popup
text = text.replace(
    /onclick=\"proceedToTerminal\(\)\"/g,
    'onclick="triggerExitSequence()"'
);

// Replace existing functions
const newScripts = `
        window.pendingMode = '';
        window.isExiting = false;
        window.exitStartTime = 0;

        function closePopup() {
            document.getElementById('xpPopup').style.display = 'none';
        }

        function showModePopup(event, mode) {
            event.preventDefault();
            window.pendingMode = mode;
            document.getElementById('xpPopup').style.display = 'flex';
        }

        function triggerExitSequence() {
            document.getElementById('xpPopup').style.display = 'none';
            
            const splits = document.querySelectorAll('.anim-split');
            const blinks = document.querySelectorAll('.anim-blink');
            
            // 1. Text merges back (0.6s)
            splits.forEach(el => {
                el.style.animation = 'none';
                void el.offsetHeight;
                el.style.animation = 'introSplit 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse forwards';
            });
            
            // 2. Solid for 0.75s, then blinks twice till 1.5s
            blinks.forEach(el => {
                el.style.animation = 'none';
                void el.offsetHeight;
                el.style.animation = 'introBlink 1.5s reverse forwards';
            });
            
            // 3. HUD disappears completely
            setTimeout(() => {
                const hudElements = document.querySelectorAll('.fade-in-ui, .header, .marquee-container, .hero-layout, .qr-block, .typography-bg');
                hudElements.forEach(el => {
                    el.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                });
            }, 1100);

            // 4. 3D render comes to the middle and zooms in
            setTimeout(() => {
                window.isExiting = true;
                window.exitStartTime = clock.getElapsedTime();
            }, 1500);

            // 5. Navigate when sequence finishes
            setTimeout(() => {
                if (window.pendingMode === 'terminal') {
                    window.location.href = 'interactive.html';
                } else {
                    window.location.href = 'simple.html';
                }
            }, 3000); // Wait for 1.5s zoom + 1.5s intro delay
        }
`;

text = text.replace(/function closePopup\(\) \{[\s\S]*?window\.location\.href = 'interactive\.html';\s*\}/, newScripts.trim());

// Update animate() to support isExiting
// Find the top part of the animate block
const animateOld = `
            // Intro Camera Animation
            if (t < INTRO_DURATION) {
                let progress = t / INTRO_DURATION;
                // Ease out cubic
                let ease = 1.0 - Math.pow(1.0 - progress, 3);
                camera.position.x = 0.0 + (-4.5 - 0.0) * ease;
                camera.position.z = 8.0 + (16.0 - 8.0) * ease;
            } else {
                camera.position.x = -4.5;
                camera.position.z = 16.0;
            }
`.trim();

const animateNew = `
            // Intro / Outro Camera Animation
            if (window.isExiting) {
                let progress = (t - window.exitStartTime) / 1.5;
                if (progress > 1.0) progress = 1.0;
                
                // Ease in-out cubic
                let ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                // Move from left to center, and zoom z from 16 to 3
                camera.position.x = -4.5 + (0.0 - -4.5) * ease;
                camera.position.z = 16.0 + (3.0 - 16.0) * ease;
            } else if (t < INTRO_DURATION) {
                let progress = t / INTRO_DURATION;
                // Ease out cubic
                let ease = 1.0 - Math.pow(1.0 - progress, 3);
                camera.position.x = 0.0 + (-4.5 - 0.0) * ease;
                camera.position.z = 8.0 + (16.0 - 8.0) * ease;
            } else {
                camera.position.x = -4.5;
                camera.position.z = 16.0;
            }
`.trim();

text = text.replace(animateOld, animateNew);

fs.writeFileSync('index.html', text);
console.log('Script processed');
