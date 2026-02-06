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
        <div style="background:#fff;padding:28px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);">
        
        <h3 style="margin:0 0 6px;">${data.name}</h3>
        <p style="color:#64748b;margin:0 0 20px;">${data.description}</p>

        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
          <span style="padding:0px 14px;border-radius:999px;background:#ecfeff;color:#0e7490;font-weight:600;">
            ${data.validity !== "0" ? "Active" : "Inactive"}
          </span>
          <span style="color:#475569;">
            Coverage: <strong>${data.coverage}</strong>
          </span>
          <span style="color:#475569;">
            Lifecycle: <strong>${data.lifeCycle}</strong>
          </span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;">
          <div style="background:#f8fafc;padding:16px;border-radius:12px;">
            <div style="font-size:13px;color:#64748b;">Total Data</div>
            <div style="font-weight:700;font-size:18px;">${data.total}</div>
          </div>
          <div style="background:#f8fafc;padding:16px;border-radius:12px;">
            <div style="font-size:13px;color:#64748b;">Used</div>
            <div style="font-weight:700;font-size:18px;">${data.consumedQuota}</div>
          </div>
          <div style="background:#f8fafc;padding:16px;border-radius:12px;">
            <div style="font-size:13px;color:#64748b;">Remaining</div>
            <div style="font-weight:700;font-size:18px;">${data.remainingQuota}</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0;color:#64748b;">Subscription Date</td>
            <td style="padding:10px 0;font-weight:600;">${formatDate(data.effTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b;">Subscription Expiry</td>
            <td style="padding:10px 0;font-weight:600;">${formatDate(data.expiryTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b;">Plan Effective Since</td>
            <td style="padding:10px 0;font-weight:600;">${formatDate(data.planEffTime)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#64748b;">Plan Expiry</td>
            <td style="padding:10px 0;font-weight:600;">${formatDate(data.planExpTime)}</td>
          </tr>
        </table>
      </div>

      <div style="background:#f8fafc;padding:24px;border-radius:16px;text-align:center;">
        <h5 style="margin-top:0;">eSIM QR Code</h5>
        <img src="${data.qr}"
             style="max-width:260px;width:100%;border-radius:12px;box-shadow:0 6px 16px rgba(0,0,0,.12); margin: 34px 0px;" />
        <div style="display:flex; align-items: center; justify-content: space-between;">
            <button id="del-sub" class="btn btn-neutral rounded" onClick="deleteSub('${data.id}')">Delete Profile</button>
            <button id="del-pack" class="btn btn-neutral rounded" onClick="deletePlan('${data.id}')">Delete Plan</button>
        </div>
      </div>
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
    await fetch(`/subscriber/delete-pack/${id}`, {
     method: "DELETE",
    })
   } catch (error) {
    console.log(error)
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
    if(response.ok){ document.getElementById("cls-btn").click() }
   } catch (error) {
    console.log(error)
   }
}