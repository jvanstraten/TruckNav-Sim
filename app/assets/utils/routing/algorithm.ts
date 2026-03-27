import { MinHeap } from "~/assets/utils/routing/MinHeap";
import { getBearing, getAngleDiff } from "~/assets/utils/map/maths";
import { convertGeoToAts, convertGeoToEts2 } from "../map/converters";
import type { GameType } from "~/types";

const MAX_NODES = 900000;

const cache_costs = new Float64Array(MAX_NODES);
const cache_previous = new Int32Array(MAX_NODES);
const cache_visited = new Uint8Array(MAX_NODES);
const cache_arrival_heading = new Float32Array(MAX_NODES);
const cache_is_ferry = new Uint8Array(MAX_NODES);

const openHeap = new MinHeap(50000);

let cache_flatCoords: Float64Array | null = null;

export interface SimpleCityNode {
    x: number; // Game X (Converted from Lng)
    z: number; // Game Z (Converted from Lat)
    radius: number; // calculated from scaleRank
}

function ensureCoordCache(nodeCoords: Map<number, [number, number]>) {
    if (cache_flatCoords && cache_flatCoords.length > 0) return;

    cache_flatCoords = new Float64Array(MAX_NODES * 2);

    for (const [id, [lng, lat]] of nodeCoords) {
        if (id * 2 + 1 < cache_flatCoords.length) {
            cache_flatCoords[id * 2] = lng;
            cache_flatCoords[id * 2 + 1] = lat;
        }
    }
}

export function getScaleMultiplier(
    gameX: number,
    gameZ: number,
    cities: SimpleCityNode[] | null,
    selectedGame: string | null,
): number {
    if (!cities) return selectedGame === "ats" ? 20 : 19;

    for (let i = 0; i < cities.length; i++) {
        const city = cities[i]!;
        const dx = gameX - city.x;
        const dy = gameZ - city.z;

        if (dx * dx + dy * dy < city.radius * city.radius) {
            return 3;
        }
    }

    return selectedGame === "ats" ? 20 : 19;
}

function fastDistKm(
    lng1: number,
    lat1: number,
    lng2: number,
    lat2: number,
): number {
    const ky = 111.0;
    const kx = 111.0 * 0.65;

    const dy = (lat1 - lat2) * ky;
    const dx = (lng1 - lng2) * kx;

    return Math.sqrt(dx * dx + dy * dy);
}

