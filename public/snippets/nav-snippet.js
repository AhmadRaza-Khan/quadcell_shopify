const navbar = `
<div class="flex-1">
    <a><img style="height: 50px;" src="/snippets/logo.png" alt="logo" ></a>
  </div>
  <div id="logout-container" class="flex-none">
    <button id="btn-logout" class="btn btn-xs sm:btn-xs text-[#00ffff] rounded-sm md:btn-sm lg:btn-md xl:btn-md bg-base border border-[#00ffff] hover:bg-[#00ffff] hover:text-black hover:border-black hover:scale-110 transition-all duration-300 ease-in-out">Logout</button>
  </div>
`;

const wrapper = document.createElement("div");
wrapper.classList.add("navbar", "shadow-[#00ffff]", "shadow-sm", "text-[#00ffff]");
wrapper.innerHTML = navbar;
document.body.prepend(wrapper);

