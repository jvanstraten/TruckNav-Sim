import { darkenColor, lightenColor } from "~/assets/utils/colors";

export const generateTruckIcon = (
    baseColor: string,
): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const dark = darkenColor(baseColor, 0.1);
        const light = lightenColor(baseColor, 0.23);

        const svgString = `
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="truck-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="50%" stop-color="${dark}" />
                        <stop offset="50%" stop-color="${light}" />
                    </linearGradient>
                </defs>
                <path 
                    d="M50 10 L90 85 L50 70 L10 85 Z" 
                    fill="url(#truck-grad)" 
                    stroke="url(#truck-grad)" 
                    stroke-width="12" 
                    stroke-linejoin="round" 
                    paint-order="stroke fill"
                />
            </svg>
        `;

        const img = new Image(40, 40);
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src =
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    });
};

export const generateDestinationIcon = (
    baseColor: string,
): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const dark = darkenColor(baseColor, 0.19);
        const darkInner = darkenColor(baseColor, 0.05);

        const svgString = `
        <svg width="18" height="23" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 42 C16 42 32 26 32 16 C32 7.6 24.837 0 16 0 C7.6 0 0 7.6 0 16 C0 26 16 42 16 42 Z" fill="${darkInner}" />
            
            <!-- Middle Darker Ring -->
            <circle cx="16" cy="16" r="11" fill="${dark}" />
            
            <!-- Innermost White Circle -->
            <circle cx="16" cy="16" r="4.5" fill="#fafafa" />
        </svg>`;

        const img = new Image(28, 36);
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src =
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    });
};
