async function test() {
    try {
        const res = await fetch("http://localhost:3001/api/search?q=%E7%81%B5%E5%B1%B1&type=Book", {
            headers: { "x-admin-password": "admin888" }
        });
        const data = await res.json();
        console.log("SEARCH RESULTS:", JSON.stringify(data.results, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
