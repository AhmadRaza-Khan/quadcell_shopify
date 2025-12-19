async function reRenderData(tab) {
        setLoading(true, container)
    try {
        const url = tab == "Synced Products"? "get-synced" : "get-unsynced";
        const res = await fetch(`/product/${url}`);
        const freshData = await res.json();
        renderData("Non Synced Products", freshData);
    } catch (err) {
        console.error("Error refreshing products:", err);
    } finally {
        setLoading(false, container)
    }
}