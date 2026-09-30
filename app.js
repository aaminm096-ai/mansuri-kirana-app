const KEY = "mansuri_kirana_final_v1";
const OLD_KEY = "mansuri_kirana_data_v1";

const defaults = {
  shopName: "MANSURI KIRANA",
  ownerName: "AALAM MANSURI",
  mobile: "9754083323",
  address: "Kesur",

  language: "hi",
  billNo: 1,

  footer: "आपका भरोसा ही हमारी सबसे बड़ी पूंजी है। ❤️",

  whatsappMessage:
    "धन्यवाद! MANSURI KIRANA पर खरीदारी के लिए आपका धन्यवाद।",

  smsMessage:
    "MANSURI KIRANA - धन्यवाद।",

  udhariMessage:
    "आपकी उधारी की रसीद। कृपया समय पर भुगतान करें।",

  jamaMessage:
    "आपकी जमा राशि की रसीद। धन्यवाद।",

  customerLine1:
    "आपका भरोसा ही हमारी सबसे बड़ी पूंजी है। ❤️",

  customerLine2:
    "सही सामान, सही हिसाब और बेहतर सेवा—हर बार आपका स्वागत है।"
};


let db = loadDB();

let selectedCustomerId = null;
let selectedAccountId = null;
let lastBill = null;


/* =========================
   DATABASE
========================= */

function loadDB() {

  try {

    let data =
      JSON.parse(localStorage.getItem(KEY) || "null");

    if (data) {
      return normalize(data);
    }

    let oldData =
      JSON.parse(localStorage.getItem(OLD_KEY) || "null");

    if (oldData) {
      return normalize(oldData);
    }

  } catch (error) {

    console.log("Database load error:", error);

  }

  return {

    settings: { ...defaults },

    customers: [],

    products: [],

    bills: [],

    transactions: []

  };
}


function normalize(data) {

  return {

    settings: {
      ...defaults,
      ...(data.settings || {})
    },

    customers:
      Array.isArray(data.customers)
        ? data.customers
        : [],

    products:
      Array.isArray(data.products)
        ? data.products
        : [],

    bills:
      Array.isArray(data.bills)
        ? data.bills
        : [],

    transactions:
      Array.isArray(data.transactions)
        ? data.transactions
        : []

  };

}


function saveDB() {

  localStorage.setItem(
    KEY,
    JSON.stringify(db)
  );

}


/* =========================
   HELPERS
========================= */

function id() {

  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 7)
  );

}


function money(value) {

  return (
    "₹" +
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )
  );

}


function esc(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, function (m) {

      return {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      }[m];

    });

}


function toast(message) {

  const element =
    document.getElementById("toast");

  if (!element) return;

  element.textContent = message;

  element.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(function () {

      element.style.display = "none";

    }, 2200);

}


function now() {

  return new Date().toLocaleString(
    "hi-IN",
    {
      dateStyle: "short",
      timeStyle: "short"
    }
  );

}


