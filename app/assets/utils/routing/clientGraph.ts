const { settings } = useSettings();

export async function loadGraph() {
    const [graphRes, geometryRes] = await Promise.all([
        fetch(`/data/${settings.value.selectedGame}/roadnetwork/graph.bin`),
        fetch(`/data/${settings.value.selectedGame}/roadnetwork/geometry.bin`),
    ]);

    return {
        graphBuffer: await graphRes.arrayBuffer(),
        geometryBuffer: await geometryRes.arrayBuffer(),
    };
}
