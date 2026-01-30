function OpenSimCard() {
  const card = document.getElementById("card");
  card.innerHTML = `
    <h3 class="text-center pb-4 lg:text-2xl md:text-xl text-lg md:mt-0.5 text-[#00ffff] lg:mt-1">
      Upload New Sim
    </h3>
    <form id="uploadSim" class="dialog flex flex-col gap-1 md:gap-2 lg:gap-3">
      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">IMSI</legend>
        <input
          type="text"
          id="imsi"
          class="input-autofill input w-full placeholder:text-black text-black border rounded py-2 px-2 bg-white border-accent focus:border-2 focus:ring-primary"
          name="imsi"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">ICCID</legend>
        <input
          type="text"
          id="iccid"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          name="iccid"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">MSISDN</legend>
        <input
          type="text"
          id="msisdn"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          name="msisdn"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">LPA</legend>
        <input
          type="text"
          id="lpa"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          name="lpa"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">Account</legend>
        <input
          type="text"
          id="account"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          name="account"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">Type</legend>
        <select
          id="type"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          name="type"
          required
          >
          <option value="" disabled selected>Select Sim Type</option>
          <option value="e-sim">E-Sim</option>
          <option value="p-sim">P-Sim</option>
        </select>
      </fieldset>

      <div class="mt-2">
        <span class="block w-full rounded-md shadow-sm">
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md opacity-90 hover:opacity-100 text-black bg-[#00ffff] cursor-pointer"
            id="submitBtn"
          >
            Upload
          </button>
        </span>
      </div>
    </form>
  `;

  const form = document.getElementById("uploadSim");
  const imsi = document.getElementById("imsi");
  const iccid = document.getElementById("iccid");
  const msisdn = document.getElementById("msisdn");
  const lpa = document.getElementById("lpa");
  const account = document.getElementById("account");
  const type = document.getElementById("type");
  const btn = document.getElementById("submitBtn");
  const closeBtn = document.getElementById("close-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      btn.innerText = "";
      btn.innerHTML = `<span class="loading loading-spinner loading-sm"></span>`;

      const response = await fetch("/sim/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imsi: imsi.value.trim(),
          iccid: iccid.value.trim(),
          msisdn: msisdn.value.trim(),
          lpa: lpa.value.trim(),
          account: account.value.trim(),
          type: type.value.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Error uploading sim", "error");
        return;
      }

      showToast("Sim uploaded successfully");
      closeBtn.click();
      console.log(data);
    } catch (err) {
      showToast("Something went wrong", "error");
      console.error(err);
    } finally {
      btn.innerText = "Upload";
    }
  });
}

document.getElementById("add-sim").addEventListener("click", () => {
  document.getElementById("prod_modal").showModal();
  OpenSimCard()
});

function openProductModal(product) {
  const modal = document.getElementById("prod-modal");
  const titleEl = document.getElementById("modal-title");
  const contentEl = document.getElementById("modal-content");

  titleEl.textContent = product.title;
  contentEl.innerHTML = `
    <strong>SKU:</strong> ${product.sku}<br>
    <strong>Price:</strong> $${product.price}<br>
    <strong>Stock:</strong> ${product.stock}
  `;

  modal.showModal();
}