function showProduct(prod, tab) {
  const card = document.getElementById("card");
  card.innerHTML = `
    <h3 class="text-center pb-4 lg:text-2xl md:text-xl text-lg md:mt-0.5 text-primary lg:mt-1">
      Update Product
    </h3>
    <form id="updateProductForm" class="dialog flex flex-col gap-1 md:gap-2 lg:gap-3">
      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Title</legend>
        <input
          type="text"
          id="title"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          value="${prod.title}"
          name="title"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Description</legend>
        <textarea
          id="description"
          class="input-autofill text-wrap input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary resize-none overflow-hidden"
          name="description"
          style="min-height: 4.5rem;"
          required
        >${prod.description}</textarea>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Price</legend>
        <input
          type="number"
          id="price"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          value="${prod.price}"
          name="price"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Stock</legend>
        <input
          type="number"
          id="stock"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          value="${prod.stock}"
          name="stock"
          required
        />
      </fieldset>

      <div class="mt-2">
        <span class="block w-full rounded-md shadow-sm">
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md opacity-90 hover:opacity-100 bg-primary text-primary-content cursor-pointer"
            id="submitBtn"
          >
            Update
          </button>
        </span>
      </div>
    </form>
  `;

  const form = document.getElementById("updateProductForm");
  const sku = prod.sku;
  const title = document.getElementById("title");
  const description = document.getElementById("description");
  const price = document.getElementById("price");
  const stock = document.getElementById("stock");
  const btn = document.getElementById("submitBtn");
  const closeBtn = document.getElementById("close-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      btn.innerText = "";
      btn.innerHTML = `<span class="loading loading-spinner loading-sm"></span>`;

      const response = await fetch("/product/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          title: title.value.trim(),
          description: description.value.trim(),
          price: Number(price.value),
          stock: Number(stock.value),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Error updating product", "error");
        return;
      }

      showToast("Product updated successfully");
      closeBtn.click();
      reRenderData(tab)
    } catch (err) {
      showToast("Something went wrong", "error");
      console.error(err);
    } finally {
      btn.innerText = "Update";
    }
  });
}

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