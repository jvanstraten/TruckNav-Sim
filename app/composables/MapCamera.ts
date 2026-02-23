import { Map } from "maplibre-gl";

export const useMapCamera = (map: Ref<Map | null>) => {
    const isCameraLocked = ref(false);
    const isNavigating = ref(false);

    let targetCoords: [number, number] | null = null;
    let targetHeading: number = 0;
    let animationFrameId: number | null = null;

    let isEasing = false;
    let easeTimeout: ReturnType<typeof setTimeout> | null = null;

    let lastTime = 0;

    const renderLoop = (timestamp: number) => {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (isCameraLocked.value && map.value && targetCoords && !isEasing) {
            const currentCenter = map.value.getCenter();
            let currentBearing = map.value.getBearing();

            const dt = Math.min(deltaTime, 100);

            const lerpFactor = 1 - Math.pow(0.9, dt / 16.666);

            const lng =
                currentCenter.lng +
                (targetCoords[0] - currentCenter.lng) * lerpFactor;
            const lat =
                currentCenter.lat +
                (targetCoords[1] - currentCenter.lat) * lerpFactor;

            let diff =
                (isNavigating.value ? targetHeading : 0) - currentBearing;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            const bearing = currentBearing + diff * lerpFactor;

            map.value.jumpTo({
                center: [lng, lat],
                bearing: bearing,
            });
        }

        animationFrameId = requestAnimationFrame(renderLoop);
    };

    const startRenderLoop = () => {
        if (!animationFrameId) {
            lastTime = 0;
            animationFrameId = requestAnimationFrame(renderLoop);
        }
    };

    const stopRenderLoop = () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    };

    const breakLockEvents = [
        "dragstart",
        "touchstart",
        "wheel",
        "pitchstart",
        "boxzoomstart",
    ];

    const initCameraListeners = () => {
        if (!map.value) return;

        startRenderLoop();

        breakLockEvents.forEach((event) => {
            map.value!.on(event, (e: any) => {
                if (e.originalEvent && isCameraLocked.value) {
                    isCameraLocked.value = false;
                    targetCoords = null;
                }
            });
        });
    };

    const followTruck = (coords: [number, number], heading: number) => {
        if (!isCameraLocked.value || !map.value) return;

        targetCoords = coords;
        targetHeading = heading;
    };

    const lockCamera = () => {
        if (!map.value) return;
        isCameraLocked.value = true;
    };

    const startNavigationMode = (coords: [number, number], heading: number) => {
        if (!map.value) return;
        isNavigating.value = true;
        isCameraLocked.value = true;
        targetCoords = coords;
        targetHeading = heading;

        isEasing = true;
        if (easeTimeout) clearTimeout(easeTimeout);

        easeTimeout = setTimeout(() => {
            isEasing = false;
        }, 300);

        map.value.easeTo({
            center: coords,
            bearing: isNavigating.value ? heading : 0,
            zoom: 11,
            pitch: 35,
            duration: 300,
            offset: [0, 50],
        });
    };

    onUnmounted(() => {
        stopRenderLoop();
        if (easeTimeout) clearTimeout(easeTimeout);
    });

    return {
        isCameraLocked,
        isNavigating,
        initCameraListeners,
        followTruck,
        lockCamera,
        startNavigationMode,
    };
};
