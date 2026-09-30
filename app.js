// MANSURI KIRANA - App Core
// Owner: AALAM MANSURI
// Mobile: 9754083323

const APP_KEY = "mansuri_kirana_data_v1";

const defaultData = {
  settings: {
    shopName: "MANSURI KIRANA",
    ownerName: "AALAM MANSURI",
    mobile: "9754083323",
    language: "hi",
    billNo: 1
  },
  customers: [],
  products: [],
  bills: [],
  transactions: []
};

function loadData() {
  try {
    const saved = localStorage.getItem(APP_KEY);
    return saved ? JSON.parse(saved) : structuredClone(defaultData);
  } catch (error) {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(APP_KEY, JSON.stringify(appData));
}

let appData = loadData();

function formatMoney(amount) {
  return "₹" + Number(amount || 0).toFixed(2);
}

function today() {
  return new Date().toLocaleDateString("en-IN");
}

function generateBillNumber() {
  const number = Number(appData.settings.billNo || 1);
  appData.settings.billNo = number + 1;
  saveData();
  return "MK-" + String(number).padStart(4, "0");
}

function addCustomer(name, mobile = "") {
  const customer = {
    id: Date.now().toString(),
    name: name.trim(),
    mobile: mobile.trim(),
    balance: 0,
    createdAt: new Date().toISOString()
  };

  appData.customers.push(customer);
  saveData();
  return customer;
}

function findCustomer(id) {
  return appData.customers.find(c => c.id === id);
}

function addProduct(name, rate, unit = "Kg") {
  const product = {
    id: Date.now().toString(),
    name: name.trim(),
    rate: Number(rate) || 0,
    unit,
    stock: 0,
    createdAt: new Date().toISOString()
  };

  appData.products.push(product);
  saveData();
  return product;
}

function findProduct(id) {
  return appData.products.find(p => p.id === id);
}

function addTransaction(customerId, type, amount, note = "") {
  const customer = findCustomer(customerId);

  if (!customer) {
    alert("ग्राहक नहीं मिला");
    return null;
  }

  amount = Number(amount) || 0;

  if (amount <= 0) {
    alert("सही राशि दर्ज करें");
    return null;
  }

  if (type === "udhari") {
    customer.balance += amount;
  }

  if (type === "jama") {
    customer.balance -= amount;
  }

  const transaction = {
    id: Date.now().toString(),
    customerId,
    type,
    amount,
    note,
    date: new Date().toISOString()
  };

  appData.transactions.push(transaction);
  saveData();

  return transaction;
}

function createBill(customerId, items, paid = 0) {
  const customer = findCustomer(customerId);

  if (!customer) {
    alert("कृपया ग्राहक चुनें");
    return null;
  }

  const total = items.reduce((sum, item) => {
    return sum + (Number(item.qty) * Number(item.rate));
  }, 0);

  paid = Number(paid) || 0;

  const oldBalance = Number(customer.balance) || 0;
  const newBalance = oldBalance + total - paid;

  const bill = {
    id: Date.now().toString(),
    billNo: generateBillNumber(),
    customerId,
    customerName: customer.name,
    customerMobile: customer.mobile,
    items,
    total,
    paid,
    oldBalance,
    newBalance,
    date: new Date().toISOString()
  };

  customer.balance = newBalance;

  appData.bills.push(bill);

  if (paid > 0) {
    appData.transactions.push({
      id: Date.now().toString() + "-paid",
      customerId,
      type: "jama",
      amount: paid,
      note: "Bill Payment",
      date: new Date().toISOString()
    });
  }

  saveData();

  return bill;
}

function getCustomerTransactions(customerId) {
  return appData.transactions.filter(
    transaction => transaction.customerId === customerId
  );
}

function getCustomerBills(customerId) {
  return appData.bills.filter(
    bill => bill.customerId === customerId
  );
}

function makeWhatsAppMessage(bill) {
  let message = "";

  message += "*MANSURI KIRANA*\n";
  message += "AALAM MANSURI • 9754083323\n";
  message += "━━━━━━━━━━━━━━━━━━\n";
  message += "🧾 Bill No: " + bill.billNo + "\n";
  message += "📅 Date: " + new Date(bill.date).toLocaleString("en-IN") + "\n";
  message += "👤 Customer: " + bill.customerName + "\n";

  if (bill.customerMobile) {
    message += "📱 Mobile: " + bill.customerMobile + "\n";
  }

  message += "━━━━━━━━━━━━━━━━━━\n";

  bill.items.forEach((item, index) => {
    const amount = Number(item.qty) * Number(item.rate);

    message +=
      (index + 1) +
      ". " +
      item.name +
      " × " +
      item.qty +
      " " +
      (item.unit || "") +
      " = " +
      formatMoney(amount) +
      "\n";
  });

  message += "━━━━━━━━━━━━━━━━━━\n";
  message += "💰 Bill Total: " + formatMoney(bill.total) + "\n";
  message += "💵 Paid: " + formatMoney(bill.paid) + "\n";
  message += "📒 Old Balance: " + formatMoney(bill.oldBalance) + "\n";
  message += "📌 Current Balance: " + formatMoney(bill.newBalance) + "\n";
  message += "━━━━━━━━━━━━━━━━━━\n";
  message += "आपका भरोसा ही हमारी सबसे बड़ी पूंजी है। ❤️\n";
  message += "सही सामान, सही हिसाब और बेहतर सेवा—हर बार आपका स्वागत है।\n";
  message += "\nधन्यवाद 🙏";

  return message;
}

function shareOnWhatsApp(bill) {
  const message = makeWhatsAppMessage(bill);

  let mobile = String(bill.customerMobile || "")
    .replace(/\D/g, "");

  if (mobile.length === 10) {
    mobile = "91" + mobile;
  }

  const url =
    "https://wa.me/" +
    mobile +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

function shareOnSMS(bill) {
  const message = makeWhatsAppMessage(bill);

  const mobile = String(bill.customerMobile || "")
    .replace(/\D/g, "");

  window.location.href =
    "sms:" +
    mobile +
    "?body=" +
    encodeURIComponent(message);
}

function exportBackup() {
  const backup = JSON.stringify(appData, null, 2);
  const blob = new Blob([backup], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    "MANSURI-KIRANA-BACKUP-" +
    new Date().toISOString().slice(0, 10) +
    ".json";

  link.click();

  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);

      if (
        !imported.settings ||
        !Array.isArray(imported.customers) ||
        !Array.isArray(imported.products) ||
        !Array.isArray(imported.bills) ||
        !Array.isArray(imported.transactions)
      ) {
        throw new Error("Invalid backup");
      }

      appData = imported;
      saveData();

      alert("Backup सफलतापूर्वक Restore हो गया।");
      location.reload();

    } catch (error) {
      alert("Backup file सही नहीं है।");
    }
  };

  reader.readAsText(file);
}

function clearAllData() {
  const confirmDelete = confirm(
    "क्या आप MANSURI KIRANA का पूरा data delete करना चाहते हैं?"
  );

  if (!confirmDelete) return;

  localStorage.removeItem(APP_KEY);
  appData = structuredClone(defaultData);

  alert("सारा data delete कर दिया गया।");
  location.reload();
}

window.MansuriKirana = {
  data: () => appData,
  saveData,
  addCustomer,
  findCustomer,
  addProduct,
  findProduct,
  addTransaction,
  createBill,
  getCustomerTransactions,
  getCustomerBills,
  makeWhatsAppMessage,
  shareOnWhatsApp,
  shareOnSMS,
  exportBackup,
  importBackup,
  clearAllData,
  formatMoney,
  today
};

console.log("MANSURI KIRANA App Ready");
