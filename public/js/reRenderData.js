async function reRenderData() {
        setLoading(true, container)
    try {
        const res = await fetch(`/subscriber/all-sub`);
        const freshData = await res.json();
        renderData("Subscribers", freshData);
    } catch (err) {
        console.error("Error refreshing subscribers:", err);
    } finally {
        setLoading(false, container)
    }
}