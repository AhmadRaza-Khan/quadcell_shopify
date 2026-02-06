function OpenSubscriber(sub) {
  const card = document.getElementById("main");
     function formatDate(v) {
    if (!v) return "—";
    return `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)} ${v.slice(8,10)}:${v.slice(10,12)}`;
  }
    (async function () {
        try {
            card.innerHTML = `<div class="flex items-center justify-center">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-solid border-gray-200 border-t-[#00ffff]"></div>
            </div>
            `
            const resp = await fetch(`/subscriber/${sub.customerId}`)
            const data = await resp.json();

            card.innerHTML = `
              ${
                data.packCode ? 
                `<div style="background:black;padding:28px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);">
        
        <h3 style="margin:0 0 6px;">${data.name}</h3>
        <p style="color:#fff;margin:0 0 20px;">${data.description}</p>

        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
          <span style="border-radius:999px;background:black;color:#fff;font-weight:600;">
            ${data.validity !== "0" ? "Active" : "Inactive"}
          </span>
          <span style="color:#fff;">
            Coverage: <strong>${data.coverage}</strong>
          </span>
          <span style="color:#fff;">
            Lifecycle: <strong>${data.lifeCycle}</strong>
          </span>
        </div>

        <div style="display:flex;justify-center;items-center;margin-bottom:28px;gap:20px">
          <div style="background:black;border-radius:12px;">
            <div style="font-size:13px;color:#fff;">Total Data</div>
            <div style="font-weight:700;color:#fff;font-size:18px;">${data.total}</div>
          </div>
          <div style="background:black;border-radius:12px;">
            <div style="font-size:13px;color:#fff;">Used</div>
            <div style="font-weight:700;color:#fff;font-size:18px;">${data.consumedQuota}</div>
          </div>
          <div style="background:black;border-radius:12px;">
            <div style="font-size:13px;color:#fff;">Remaining</div>
            <div style="font-weight:700;color:#fff;font-size:18px;">${data.remainingQuota}</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#fff;">Subscription Date</td>
            <td style="padding:10px 0;color:#fff;font-weight:600;">${formatDate(data.effTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#fff;">Subscription Expiry</td>
            <td style="padding:10px 0;color:#fff;font-weight:600;">${formatDate(data.expiryTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#fff;">Plan Effective Since</td>
            <td style="padding:10px 0;color:#fff;font-weight:600;">${formatDate(data.planEffTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#fff;">Plan Expiry</td>
            <td style="padding:10px 0;color:#fff;font-weight:600;">${formatDate(data.planExpTime)}</td>
          </tr>
        </table>
        <div style="display:flex; align-items: center; justify-content: space-between;">
            <button id="del-sub" class="btn bg-[#00ffff] text-black hover:bg-black hover:text-[#00ffff] btn-outline rounded" onClick="deleteSub('${data.id}')">Delete Profile</button>
            <button id="del-pack" class="btn bg-[#00ffff] text-black hover:bg-black btn-outline hover:text-[#00ffff] rounded" onClick="deletePlan('${data.id}')">Delete Plan</button>
        </div>
      </div>
`:
`
<span style="text-align:center;">No plan active for this subscirber!</span>
`
              }
            `
        } catch (error) {
            console.log(error)
        }
    })();
}

async function deletePlan(id){
    const delPack = document.getElementById("del-pack");
    delPack.innerText = "Loading...";
   try {
    const response = response = await fetch(`/subscriber/delete-pack/${id}`, {
     method: "DELETE",
    })
    const data = await response.json();
    if(data.success){
      showToast("Plan deleted successfully", "success")
    }
   } catch (error) {
    console.log(error)
    showToast("Failed to delete plan!", "error");
   } finally {
    delPack.innerText = "Delete Plan";
   }
}

async function deleteSub(id) {
    try {
    document.getElementById("del-sub").innerText = "Loading...";
    const response = await fetch(`/subscriber/del-sub/${id}`, {
     method: "DELETE",
    })
    const data = await response.json();
    if(data.success){ document.getElementById("cls-btn").click() }
   } catch (error) {
    console.log(error)
    showToast("Failer to delete subscriber", "error");
   }
}