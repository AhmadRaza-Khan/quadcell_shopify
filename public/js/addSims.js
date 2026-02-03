function OpenBulkOperationCard() {
  const card = document.getElementById("card");
  card.innerHTML = `
    <h3 class="text-center pb-4 lg:text-2xl md:text-xl text-lg md:mt-0.5 text-[#00ffff] lg:mt-1">
      Upload New Sims
    </h3>
    <form id="importForm" class="dialog flex flex-col gap-1 md:gap-2 lg:gap-3">
      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">Sims Excel File</legend>
        <input
          type="file" 
          id="excel"
          accept=".xlsx"
          class="input-autofill input w-full placeholder:text-black text-black border rounded py-2 px-2 bg-white border-accent focus:border-2 focus:ring-primary"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">QR ZIP file</legend>
        <input
          type="file"
          id="zip" 
          accept=".zip"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-[#00ffff] p-0">Password</legend>
        <input
          type="password" 
          id="password"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          required
        />
      </fieldset>

      <div class="mt-2">
        <span class="block w-full rounded-md shadow-sm">
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md opacity-90 hover:opacity-100 text-black bg-[#00ffff] cursor-pointer"
            id="submitBtn"
          >
            Import Sims
          </button>
        </span>
      </div>
    </form>
  `;


  const form = document.getElementById('importForm');
  const closeBtn = document.getElementById("close-btn");

    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const excelFile = document.getElementById('excel').files[0];
    const zipFile = document.getElementById('zip').files[0];
    const password = document.getElementById('password').value;

    if (!excelFile || !zipFile || !password) {
        alert('All fields are required');
        return;
    }

    const formData = new FormData();
    formData.append('excel', excelFile);
    formData.append('zip', zipFile);
    formData.append('password', password);

    try {
        btn.innerText = "";
        btn.innerHTML = `<span class="loading loading-spinner loading-sm"></span>`;
        const res = await fetch('/sim/import-sims', {
        method: 'POST',
        body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
        showToast(data.message || "Error uploading sims", "error");
        return;
        }

        showToast("Sims uploaded successfully");
        closeBtn.click();
    } catch (err) {
        console.error(err);
        showToast("Failed to upload sims", "error");
    } finally {
      btn.innerText = "Upload";
    }
    });

}

document.getElementById("add-sims").addEventListener("click", () => {
  document.getElementById("prod_modal").showModal();
  OpenBulkOperationCard()
});