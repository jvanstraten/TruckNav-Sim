let adjacency: Map<number, any[]> | null = null;
let nodeCoords: Map<number, [number, number]> | null = null;

import {
    buildRouteStatsCache,
    calculateRoute,
    type SimpleCityNode,
} from "~/assets/utils/routing/algorithm";

let cityNodes: SimpleCityNode[] | null = null;
let geometryF32: Float32Array | null = null;

self.onmessage = async (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === "INIT_GRAPH") {
        const { nodes, graphBuffer, geometryBuffer, cities } = payload;

        geometryF32 = new Float32Array(geometryBuffer);
        const graphF32 = new Float32Array(graphBuffer);

        nodeCoords = new Map(nodes);
        adjacency = new Map();
        if (cities) cityNodes = cities;

        for (let i = 0; i < graphF32.length; i += 9) {
            const u = graphF32[i]!;
            const v = graphF32[i + 1]!;
            const w = graphF32[i + 2]!;
            const hIn = graphF32[i + 3]!;
            const hOut = graphF32[i + 4]!;
            const isFerry = graphF32[i + 5] === 1;
            const requiredDlc = graphF32[i + 6];
            const startIndex = graphF32[i + 7]!;
            const pointCount = graphF32[i + 8]!;

            if (!adjacency.has(u)) adjacency.set(u, []);
            adjacency.get(u)!.push({
                to: v,
                weight: w,
                hIn,
                hOut,
                isFerry,
                requiredDlc,
                startIndex,
                pointCount,
            });
        }
        self.postMessage({ type: "READY" });
    }

    if (type === "CALC_ROUTE") {
        if (!adjacency || !nodeCoords || !geometryF32) return;

        const {
            startId,
            possibleEnds,
            heading,
            startType,
            targetCoords,
            ownedDlcs,
            selectedGame,
            sdkScale,
            avgSpeed,
        } = payload;

        const result = calculateRoute(
            startId,
            new Set(possibleEnds),
            heading,
            adjacency,
            nodeCoords,
            startType,
            ownedDlcs,
            targetCoords,
        );

        if (result && result.path && result.nodeSequence) {
            let fullPath = [...result.path];
            let displayPath: [number, number][] = [];

            for (let i = 0; i < result.nodeSequence.length - 1; i++) {
                const u = result.nodeSequence[i]!;
                const v = result.nodeSequence[i + 1]!;

                const edge = adjacency.get(u)?.find((e) => e.to === v);

                if (edge && edge.startIndex !== undefined) {
                    for (let p = 0; p < edge.pointCount; p++) {
                        const lng = geometryF32[edge.startIndex + p * 2]!;
                        const lat = geometryF32[edge.startIndex + p * 2 + 1]!;

                        if (
                            displayPath.length > 0 &&
                            displayPath[displayPath.length - 1]![0] === lng &&
                            displayPath[displayPath.length - 1]![1] === lat
                        ) {
                            continue;
                        }
                        displayPath.push([lng, lat]);
                    }
                } else {
                    displayPath.push(fullPath[i]!);
                }
            }
            displayPath.push(fullPath[fullPath.length - 1]!);

            const statsCache = buildRouteStatsCache(
                displayPath,
                cityNodes,
                selectedGame,
                sdkScale,
                avgSpeed,
            );

            self.postMessage(
                {
                    type: "RESULT",
                    payload: {
                        ...result,
                        rawPath: displayPath,
                        displayPath: displayPath,
                        stats: statsCache,
                    },
                },
                [statsCache.buffer],
            );
        } else {
            self.postMessage({ type: "RESULT", payload: null });
        }
    }
};
