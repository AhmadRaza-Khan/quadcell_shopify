function OpenSubscriber(sub) {
  const card = document.getElementById("card");
  card.innerHTML = `
      <div id="inner-card" class="card card-side bg-base-100 shadow-sm"></div>
    
  `;
      function parseDate(expiry) {
      const year = Number(expiry.slice(0, 4));
      const month = Number(expiry.slice(4, 6)) - 1;
      const day = Number(expiry.slice(6, 8));
      const hour = Number(expiry.slice(8, 10));
      const min = Number(expiry.slice(10, 12));
      const sec = Number(expiry.slice(12, 14));

      return new Date(year, month, day, hour, min, sec);
    }
    const innerCard = document.getElementById("inner-card");
    (async function () {
        try {
            innerCard.innerHTML = `<div class="flex justify-center items-center h-64">
                <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                `
            const resp = await fetch(`/subscriber/${sub.customerId}`)
            const data = await resp.json();
            console.log(data)
            innerCard.innerHTML = `
                    <figure>
                        <img class="h-20"
                        src="https://api.m-mobile.net/uploads/QR/8985207220057816325.png"
                        alt="qr" />
                    </figure>
                    <div class="card-body">
                        <div class="w-full gap-[100px] text-white flex justify-between">
                        <!-- Left side -->
                        <div class="flex-1 space-y-2">
                            <h4 class="text-2xl font-bold text-[#00ffff]">devkraft1@gmail.com</h4>
                            <p>Imsi: 454070059289775</p>
                            <p>Iccid: 8985207220057816325</p>
                            <p>Subscription Start: 05 December, 2025</p>
                            <p>Expiry: 20501231235959</p>
                        </div>

                        <!-- Right side -->
                        <div class="flex-1 space-y-2">
                            <p>Plan Code: 820025</p>
                            <p>Validity: 1 Day</p>
                            <p>Plan Start: 25 Dec, 2025</p>
                            <p>Plan Expiry: 31 Dec, 2025</p>
                        </div>
                        </div>

                        <div class="card-actions justify-end">
                        <button class="btn btn-primary btn-xs">Delete Profile</button>
                        <button class="btn btn-primary btn-xs">Delete Plan</button>
                        </div>
                    </div>
            `
        } catch (error) {
            console.log(error)
        }
    })();
}

async function deletePlan(data){
   try {
    await fetch(`/subscriber/delelte-pack`, {
     method: "DELETE",
     body: JSON.stringify(data)
    })
   } catch (error) {
    console.log(error)
   }
}

async function deleteSub(imsi) {
    try {
    await fetch(`/subscriber/del-sub`, {
     method: "DELETE",
     body: JSON.stringify(data)
    })
   } catch (error) {
    console.log(error)
   }
}