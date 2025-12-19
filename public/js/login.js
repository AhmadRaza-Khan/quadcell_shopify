
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const btn = document.getElementById("submitBtn");

  const errorEmail = document.getElementById("errorEmail");
  const errorPassword = document.getElementById("errorPassword");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{4,}$/;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;

    if (!emailRegex.test(emailInput.value.trim())) {
      errorEmail.classList.remove("hidden");
      valid = false;
    } else {
      errorEmail.classList.add("hidden");
    }

    if (!passwordRegex.test(passwordInput.value.trim())) {
      errorPassword.classList.remove("hidden");
      valid = false;
    } else {
      errorPassword.classList.add("hidden");
    }

    if (!valid) return;

    try {
      btn.innerText = "";
      btn.innerHTML = `<span class="loading loading-spinner loading-sm"></span>`;
      const response = await fetch("/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value.trim(),
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        const err = await response.json();
        showToast("Login failed: " + (err.message || "Unknown error"), "error");
        return;
      }
      showToast("Login successful!");
      window.location.href = "/"
    } catch (err) {
      showToast("Invalid Credentials!", "error")
    } finally {
      btn.innerText = "Submit";
    }
  });
});
