document.addEventListener('DOMContentLoaded', () => {
    try {
        VANTA.WAVES({
            el: "#canvas-container",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x0a192f,
            shininess: 35.00,
            waveHeight: 20.00,
            waveSpeed: 0.75,
            zoom: 0.65
        });
    } catch (e) {
        console.error("Vanta JS failed to load", e);
        // Fallback to CSS gradient if JS fails
        document.getElementById('canvas-container').style.background = 'linear-gradient(to bottom, #0a192f, #112240)';
    }
});