function today() {

  const element =
    document.getElementById("today");

  if (!element) return;

  element.textContent =
    new Date().toLocaleDateString(
      "hi-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

}


/* =========================
   HEADER
========================= */

function applyHeader() {

  const s = db.settings;

  const brandName =
    document.getElementById("brandName");

  const brandOwner =
    document.getElementById("brandOwner");

  const homeShop =
    document.getElementById("homeShop");

  const homeOwner =
    document.getElementById("homeOwner");

  if (brandName) {

    brandName.textContent =
      s.shopName;

  }

  if (brandOwner) {

    brandOwner.textContent =
      s.ownerName +
      " • " +
      s.mobile;

  }

  if (homeShop) {

    homeShop.textContent =
      s.shopName;

  }

  if (homeOwner) {

    homeOwner.textContent =
      s.ownerName +
      " • " +
      s.mobile;

  }

}


/* =========================
   SCREEN NAVIGATION
========================= */

function openScreen(name) {

  document
    .querySelectorAll(".screen")
    .forEach(function (screen) {

      screen.classList.remove("active");

    });


  const target =
    document.getElementById(name);

  if (!target) return;

  target.classList.add("active");

  window.scrollTo(0, 0);


  if (name === "bill") {
    initBill();
  }

  if (name === "account") {
    renderAccountCustomers();
  }

  if (name === "saved") {
    renderSaved();
  }

  if (name === "stock") {
    renderStock();
  }

  if (name === "rates") {
    renderRates();
  }

  if (name === "sales") {
    renderSales();
  }

  if (name === "customers") {
    renderCustomers();
  }

  if (name === "ledger") {
    renderLedger();
  }

  if (name === "udhariReport") {
    renderUdhariReport();
  }

  if (name === "jamaReport") {
    renderJamaReport();
  }

  if (name === "stockReport") {
    renderStockReport();
  }

  if (name === "settings") {
    loadSettings();
  }

}


function goHome() {

  openScreen("home");

}


function toggleMenu() {

  const menu =
    document.getElementById("menu");

  if (!menu) return;

  menu.classList.toggle("hidden");

}


/* =========================
   CUSTOMER
========================= */

function getCustomer(customerId) {

  return db.customers.find(
    function (customer) {

      return customer.id === customerId;

    }
  );

}


function customerBalance(customer) {

  return Number(
    customer?.balance || 0
  );

}


function findExistingCustomer(
  name,
  mobile
) {

  name =
    (name || "")
      .trim()
      .toLowerCase();

  mobile =
    (mobile || "")
      .replace(/\D/g, "");


  return db.customers.find(
    function (customer) {

      const sameMobile =
        mobile &&
        customer.mobile === mobile;

      const sameName =
        name &&
        String(customer.name || "")
          .toLowerCase() === name;

      return sameMobile || sameName;

    }
  );

}


function findCustomer(
  name,
  mobile
) {

  name =
    (name || "").trim();

  mobile =
    (mobile || "")
      .replace(/\D/g, "");


  let customer =
    findExistingCustomer(
      name,
      mobile
    );


  if (!customer && name) {

    customer = {

      id: id(),

      name: name,

      mobile: mobile,

      createdAt: Date.now(),

      balance: 0

    };

    db.customers.push(customer);

  }


  if (customer) {

    if (name) {
      customer.name = name;
    }

    if (mobile) {
      customer.mobile = mobile;
    }

  }


  return customer;

}


/* =========================
   BILL
========================= */

function initBill() {

  const customer =
    document.getElementById(
      "billCustomer"
    );

  const mobile =
    document.getElementById(
      "billMobile"
    );

  const paid =
    document.getElementById(
      "billPaid"
    );

  const items =
    document.getElementById(
      "billItems"
    );


  if (customer) {
    customer.value = "";
  }

  if (mobile) {
    mobile.value = "";
  }

  if (paid) {
    paid.value = "0";
  }

  if (items) {

    items.innerHTML = "";

    addProductRow();

  }


  const wa =
    document.getElementById("billWA");

  const sms =
    document.getElementById("billSMS");


  if (wa) {
    wa.disabled = true;
  }

  if (sms) {
    sms.disabled = true;
  }


  calculateBill();

}


function addProductRow() {

  const container =
    document.getElementById(
      "billItems"
    );

  if (!container) return;


  const row =
    document.createElement("div");

  row.className =
    "item-row";


  const options =
    db.products
      .map(function (product) {

        return `
          <option value="${esc(product.id)}">
            ${esc(product.name)}
          </option>
        `;

      })
      .join("");


  row.innerHTML = `

    <div class="item-grid">

      <select
        class="prod"
        onchange="rowProductChanged(this)"
      >

        <option value="">
          सामान चुनें
        </option>

        ${options}

      </select>


      <input
        class="qty"
        type="number"
        min="0"
        step="0.001"
        value="1"
        oninput="calculateBill()"
      >


      <input
        class="rate"
        type="number"
        min="0"
        step="0.01"
        placeholder="रेट"
        oninput="calculateBill()"
      >


      <div class="amount">
        ₹0
      </div>

    </div>


    <div
      class="row"
      style="margin-top:7px"
    >

      <select class="unit">

        <option>Kg</option>

        <option>Gram</option>

        <option>Litre</option>

        <option>Piece</option>

        <option>Packet</option>

        <option>Dozen</option>

      </select>


      <button
        class="remove"
        onclick="
          this.closest('.item-row').remove();
          calculateBill();
        "
      >

        हटाएं

      </button>

    </div>

  `;


  container.appendChild(row);

}


function rowProductChanged(select) {

  const product =
    db.products.find(
      function (p) {

        return p.id === select.value;

      }
    );


  const row =
    select.closest(".item-row");


  if (!row || !product) {

    calculateBill();

    return;

  }


  row.querySelector(".rate").value =
    product.rate;

  row.querySelector(".unit").value =
    product.unit || "Kg";


  calculateBill();

}


function getBillRows() {

  return [

    ...document.querySelectorAll(
      "#billItems .item-row"
    )

  ]

    .map(function (row) {

      const productId =
        row.querySelector(".prod").value;

      const product =
        db.products.find(
          function (p) {

            return p.id === productId;

          }
        );


      const qty =
        Number(
          row.querySelector(".qty").value || 0
        );


      const rate =
        Number(
          row.querySelector(".rate").value || 0
        );


      return {

        productId: productId,

        name:
          product?.name || "",

        qty: qty,

        rate: rate,

        unit:
          row.querySelector(".unit").value,

        amount:
          qty * rate

      };

    })

    .filter(function (item) {

      return (
        item.name &&
        item.qty > 0 &&
        item.rate >= 0
      );

    });

}


function calculateBill() {

  const rows =
    getBillRows();


  const total =
    rows.reduce(
      function (sum, item) {

        return sum + item.amount;

      },
      0
    );


  const name =
    document.getElementById(
      "billCustomer"
    )?.value || "";


  const mobile =
    document.getElementById(
      "billMobile"
    )?.value || "";


  const customer =
    findExistingCustomer(
      name,
      mobile
    );


  const oldBalance =
    customerBalance(customer);


  const paid =
    Math.max(
      0,
      Number(
        document.getElementById(
          "billPaid"
        )?.value || 0
      )
    );


  const newBalance =
    oldBalance +
    total -
    paid;


  const totalElement =
    document.getElementById(
      "billTotal"
    );

  const oldElement =
    document.getElementById(
      "billOld"
    );

  const newElement =
    document.getElementById(
      "billNew"
    );


  if (totalElement) {
    totalElement.textContent =
      money(total);
  }

  if (oldElement) {
    oldElement.textContent =
      money(oldBalance);
  }

  if (newElement) {
    newElement.textContent =
      money(newBalance);
  }


  document
    .querySelectorAll(
      "#billItems .item-row"
    )
    .forEach(function (row) {

      const qty =
        Number(
          row.querySelector(
            ".qty"
          ).value || 0
        );


      const rate =
        Number(
          row.querySelector(
            ".rate"
          ).value || 0
        );


      row.querySelector(
        ".amount"
      ).textContent =
        money(qty * rate);

    });

}


function refreshCustomerSuggestions() {

  const name =
    document.getElementById(
      "billCustomer"
    )?.value
      .toLowerCase()
      .trim() || "";


  const mobile =
    document.getElementById(
      "billMobile"
    )?.value
      .replace(/\D/g, "") || "";


  const list =
    db.customers
      .filter(function (customer) {

        return (

          (
            name &&
            customer.name
              .toLowerCase()
              .includes(name)
          )

          ||

          (
            mobile &&
            String(customer.mobile || "")
              .includes(mobile)
          )

        );

      })
      .slice(0, 5);


  const box =
    document.getElementById(
      "customerSuggestions"
    );


  if (!box) return;


  box.innerHTML =
    list
      .map(function (customer) {

        return `

          <div
            onclick="
              pickBillCustomer('${customer.id}')
            "
          >

            <b>
              ${esc(customer.name)}
            </b>

            <span class="muted">
              ${esc(customer.mobile || "")}
            </span>

            • बाकी
            ${money(customer.balance)}

          </div>

        `;

      })
      .join("");


  calculateBill();

}


function pickBillCustomer(
  customerId
) {

  const customer =
    getCustomer(customerId);

  if (!customer) return;


  document.getElementById(
    "billCustomer"
  ).value =
    customer.name;


  document.getElementById(
    "billMobile"
  ).value =
    customer.mobile || "";


  document.getElementById(
    "customerSuggestions"
  ).innerHTML = "";


  calculateBill();

}


async function chooseContact() {

  try {

    if (
      !("contacts" in navigator) ||
      !navigator.contacts?.select
    ) {

      throw new Error(
        "Contact Picker not supported"
      );

    }


    const contacts =
      await navigator.contacts.select(
        ["name", "tel"],
        {
          multiple: false
        }
      );


    if (
      contacts &&
      contacts.length
    ) {

      const contact =
        contacts[0];


      document.getElementById(
        "billCustomer"
      ).value =
        contact.name?.[0] || "";


      document.getElementById(
        "billMobile"
      ).value =
        (
          contact.tel?.[0] || ""
        )
          .replace(/\D/g, "")
          .slice(-10);


      calculateBill();

    }

  } catch (error) {

    toast(
      "Contact Picker उपलब्ध नहीं है। नंबर हाथ से डालें।"
    );

  }

}


/* =========================
   BILL NUMBER
========================= */

function nextBillNumber() {

  const number =
    Number(
      db.settings.billNo || 1
    );


  db.settings.billNo =
    number + 1;


  saveDB();


  return number;

}


/* =========================
   SAVE BILL
========================= */

function saveBill() {

  const name =
    document.getElementById(
      "billCustomer"
    ).value.trim();


  const mobile =
    document.getElementById(
      "billMobile"
    ).value
      .replace(/\D/g, "");


  const rows =
    getBillRows();


  if (!name) {

    toast(
      "ग्राहक का नाम डालें"
    );

    return;

  }


  if (!rows.length) {

    toast(
      "कम से कम 1 सामान जोड़ें"
    );

    return;

  }


  const total =
    rows.reduce(
      function (sum, item) {

        return sum + item.amount;

      },
      0
    );


  const paid =
    Number(
      document.getElementById(
        "billPaid"
      ).value || 0
    );


  if (paid > total) {

    toast(
      "जमा राशि बिल से ज्यादा नहीं हो सकती"
    );

    return;

  }


  const customer =
    findCustomer(
      name,
      mobile
    );


  if (!customer) {

    toast(
      "ग्राहक सेव नहीं हो पाया"
    );

    return;

  }


  const oldBalance =
    customerBalance(customer);


  const newBalance =
    oldBalance +
    total -
    paid;


  /* STOCK UPDATE */

  rows.forEach(function (item) {

    if (!item.productId) {
      return;
    }


    const product =
      db.products.find(
        function (p) {

          return p.id === item.productId;

        }
      );


    if (product) {

      product.stock =
        Number(product.stock || 0) -
        item.qty;

    }

  });


  const bill = {

    id: id(),

    billNo:
      nextBillNumber(),

    date:
      now(),

    customerId:
      customer.id,

    customerName:
      customer.name,

    mobile:
      customer.mobile || mobile,

    items:
      rows,

    total:
      total,

    oldBalance:
      oldBalance,

    paid:
      paid,

    newBalance:
      newBalance

  };


  customer.balance =
    newBalance;


  db.bills.push(bill);


  /* UDHARI */

  const remaining =
    total - paid;


  if (remaining > 0) {

    db.transactions.push({

      id: id(),

      date:
        bill.date,

      type:
        "udhari",

      customerId:
        customer.id,

      customerName:
        customer.name,

      mobile:
        customer.mobile,

      amount:
        remaining,

      source:
        "bill",

      billId:
        bill.id,

      note:
        "बिल बाकी"

    });

  }


  /* JAMA */

  if (paid > 0) {

    db.transactions.push({

      id: id(),

      date:
        bill.date,

      type:
        "jama",

      customerId:
        customer.id,

      customerName:
        customer.name,

      mobile:
        customer.mobile,

      amount:
        paid,

      source:
        "bill",

      billId:
        bill.id,

      note:
        "बिल में जमा"

    });

  }


  saveDB();


  lastBill =
    bill;


  const message =
    makeBillMessage(
      bill
    );


  const wa =
    document.getElementById(
      "billWA"
    );


  const sms =
    document.getElementById(
      "billSMS"
    );


  if (wa) {

    wa.disabled = false;

    wa.onclick =
      function () {

        shareWhatsApp(
          message,
          bill.mobile
        );

      };

  }


  if (sms) {

    sms.disabled = false;

    sms.onclick =
      function () {

        shareSMS(
          message,
          bill.mobile
        );

      };

  }


  toast(
    "बिल सेव हो गया ✅"
  );


  calculateBill();

}


/* =========================
   PROFESSIONAL BILL MESSAGE
========================= */

function makeBillMessage(
  bill,
  channel = "whatsapp"
) {

  let message =

`*${db.settings.shopName}*
${db.settings.ownerName} • ${db.settings.mobile}
${db.settings.address}

🧾 *BILL*
*Bill No.:* ${bill.billNo}
*Date:* ${bill.date}

*Customer:* ${bill.customerName}
*Mobile:* ${bill.mobile || "-"}

━━━━━━━━━━━━━━
*सामान*
━━━━━━━━━━━━━━
`;


  bill.items.forEach(
    function (item, index) {

      message +=

`${index + 1}. *${item.name}*
   ${item.qty} ${item.unit} × ${money(item.rate)}
   Amount: ${money(item.amount)}

`;

    }
  );


  message +=

`━━━━━━━━━━━━━━
*Bill Total:* ${money(bill.total)}
*Old Balance:* ${money(bill.oldBalance)}
*Paid:* ${money(bill.paid)}
*New Balance:* ${money(bill.newBalance)}
━━━━━━━━━━━━━━

${db.settings.footer}

${db.settings.whatsappMessage}`;


  if (channel === "sms") {

    message =
      message
        .replace(/\*/g, "")
        .replace(
          db.settings.whatsappMessage,
          db.settings.smsMessage
        );

  }


  return message;

}


/* =========================
   WHATSAPP
========================= */

function shareWhatsApp(
  message,
  mobile
) {

  let phone =
    String(mobile || "")
      .replace(/\D/g, "");


  if (!phone) {

    toast(
      "ग्राहक का मोबाइल नंबर नहीं है"
    );

    return;

  }


  if (phone.length === 10) {

    phone =
      "91" + phone;

  }


  window.location.href =
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(message);

}


/* =========================
   SMS
========================= */

function shareSMS(
  message,
  mobile
) {

  const phone =
    String(mobile || "")
      .replace(/\D/g, "");


  if (!phone) {

    toast(
      "मोबाइल नंबर नहीं है"
    );

    return;

  }


  window.location.href =
    "sms:" +
    phone +
    "?body=" +
    encodeURIComponent(message);

}


/* =========================
   UDHARI / JAMA
========================= */

function renderAccountCustomers() {

  const input =
    document.getElementById(
      "accountSearch"
    );


  const query =
    (input?.value || "")
      .toLowerCase()
      .trim();


  const customers =
    db.customers.filter(
      function (customer) {

        return (

          !query ||

          customer.name
            .toLowerCase()
            .includes(query) ||

          String(
            customer.mobile || ""
          ).includes(query)

        );

      }
    );


  const container =
    document.getElementById(
      "accountCustomers"
    );


  if (!container) return;


  container.innerHTML =
    customers
      .map(function (customer) {

        return `

          <div
            class="list-card"
            onclick="
              selectAccount('${customer.id}')
            "
          >

            <b>
              ${esc(customer.name)}
            </b>

            <div class="muted">
              ${esc(customer.mobile || "")}
            </div>

            <div
              class="
                balance
                ${customer.balance > 0
                  ? "positive"
                  : "negative"}
              "
            >

              ${
                customer.balance > 0
                  ? "बाकी "
                  : "जमा "
              }

              ${money(
                Math.abs(
                  customer.balance
                )
              )}

            </div>

          </div>

        `;

      })
      .join("");


  if (!customers.length) {

    container.innerHTML =
      '<div class="card muted">ग्राहक नहीं मिला</div>';

  }


  if (selectedAccountId) {

    renderAccountDetail();

  }

}


function selectAccount(
  customerId
) {

  selectedAccountId =
    customerId;

  renderAccountDetail();

}


function renderAccountDetail() {

  const customer =
    getCustomer(
      selectedAccountId
    );


  const container =
    document.getElementById(
      "accountDetail"
    );


  if (!customer || !container) {
    return;
  }


  const transactions =
    db.transactions
      .filter(
        function (transaction) {

          return (
            transaction.customerId ===
            customer.id
          );

        }
      )
      .sort(
        function (a, b) {

          return (
            String(b.id)
              .localeCompare(
                String(a.id)
              )
          );

        }
      );


  container.innerHTML = `

    <div class="card">

      <h3>
        ${esc(customer.name)}
      </h3>

      <p>
        ${esc(customer.mobile || "")}
      </p>

      <div
        class="
          balance
          ${customer.balance > 0
            ? "positive"
            : "negative"}
        "
      >

        ${
          customer.balance > 0
            ? "उधारी बाकी"
            : "जमा / अग्रिम"
        }

        :

        ${money(
          Math.abs(
            customer.balance
          )
        )}

      </div>


      <div class="button-row">

        <button
          class="danger"
          onclick="
            accountTxn('udhari')
          "
        >

          🔴 UDHARI

        </button>


        <button
          class="primary"
          onclick="
            accountTxn('jama')
          "
        >

          🟢 JAMA

        </button>

      </div>


      <h3>
        ग्राहक इतिहास
      </h3>


      ${
        transactions.length

          ? transactions
              .map(function (transaction) {

                return `

                  <div class="txn">

                    <b>

                      ${
                        transaction.type ===
                        "udhari"

                          ? "🔴 Udhari"

                          : "🟢 Jama"
                      }

                      ${money(
                        transaction.amount
                      )}

                    </b>

                    <div class="muted">

                      ${esc(
                        transaction.date
                      )}

                      •

                      ${esc(
                        transaction.note || ""
                      )}

                    </div>

                  </div>

                `;

              })
              .join("")

          : '<p class="muted">कोई लेन-देन नहीं</p>'

      }

    </div>

  `;

}


function accountTxn(
  type
) {

  const customer =
    getCustomer(
      selectedAccountId
    );


  if (!customer) return;


  const amount =
    Number(
      prompt(
        (
          type === "udhari"
            ? "उधारी"
            : "जमा"
        ) +
        " राशि ₹"
      ) || 0
    );


  if (amount <= 0) {

    return;

  }


  if (
    type === "jama" &&
    amount >
      Number(customer.balance || 0)
  ) {

    const continueSave =
      confirm(
        "जमा राशि मौजूदा बाकी से ज्यादा है। फिर भी सेव करें?"
      );


    if (!continueSave) {
      return;
    }

  }


  if (type === "udhari") {

    customer.balance =
      Number(customer.balance || 0) +
      amount;

  } else {

    customer.balance =
      Number(customer.balance || 0) -
      amount;

  }


  const transaction = {

    id: id(),

    date:
      now(),

    type:
      type,

    customerId:
      customer.id,

    customerName:
      customer.name,

    mobile:
      customer.mobile,

    amount:
      amount,

    note:
      type === "udhari"
        ? "उधारी दर्ज हुई"
        : "जमा प्राप्त हुई",

    source:
      "manual"

  };


  db.transactions.push(
    transaction
  );


  saveDB();


  renderAccountDetail();

  renderAccountCustomers();


  const message =
    makeTransactionMessage(
      transaction,
      customer
    );


  if (
    confirm(
      "रसीद WhatsApp पर भेजें?"
    )
  ) {

    shareWhatsApp(
      message,
      customer.mobile
    );

  }

}


function makeTransactionMessage(
  transaction,
  customer
) {

  const title =
    transaction.type === "udhari"
      ? "UDHARI RECEIPT"
      : "JAMA RECEIPT";


  const status =
    transaction.type === "udhari"
      ? "उधारी के रूप में दर्ज"
      : "जमा के रूप में प्राप्त";


  const footer =
    transaction.type === "udhari"
      ? db.settings.udhariMessage
      : db.settings.jamaMessage;


  return `*${db.settings.shopName}*
${db.settings.ownerName} • ${db.settings.mobile}
${db.settings.address}

🧾 *${title}*

*Date:* ${transaction.date}
*Customer:* ${customer.name}
*Mobile:* ${customer.mobile || "-"}

*Amount:* ${money(transaction.amount)}

${status}

*Current Balance:* ${money(
    Math.abs(customer.balance)
  )}

━━━━━━━━━━━━━━

${footer}`;

}


/* =========================
   SAVED BILLS
========================= */

function renderSaved() {

  const container =
    document.getElementById(
      "savedList"
    );


  if (!container) return;


  const bills =
    [...db.bills].reverse();


  if (!bills.length) {

    container.innerHTML =
      '<div class="card muted">अभी कोई बिल सेव नहीं है।</div>';

    return;

  }


  container.innerHTML =
    bills
      .map(function (bill) {

        const message =
          makeBillMessage(
            bill
          );


        return `

          <div class="list-card">

            <b>
              Bill #${bill.billNo}
              —
              ${esc(bill.customerName)}
            </b>

            <div class="muted">

              ${esc(bill.date)}
              •
              ${esc(bill.mobile || "")}

            </div>

            <p>

              कुल:
              <b>
                ${money(bill.total)}
              </b>

              •

              बाकी:
              <b>
                ${money(bill.newBalance)}
              </b>

            </p>


            <div class="button-row">

              <button
                class="whatsapp"
                onclick="
                  shareWhatsApp(
                    ${JSON.stringify(message)},
                    ${JSON.stringify(bill.mobile || "")}
                  )
                "
              >

                WhatsApp

              </button>


              <button
                class="outline"
                onclick="
                  alert(
                    ${JSON.stringify(message)}
                  )
                "
              >

                देखें

              </button>

            </div>

          </div>

        `;

      })
      .join("");

}


/* =========================
   STOCK
========================= */

function renderStock() {

  const container =
    document.getElementById(
      "stockList"
    );


  if (!container) return;


  if (!db.products.length) {

    container.innerHTML =
      '<div class="card muted">कोई सामान नहीं है।</div>';

    return;

  }


  container.innerHTML =
    db.products
      .map(function (product) {

        return `

          <div class="list-card">

            <b>
              ${esc(product.name)}
            </b>

            <div class="muted">

              Rate:
              ${money(product.rate)}
              /
              ${esc(product.unit)}

              • Stock:
              ${product.stock}
              ${esc(product.unit)}

            </div>


            <div class="button-row">

              <button
                class="outline"
                onclick="
                  editProduct('${product.id}')
                "
              >

                Edit

              </button>


              <button
                class="danger"
                onclick="
                  deleteProduct('${product.id}')
                "
              >

                Delete

              </button>

            </div>

          </div>

        `;

      })
      .join("");

}


function saveProduct() {

  const name =
    document.getElementById(
      "productName"
    ).value.trim();


  const rate =
    Number(
      document.getElementById(
        "productRate"
      ).value || 0
    );


  const unit =
    document.getElementById(
      "productUnit"
    ).value;


  const stock =
    Number(
      document.getElementById(
        "productStock"
      ).value || 0
    );


  if (!name) {

    toast(
      "सामान का नाम डालें"
    );

    return;

  }


  let product =
    db.products.find(
      function (item) {

        return (
          item.name.toLowerCase() ===
          name.toLowerCase()
        );

      }
    );


  if (product) {

    product.rate =
      rate;

    product.unit =
      unit;

    product.stock =
      stock;

  } else {

    db.products.push({

      id:
        id(),

      name:
        name,

      rate:
        rate,

      unit:
        unit,

      stock:
        stock,

      minStock:
        5

    });

  }


  saveDB();


  document.getElementById(
    "productName"
  ).value = "";


  document.getElementById(
    "productRate"
  ).value = "";


  document.getElementById(
    "productStock"
  ).value = "";


  renderStock();


  toast(
    "सामान सेव हो गया ✅"
  );

}


function editProduct(
  productId
) {

  const product =
    db.products.find(
      function (item) {

        return item.id === productId;

      }
    );


  if (!product) return;


  document.getElementById(
    "productName"
  ).value =
    product.name;


  document.getElementById(
    "productRate"
  ).value =
    product.rate;


  document.getElementById(
    "productUnit"
  ).value =
    product.unit;


  document.getElementById(
    "productStock"
  ).value =
    product.stock;


  window.scrollTo(
    0,
    0
  );

}


function deleteProduct(
  productId
) {

  if (
    !confirm(
      "यह सामान हटाएं?"
    )
  ) {

    return;

  }


  db.products =
    db.products.filter(
      function (product) {

        return product.id !== productId;

      }
    );


  saveDB();

  renderStock();

  toast(
    "सामान हटा दिया गया"
  );

}


/* =========================
   RATE LIST
========================= */

function renderRates() {

  const container =
    document.getElementById(
      "rateList"
    );


  if (!container) return;


  if (!db.products.length) {

    container.innerHTML =
      '<div class="card muted">Rate List खाली है।</div>';

    return;

  }


  container.innerHTML =
    db.products
      .map(function (product) {

        return `

          <div class="list-card">

            <b>
              ${esc(product.name)}
            </b>

            <span style="float:right">

              ${money(product.rate)}
              /
              ${esc(product.unit)}

            </span>

          </div>

        `;

      })
      .join("");

}


/* =========================
   SALES REPORT
========================= */

function renderSales() {

  const container =
    document.getElementById(
      "salesReport"
    );


  if (!container) return;


  const total =
    db.bills.reduce(
      function (sum, bill) {

        return sum + bill.total;

      },
      0
    );


  const paid =
    db.bills.reduce(
      function (sum, bill) {

        return sum + bill.paid;

      },
      0
    );


  const due =
    total - paid;


  container.innerHTML = `

    <div class="card">

      <div class="summary">

        <div>
          कुल बिक्री
          <b>${money(total)}</b>
        </div>

        <div>
          बिल में जमा
          <b>${money(paid)}</b>
        </div>

        <div>
          बिक्री की बाकी
          <b>${money(due)}</b>
        </div>

        <div>
          कुल बिल
          <b>${db.bills.length}</b>
        </div>

      </div>

    </div>


    ${

      [...db.bills]
        .reverse()
        .map(function (bill) {

          return `

            <div class="list-card">

              Bill #${bill.billNo}

              •

              ${esc(bill.customerName)}

              <b style="float:right">

                ${money(bill.total)}

              </b>

              <div class="muted">

                ${esc(bill.date)}

              </div>

            </div>

          `;

        })
        .join("")

    }

  `;

}


/* =========================
   CUSTOMERS
========================= */

function renderCustomers() {

  const container =
    document.getElementById(
      "customersList"
    );


  if (!container) return;


  if (!db.customers.length) {

    container.innerHTML =
      '<div class="card muted">कोई ग्राहक नहीं है।</div>';

    return;

  }


  container.innerHTML =
    db.customers
      .map(function (customer) {

        return `

          <div class="list-card">

            <b>
              ${esc(customer.name)}
            </b>

            <div>
              ${esc(customer.mobile || "")}
            </div>

            <div
              class="
                balance
                ${customer.balance > 0
                  ? "positive"
                  : "negative"}
              "
            >

              ${
                customer.balance > 0
                  ? "बाकी "
                  : "जमा "
              }

              ${money(
                Math.abs(
                  customer.balance
                )
              )}

            </div>

          </div>

        `;

      })
      .join("");

}


/* =========================
   FULL LEDGER
========================= */

function renderLedger() {

  const container =
    document.getElementById(
      "ledgerList"
    );


  if (!container) return;


  const transactions =
    [...db.transactions]
      .reverse();


  if (!transactions.length) {

    container.innerHTML =
      '<div class="card muted">कोई लेन-देन नहीं है।</div>';

    return;

  }


  container.innerHTML =
    transactions
      .map(function (transaction) {

        return `

          <div class="list-card">

            <b>

              ${
                transaction.type === "udhari"
                  ? "🔴 Udhari"
                  : "🟢 Jama"
              }

              —

              ${esc(
                transaction.customerName
              )}

            </b>

            <span style="float:right">

              ${money(
                transaction.amount
              )}

            </span>

            <div class="muted">

              ${esc(
                transaction.date
              )}

              •

              ${esc(
                transaction.note || ""
              )}

            </div>

          </div>

        `;

      })
      .join("");

}


/* =========================
   UDHARI REPORT
========================= */

function renderUdhariReport() {

  const container =
    document.getElementById(
      "udhariList"
    );


  if (!container) return;


  const transactions =
    db.transactions.filter(
      function (transaction) {

        return (
          transaction.type ===
          "udhari"
        );

      }
    );


  const total =
    transactions.reduce(
      function (sum, transaction) {

        return (
          sum +
          transaction.amount
        );

      },
      0
    );


  container.innerHTML = `

    <div class="card">

      <b>
        कुल Udhari Transactions:
        ${transactions.length}
      </b>

      <h2>
        ${money(total)}
      </h2>

    </div>


    ${

      [...transactions]
        .reverse()
        .map(function (transaction) {

          return `

            <div class="list-card">

              ${esc(
                transaction.customerName
              )}

              <b style="float:right">

                ${money(
                  transaction.amount
                )}

              </b>

              <div class="muted">

                ${esc(
                  transaction.date
                )}

              </div>

            </div>

          `;

        })
        .join("")

    }

  `;

}


/* =========================
   JAMA REPORT
========================= */

function renderJamaReport() {

  const container =
    document.getElementById(
      "jamaList"
    );


  if (!container) return;


  const transactions =
    db.transactions.filter(
      function (transaction) {

        return (
          transaction.type ===
          "jama"
        );

      }
    );


  const total =
    transactions.reduce(
      function (sum, transaction) {

        return (
          sum +
          transaction.amount
        );

      },
      0
    );


  container.innerHTML = `

    <div class="card">

      <b>
        कुल Jama Transactions:
        ${transactions.length}
      </b>

      <h2>
        ${money(total)}
      </h2>

    </div>


    ${

      [...transactions]
        .reverse()
        .map(function (transaction) {

          return `

            <div class="list-card">

              ${esc(
                transaction.customerName
              )}

              <b style="float:right">

                ${money(
                  transaction.amount
                )}

              </b>

              <div class="muted">

                ${esc(
                  transaction.date
                )}

              </div>

            </div>

          `;

        })
        .join("")

    }

  `;

}


/* =========================
   STOCK REPORT
========================= */

function renderStockReport() {

  const container =
    document.getElementById(
      "stockReportList"
    );


  if (!container) return;


  const lowStock =
    db.products.filter(
      function (product) {

        return (
          Number(product.stock) <=
          Number(product.minStock ?? 5)
        );

      }
    );


  container.innerHTML = `

    <div class="card">

      <b>
        कुल सामान:
      </b>

      ${db.products.length}

      <br>

      <b>
        Low Stock:
      </b>

      ${lowStock.length}

    </div>


    ${

      db.products
        .map(function (product) {

          const low =
            Number(product.stock) <=
            Number(
              product.minStock ?? 5
            );


          return `

            <div class="list-card">

              <b>
                ${esc(product.name)}
              </b>

              <span style="float:right">

                ${product.stock}
                ${esc(product.unit)}

              </span>

              <div class="muted">

                ${
                  low
                    ? "⚠️ Low Stock"
                    : "✓ Stock ठीक"
                }

              </div>

            </div>

          `;

        })
        .join("")

    }

  `;

}


/* =========================
   SETTINGS
========================= */

function loadSettings() {

  const s =
    db.settings;


  const fields = {

    sShop:
      s.shopName,

    sOwner:
      s.ownerName,

    sMobile:
      s.mobile,

    sAddress:
      s.address,

    sBillNo:
      s.billNo,

    sFooter:
      s.footer,

    sWA:
      s.whatsappMessage,

    sSMS:
      s.smsMessage,

    sUdhari:
      s.udhariMessage,

    sJama:
      s.jamaMessage,

    sLine1:
      s.customerLine1,

    sLine2:
      s.customerLine2

  };


  Object.keys(fields)
    .forEach(function (fieldId) {

      const element =
        document.getElementById(
          fieldId
        );


      if (element) {

        element.value =
          fields[fieldId];

      }

    });

}


function saveSettings() {

  const s =
    db.settings;


  s.shopName =
    document.getElementById(
      "sShop"
    ).value.trim() ||
    defaults.shopName;


  s.ownerName =
    document.getElementById(
      "sOwner"
    ).value.trim() ||
    defaults.ownerName;


  s.mobile =
    document.getElementById(
      "sMobile"
    ).value.trim();


  s.address =
    document.getElementById(
      "sAddress"
    ).value.trim();


  s.billNo =
    Math.max(
      1,
      Number(
        document.getElementById(
          "sBillNo"
        ).value || 1
      )
    );


  s.footer =
    document.getElementById(
      "sFooter"
    ).value;


  s.whatsappMessage =
    document.getElementById(
      "sWA"
    ).value;


  s.smsMessage =
    document.getElementById(
      "sSMS"
    ).value;


  s.udhariMessage =
    document.getElementById(
      "sUdhari"
    ).value;


  s.jamaMessage =
    document.getElementById(
      "sJama"
    ).value;


  s.customerLine1 =
    document.getElementById(
      "sLine1"
    ).value;


  s.customerLine2 =
    document.getElementById(
      "sLine2"
    ).value;


  saveDB();

  applyHeader();

  toast(
    "Settings सेव हो गई ✅"
  );

  goHome();

}


/* =========================
   BACKUP
========================= */

function exportBackup() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          db,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    "MANSURI-KIRANA-Backup-" +
    new Date()
      .toISOString()
      .slice(0, 10) +
    ".json";


  link.click();


  URL.revokeObjectURL(
    url
  );


  toast(
    "Backup डाउनलोड हो गया ✅"
  );

}


