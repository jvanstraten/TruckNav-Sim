import { convertAtsToGeo, convertEts2ToGeo } from "../map/converters";
import { getBearing } from "../map/maths";
import type { GameType, TelemetryPacket } from "~/types";

export function getTruckState(
    data: any,
    lastPosition: [number, number] | null,
    selectedGame: GameType,
    currentHeadingOffset: number,
    speedSamples: number[],
    maxSamples: number,
) {
    let x = 0;
    let z = 0;
    let rawGameHeading = 0;
    let placement = data["truck.world.placement"];
    if (placement) {
        x = placement[0];
        z = placement[2];
        rawGameHeading = placement[3];
    }
    let truckCoords: [number, number];

    if (Math.abs(x) < 0.001 && Math.abs(z) < 0.001) {
        truckCoords = [0, 0];
    } else {
        truckCoords =
            selectedGame === "ets2"
                ? convertEts2ToGeo(x, z)
                : convertAtsToGeo(x, z);
    }

    const truckSpeed = Math.max(
        0,
        Math.floor(data["truck.speed"] * 3.6),
    );

    const avgSpeed = updateMovingAverage(truckSpeed, speedSamples, maxSamples);

    const { heading, newOffset } = getCorrectHeading(
        rawGameHeading,
        truckSpeed,
        truckCoords,
        lastPosition,
        currentHeadingOffset,
    );

    return {
        truckCoords,
        truckSpeed,
        truckHeading: heading,
        headingOffset: newOffset,
        avgSpeed,
    };
}

export function getGameState(data: any) {
    const gameConnected = true;

    const scale = data["local.scale"];

    const hasInGameMarker =
        data["truck.navigation.distance"] > 100 && data["job.income"] === 0;

    const gameTime = convertTelemtryTime(data["game.time"]);

    return {
        gameConnected,
        hasInGameMarker,
        gameTime,
        scale,
    };
}

export function getNavigationState(data: any) {
    const fuel = 0;//parseInt(data.truck.current.dashboard.fuelAmount.toFixed(1)); -> not sure what the scaling should be
    const speedLimit = Math.max(0, Math.round(data["truck.navigation.speed.limit"] * 3.6));

    const totalMinutes = data["rest.stop"];
    const hours = Math.max(0, Math.floor(totalMinutes / 60));
    const mins = Math.max(0, totalMinutes % 60);

    const restStoptime = `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}`;

    return { fuel, speedLimit, restStoptime, restStopMinutes: totalMinutes };
}

export function getJobState(data: any, selectedGame: GameType) {
    let companyTarget = "";
    let cityTarget = "";
    let trailerCoords: [number, number] = [0, 0];

    const hasActiveJob = !!data["job.cargo"];

    const destinationCity = data["job.destination.city.id"];
    const destinationCompany = data["job.destination.company.id"];

    const jobType = data["job.job.market"];

    const sourceCity = data["job.source.city.id"];
    const sourceCompany = data["job.source.company.id"];

    if (data["trailer.0.body.type"]) {
        const placement = data["trailer.0.world.placement"];
        const isTrailerAvailable = placement && placement[0] != 0 && placement[2] != 0;

        const isTrailerAttached = data["trailer.0.connected"];

        if (jobType === "external_contracts" || jobType === "external_market") {
            companyTarget =
                isTrailerAvailable && !isTrailerAttached
                    ? sourceCompany
                    : destinationCompany;

            cityTarget =
                isTrailerAvailable && !isTrailerAttached
                    ? sourceCity
                    : destinationCity;
        } else {
            companyTarget = destinationCompany;
            cityTarget = destinationCity;
        }
    } else {
        companyTarget = destinationCompany;
        cityTarget = destinationCity;
    }

    return { hasActiveJob, cityTarget, companyTarget, trailerCoords };
}

/**
 * Checks if telemetry bridge is reachable
 * @param ip Ip to get data from
 * @param timeoutMs How long to wait before giving up
 * @returns boolean - true if running, false if not
 */
export async function isBridgeRunning(
    ip: string,
    timeoutMs: number = 2000,
): Promise<boolean> {
    const wsUrl = `ws://${ip}:30001`;

    return new Promise((resolve) => {
        const testSocket = new WebSocket(wsUrl);

        const timeoutId = setTimeout(() => {
            testSocket.close();
            resolve(false);
        }, timeoutMs);

        testSocket.onopen = () => {
            clearTimeout(timeoutId);
            testSocket.close();
            resolve(true);
        };

        testSocket.onerror = () => {
            clearTimeout(timeoutId);
            testSocket.close();
            resolve(false);
        };
    });
}

function getCorrectHeading(
    rawGameHeading: number,
    truckSpeed: number,
    currentCoords: [number, number],
    lastPosition: [number, number] | null,
    headingOffset: number,
) {
    let internalOffset = headingOffset;

    const rawDegrees = -rawGameHeading * 360;

    if (lastPosition && truckSpeed > 10) {
        const dist = Math.sqrt(
            Math.pow(currentCoords[0] - lastPosition[0], 2) +
                Math.pow(currentCoords[1] - lastPosition[1], 2),
        );

        if (dist > 0.00005) {
            const trueBearing = getBearing(lastPosition, currentCoords);

            let diff = trueBearing - rawDegrees;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;

            if (Math.abs(diff) < 90) {
                internalOffset += (diff - internalOffset) * 0.1;
            }
        }
    }

    let finalHeading = rawDegrees + internalOffset;
    finalHeading = ((finalHeading % 360) + 360) % 360;

    return { heading: finalHeading, newOffset: internalOffset };
}

function convertTelemtryTime(time: any) {
    let minutes = time % (24 * 60);
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function updateMovingAverage(
    currentSpeed: number,
    speedSamples: number[],
    maxSamples: number,
) {
    if (currentSpeed > 10) {
        speedSamples.push(currentSpeed);
        if (speedSamples.length > maxSamples) speedSamples.shift();
    }

    if (speedSamples.length === 0) return 80;

    const sum = speedSamples.reduce((a, b) => a + b, 0);
    return sum / speedSamples.length;
}
