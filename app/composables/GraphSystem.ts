import RBush from "rbush";
import { loadGraph } from "~/assets/utils/routing/clientGraph";
import { haversine } from "~/assets/utils/routing/helpers";

interface NodeIndexItem {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    id: number;
    coord: [number, number];
}

const adjacency = new Map<number, any>();
const nodeCoords = new Map<number, [number, number]>();
const nodeTree = new RBush<NodeIndexItem>();

const loading = ref(true);
const progress = ref(0);

export function useGraphSystem() {
    let rawNodesForWorker: any[] = [];

    let workerGraphBuffer: ArrayBuffer | null = null;
    let workerGeometryBuffer: ArrayBuffer | null = null;

    const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    function getClosestNodes(
        target: [number, number],
        limit = 5,
        radiusDeg = 0.02,
    ): number[] {
        const candidates = nodeTree.search({
            minX: target[0] - radiusDeg,
            minY: target[1] - radiusDeg,
            maxX: target[0] + radiusDeg,
            maxY: target[1] + radiusDeg,
        });
        if (candidates.length === 0) return [];
        return candidates
            .map((item) => ({
                id: item.id,
                dist: haversine(target, item.coord),
            }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, limit)
            .map((c) => c.id);
    }

    const initializeGraphData = async () => {
        loading.value = true;
        progress.value = 0;

        const ghostInterval = setInterval(() => {
            if (progress.value < 85)
                progress.value += Math.floor(Math.random() * 3) + 1;
        }, 200);

        try {
            const { graphBuffer, geometryBuffer } = await loadGraph();

            workerGraphBuffer = graphBuffer;
            workerGeometryBuffer = geometryBuffer;

            const graphF32 = new Float32Array(graphBuffer);
            const geometryF32 = new Float32Array(geometryBuffer);

            adjacency.clear();
            nodeCoords.clear();
            nodeTree.clear();

            const uniqueNodes = new Map<
                number,
                { id: number; lng: number; lat: number }
            >();

            // Stride is 8: [u, v, weight, hIn, hOut, isFerry, startIndex, pointCount]
            for (let i = 0; i < graphF32.length; i += 9) {
                const u = graphF32[i]!;
                const v = graphF32[i + 1]!;
                const weight = graphF32[i + 2];
                const startIndex = graphF32[i + 7]!;
                const pointCount = graphF32[i + 8]!;

                if (!adjacency.has(u)) adjacency.set(u, []);
                adjacency.get(u)!.push({
                    to: v,
                    weight: weight,
                });

                if (!uniqueNodes.has(u)) {
                    const lng = geometryF32[startIndex]!;
                    const lat = geometryF32[startIndex + 1]!;
                    uniqueNodes.set(u, { id: u, lng, lat });
                }

                if (!uniqueNodes.has(v)) {
                    const lastIdx = startIndex + (pointCount - 1) * 2;
                    const lng = geometryF32[lastIdx]!;
                    const lat = geometryF32[lastIdx + 1]!;
                    uniqueNodes.set(v, { id: v, lng, lat });
                }
            }

            rawNodesForWorker = Array.from(uniqueNodes.values()).map((n) => [
                n.id,
                [n.lng, n.lat],
            ]);

            const items: NodeIndexItem[] = [];
            for (const node of uniqueNodes.values()) {
                nodeCoords.set(node.id, [node.lng, node.lat]);
                items.push({
                    minX: node.lng,
                    minY: node.lat,
                    maxX: node.lng,
                    maxY: node.lat,
                    id: node.id,
                    coord: [node.lng, node.lat],
                });
            }

            nodeTree.load(items);

            progress.value = 100;
            await sleep(200);
        } catch (err) {
            console.error("Loading Graph Failed", err);
        } finally {
            clearInterval(ghostInterval);
            setTimeout(() => {
                loading.value = false;
            }, 500);
        }

        return {
            nodes: rawNodesForWorker,
            graphBuffer: workerGraphBuffer,
            geometryBuffer: workerGeometryBuffer,
        };
    };

    return {
        loading,
        progress,
        adjacency,
        nodeCoords,
        getClosestNodes,
        initializeGraphData,
    };
}