export const calculateRoute = (
    start: number,
    possibleEnds: Set<number | undefined>,
    startHeading: number | null,
    adjacency: Map<number, any[]>,
    nodeCoords: Map<number, [number, number]>,
    startType: "road" | "yard" = "road",
    ownedDlcs: number[],
    targetLocation?: [number, number],
): {
    path: [number, number][];
    nodeSequence: number[];
    endId: number;
} | null => {
    ensureCoordCache(nodeCoords);
    const flatCoords = cache_flatCoords!;

    cache_costs.fill(Infinity);
    cache_previous.fill(-1);
    cache_visited.fill(0);
    cache_arrival_heading.fill(0);
    cache_is_ferry.fill(0);

    openHeap.clear();

    let destLng = 0,
        destLat = 0;
    let foundDest = false;

    if (targetLocation) {
        destLng = targetLocation[0];
        destLat = targetLocation[1];
        foundDest = true;
    } else {
        const firstEndId = [...possibleEnds][0];
        if (firstEndId !== undefined) {
            destLng = flatCoords[firstEndId * 2]!;
            destLat = flatCoords[firstEndId * 2 + 1]!;
            foundDest = true;
        }
    }

    if (!foundDest) return null;

    const startLng = flatCoords[start * 2]!;
    const startLat = flatCoords[start * 2 + 1]!;

    const distKm = fastDistKm(startLng, startLat, destLng, destLat);
    const maxIterations = 70000 + distKm * 5000;

    const HEURISTIC_SCALE = 1.0;

    const getHeuristic = (id: number) => {
        const nLng = flatCoords[id * 2]!;
        const nLat = flatCoords[id * 2 + 1]!;
        const dx = nLng - destLng;
        const dy = nLat - destLat;
        return Math.sqrt(dx * dx + dy * dy) * 100 * HEURISTIC_SCALE;
    };

    cache_costs[start] = 0;
    openHeap.push(start, 0);

    let foundEndId: number | null = null;
    let iterations = 0;

    while (openHeap.size() > 0) {
        iterations++;
        if (iterations > maxIterations) return null;

        const currentId = openHeap.pop();
        if (currentId === undefined) break;

        const currentArrivalHeading = cache_arrival_heading[currentId]!;

        if (cache_visited[currentId] === 1) continue;
        cache_visited[currentId] = 1;

        if (possibleEnds.has(currentId)) {
            foundEndId = currentId;
            break;
        }

        const currentG = cache_costs[currentId]!;
        const neighbors = adjacency.get(currentId);
        if (!neighbors) continue;

        const cLng = flatCoords[currentId * 2]!;
        const cLat = flatCoords[currentId * 2 + 1]!;
        const prevId = cache_previous[currentId]!;
        const ferryGraceCounter = cache_is_ferry[currentId];

        for (let i = 0; i < neighbors.length; i++) {
            const edge = neighbors[i]!;

            // DLC Check
            const dlcId = edge.requiredDlc || 0;
            if (dlcId !== 0 && !ownedDlcs.includes(dlcId)) continue;

            const neighborId = edge.to;
            if (cache_visited[neighborId] === 1) continue;

            let stepCost = edge.weight || 1;

            if (!edge.isFerry && ferryGraceCounter === 0) {
                if (currentId === start && startHeading !== null) {
                    const nLng = flatCoords[neighborId * 2]!;
                    const nLat = flatCoords[neighborId * 2 + 1]!;
                    const dir = getBearing([cLng, cLat], [nLng, nLat]);
                    const diff = getAngleDiff(startHeading, dir);

                    if (startType === "yard") {
                        stepCost += 10;
                        if (diff > 75) stepCost += 10_000_000;
                        else if (diff > 45) stepCost += 1000;
                    } else {
                        if (diff > 75) stepCost += 10_000_000;
                        else if (diff > 45) stepCost += 1000;
                    }
                } else if (
                    prevId !== -1 &&
                    currentId !== start &&
                    edge.hOut !== undefined
                ) {
                    let diff = Math.abs(currentArrivalHeading - edge.hOut);
                    if (diff > Math.PI) diff = 2 * Math.PI - diff;

                    if (diff > 2.35) {
                        continue;
                    }

                    if (diff > 1.0) {
                        stepCost += 500;
                    } else if (diff > 0.4) {
                        stepCost += 1000;
                    }
                }
            }

            if (stepCost < 1) stepCost = 1;
            const tentativeG = currentG + stepCost;

            if (tentativeG < cache_costs[neighborId]!) {
                cache_previous[neighborId] = currentId;
                cache_costs[neighborId] = tentativeG;
                cache_arrival_heading[neighborId] = edge.hIn || 0;

                if (edge.isFerry) {
                    cache_is_ferry[neighborId] = 5;
                } else {
                    cache_is_ferry[neighborId] = Math.max(
                        0,
                        ferryGraceCounter! - 1,
                    );
                }

                openHeap.push(
                    neighborId,
                    tentativeG + getHeuristic(neighborId),
                );
            }
        }
    }

    if (foundEndId === null) return null;

    const path: [number, number][] = [];
    const nodeSequence: number[] = [];
    let curr: number = foundEndId;

    while (curr !== -1) {
        path.unshift([flatCoords[curr * 2]!, flatCoords[curr * 2 + 1]!]);
        nodeSequence.unshift(curr);
        curr = cache_previous[curr]!;
        if (path.length > 20000) break;
    }

    return { path, nodeSequence, endId: foundEndId };
};

