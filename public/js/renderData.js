  function renderData(tab, data) {
    container.innerHTML = "";

    const capitalize = (val) => typeof val === "string" ? val.charAt(0).toUpperCase() + val.slice(1) : val;

    let headers = [];
    let rows = [];
    let headingText = "";

    // Orders
    if (["Today", "All"].includes(tab)) {
      const orders = data ?? [];
      if (!orders.length) {
        container.innerHTML = `
          <div class="h-full w-full">
            <h2 class="text-xl text-[#00ffff] text-center font-bold mb-4">${tab}</h2>
            <p class="text-center mx-auto mt-32">No ${tab}</p>
          <div>
        `;
        return;
      }
      headingText = `${tab} Orders`;
      headers.push("#", ...Orders.headers.map(capitalize));
      rows = orders.map((order, idx) => [
        idx + 1,
        ...Orders.headers.map(h => order[h] ?? "")
      ]);
    }

    // Sims
    if (["E-Sims", "P-Sims"].includes(tab)) {
      const sims = data?? [];
      if (!sims.length) {
        container.innerHTML = `
          <div class="h-full w-full">
            <h2 class="text-xl text-[#00ffff] text-center font-bold mb-4">${tab}</h2>
            <p class="text-center mx-auto mt-32">No item ${tab}</p>
          <div>
        `;
        return;
      }
      headingText = `${tab}`;
      headers.push("#", ...Sim.headers.map(capitalize));
      rows = sims.map((sim, idx) => [
        idx + 1,
        ...Sim.headers.map(h => sim[h] ?? "")
      ]);
    }

    // Products
    if (["IMSI TYPE 45400", "IMSI TYPE 45407"].includes(tab)) {
      const products = data.products ?? [];
      if (!products.length) {
        container.innerHTML = `
          <div class="h-full w-full">
            <h2 class="text-xl text-[#00ffff] text-center font-bold mb-4">${tab}</h2>
            <p class="text-center mx-auto mt-32">No ${tab}</p>
          <div>
        `;
        return;
      }
      headingText = `${tab}`;
      headers.push("#", ...Products.headers.map(capitalize));
      rows = products.map((product, idx) => [
        idx + 1,
        ...Products.headers.map(h => product[h] ?? "")
      ]);
    }

    const heading = document.createElement("h2");
    heading.className = "text-xl font-semibold mb-4 text-center text-accent";
    heading.textContent = headingText;
    container.appendChild(heading);
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "overflow-x-auto";
    const table = document.createElement("table");
    table.className = "table table-xs";
    const thead = document.createElement("thead");
    thead.classList.add("text-accent")
    const headRow = document.createElement("tr");
    headers.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    const tbody = document.createElement("tbody");
    rows.forEach(row => {
      const tr = document.createElement("tr");

      row.forEach(col => {
        const td = document.createElement("td");
        td.textContent = col;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
  }