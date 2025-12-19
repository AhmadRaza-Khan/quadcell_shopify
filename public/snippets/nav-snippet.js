const navbar = `
<div class="flex-1">
    <a class="text-accent font-bold text-sm md:text-md lg:text-2xl xl:3xl 2xl:4xl">Third Party API - Shopify</a>
  </div>
  <div id="logout-container" class="flex-none">
    <button id="btn-logout" class="btn text-accent bg-base-300 border border-accent hover:bg-accent hover:border-black hover:border-2 hover:text-black">Logout</button>
  </div>
`;

const wrapper = document.createElement("div");
wrapper.classList.add("navbar", "shadow-sm", "bg-base-300", "text-primary-content");
wrapper.innerHTML = navbar;
document.body.prepend(wrapper);
