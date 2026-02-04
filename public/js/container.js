const showBtn = document.getElementById("show-btn");
const sidebar = document.getElementById("sidebarcomp");

showBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  setLoading(true, container)
  const dataMap = {
    "Subscribers": "/subscriber/all-sub",
    "E-Sims": "/sim/e-sims",
    "P-Sims": "/sim/p-sims",
    "IMSI TYPE 45400": "/product/imsi-45400",
    "IMSI TYPE 45407": "/product/imsi-45407"
  };

  const links = document.querySelectorAll("ul.menu li ul li a")
  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      sidebar.classList.add("hidden");
      setLoading(true, container);
      
      links.forEach(l => l.classList.remove("bg-[#00ffff]", "text-black"));
      e.target.classList.add("bg-[#00ffff]", "text-black");

      let text = e.target.textContent.trim();
      if (text === "All") {
        const details = e.target.closest("details");
        const summaryText = details?.querySelector("summary")?.textContent || "";
        if (summaryText.includes("Sims")) text = "E-Sims";
      }

      const url = dataMap[text];
      if (!url) return;

      try {
        const res = await fetch(url);
        const data = await res.json();
        renderData(text, data);
      } catch (err) {
        console.error("Error fetching data:", err);
        container.innerHTML = `<p class="text-red-500">Error loading data.</p>`;
      } finally {
        setLoading(false, container);
      }
    });
  });

  (async function loadDefault() {
    setLoading(true, container)
    try {
      const res = await fetch(dataMap["Subscribers"]);
      const data = await res.json();
      renderData("Subscribers", data);
    } catch (err) {
      console.error("Error loading default data:", err);
      container.innerHTML = `<p class="text-red-500">Error loading default Subscribers.</p>`;
    } finally {
      setLoading(false, container)
    }
  })();
});