export const simplifyPath = (
    points: [number, number][],
    epsilon = 0.000005,
): [number, number][] => {
    if (points.length <= 2) return points;

    const sqEpsilon = epsilon * epsilon;

    const getSqDist = (
        p: [number, number],
        a: [number, number],
        b: [number, number],
    ) => {
        let x = a[0],
            y = a[1],
            dx = b[0] - x,
            dy = b[1] - y;
        if (dx !== 0 || dy !== 0) {
            let t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
            if (t > 1) {
                x = b[0];
                y = b[1];
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }
        dx = p[0] - x;
        dy = p[1] - y;
        return dx * dx + dy * dy;
    };

    const simplifyRecursive = (
        pts: [number, number][],
        start: number,
        end: number,
        sqEpsilon: number,
        result: [number, number][],
    ) => {
        let maxSqDist = sqEpsilon;
        let index = -1;
        for (let i = start + 1; i < end; i++) {
            let d = getSqDist(pts[i]!, pts[start]!, pts[end]!);
            if (d > maxSqDist) {
                index = i;
                maxSqDist = d;
            }
        }
        if (index !== -1) {
            simplifyRecursive(pts, start, index, sqEpsilon, result);
            result.push(pts[index]!);
            simplifyRecursive(pts, index, end, sqEpsilon, result);
        }
    };

    const result = [points[0]!];
    simplifyRecursive(points, 0, points.length - 1, sqEpsilon, result);
    result.push(points[points.length - 1]!);
    return result;
};

export const smoothPath = (
    path: [number, number][],
    iterations = 5,
): [number, number][] => {
    if (path.length < 3) return path;
    let current = path;
    for (let it = 0; it < iterations; it++) {
        const smoothed: [number, number][] = [current[0]!];
        for (let i = 1; i < current.length - 1; i++) {
            const p = current[i - 1]!,
                c = current[i]!,
                n = current[i + 1]!;
            smoothed.push([
                p[0] * 0.25 + c[0] * 0.5 + n[0] * 0.25,
                p[1] * 0.25 + c[1] * 0.5 + n[1] * 0.25,
            ]);
        }
        smoothed.push(current[current.length - 1]!);
        current = smoothed;
    }
    return current;
};

export const mergeClosePoints = (
    coords: [number, number][],
    minDistanceMeters = 5,
): [number, number][] => {
    if (coords.length < 2) return coords;
    const result: [number, number][] = [];
    let i = 0;
    while (i < coords.length) {
        const current = coords[i]!;
        if (i === coords.length - 1) {
            result.push(current);
            break;
        }
        const next = coords[i + 1]!;
        const d = fastDistKm(current[0], current[1], next[0], next[1]) * 1000;

        if (d < minDistanceMeters) {
            const midPoint: [number, number] = [
                (current[0] + next[0]) / 2,
                (current[1] + next[1]) / 2,
            ];
            result.push(midPoint);
            i += 2;
        } else {
            result.push(current);
            i++;
        }
    }
    if (result.length < 2) result.push(coords[coords.length - 1]!);
    return result;
};

export function buildRouteStatsCache(
    pathCoords: [number, number][],
    cities: SimpleCityNode[] | null,
    selectedGame: GameType,
    sdkScale: number = 0,
    avgSpeed: number,
) {
    const cache = new Float32Array(pathCoords.length * 2);
    const isAts = selectedGame === "ats";
    const highwayScale = isAts ? 20 : 19;

    const baseHighway = isAts ? 105 : 82;
    const highwaySpeed =
        avgSpeed > 40 ? avgSpeed * 0.7 + baseHighway * 0.3 : baseHighway;

    const baseCity = isAts ? 40 : 32;
    const citySpeed =
        avgSpeed > 40 ? avgSpeed * 0.4 + baseCity * 0.6 : baseCity;
    const speeds = { highway: highwaySpeed, city: citySpeed };

    const gamePoints = pathCoords.map((p) =>
        isAts ? convertGeoToAts(p[0], p[1]) : convertGeoToEts2(p[0], p[1]),
    );

    let totalKm = 0;
    let totalHours = 0;

    cache[0] = 0; // km
    cache[1] = 0; // hours

    for (let i = 0; i < pathCoords.length - 1; i++) {
        const [x1, z1] = gamePoints[i]!;
        const [x2, z2] = gamePoints[i + 1]!;

        const dx = x2 - x1;
        const dz = z2 - z1;
        const rawLength = Math.sqrt(dx * dx + dz * dz);

        let multiplier = getScaleMultiplier(
            (x1 + x2) / 2,
            (z1 + z2) / 2,
            cities,
            selectedGame,
        );

        if (i < 5 && sdkScale > 0) {
            multiplier = sdkScale;
        } else if (multiplier !== 3) {
            multiplier = highwayScale;
        }

        const segmentKm = (rawLength * multiplier) / 1000;
        const segmentSpeed = multiplier === 3 ? speeds.city : speeds.highway;

        totalKm += segmentKm;
        totalHours += segmentKm / segmentSpeed;

        const idx = (i + 1) * 2;
        cache[idx] = totalKm;
        cache[idx + 1] = totalHours;
    }

    return cache;
}