/* =========================
   RESTORE
========================= */

function importBackup(
  event
) {

  const file =
    event.target.files?.[0];


  if (!file) return;


  const reader =
    new FileReader();


  reader.onload =
    function () {

      try {

        db =
          normalize(
            JSON.parse(
              reader.result
            )
          );


        saveDB();

        applyHeader();


        toast(
          "Backup Restore हो गया ✅"
        );


        setTimeout(
          function () {

            location.reload();

          },
          700
        );


      } catch (error) {

        toast(
          "Backup file सही नहीं है"
        );

      }

    };


  reader.readAsText(
    file
  );

}


/* =========================
   DELETE ALL
========================= */

function clearAllData() {

  if (
    !confirm(
      "सारा डेटा Delete करना है?"
    )
  ) {

    return;

  }


  if (
    !confirm(
      "Customers, Bills, Stock और पूरा हिसाब मिट जाएगा। आखिरी पुष्टि करें।"
    )
  ) {

    return;

  }


  localStorage.removeItem(
    KEY
  );


  localStorage.removeItem(
    OLD_KEY
  );


  db =
    normalize({});


  applyHeader();

  toast(
    "सारा डेटा Delete हो गया"
  );


  goHome();

}


/* =========================
   LANGUAGE
========================= */

function setLanguage(
  language
) {

  db.settings.language =
    language;


  saveDB();


  toast(
    language === "hi"
      ? "हिंदी चुनी गई 🇮🇳"
      : "English selected 🇬🇧"
  );

}


/* =========================
   START APP
========================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    today();

    applyHeader();

  }
);


/* =========================
   PUBLIC FUNCTIONS
========================= */

window.MansuriKirana = {

  openScreen,

  saveBill,

  addProductRow,

  calculateBill,

  shareWhatsApp,

  shareSMS,

  makeBillMessage,

  makeTransactionMessage,

  exportBackup,

  importBackup,

  saveSettings

};
