async function reRenderData(tab) {
        setLoading(true, container)
    try {
        const url = tab == "IMSI TYPE 45400"? "get-imsi-45400" : "get-imsi-45407";
        const res = await fetch(`/product/${url}`);
        const freshData = await res.json();
        renderData("IMSI TYPE 45407", freshData);
    } catch (err) {
        console.error("Error refreshing products:", err);
    } finally {
        setLoading(false, container)
    }
}