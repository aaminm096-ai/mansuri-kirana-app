const APP_KEY = "mansuri_kirana_data_v1";

const defaultData = {
  settings: {
    shopName: "MANSURI KIRANA",
    ownerName: "AALAM MANSURI",
    mobile: "9754083323",
    address: "Kesur",
    language: "hi",
    billNo: 1,
    footer: "आपका भरोसा ही हमारी सबसे बड़ी पूंजी है। ❤️",
    whatsappMessage: "धन्यवाद! MANSURI KIRANA पर खरीदारी के लिए आपका धन्यवाद।",
    smsMessage: "MANSURI KIRANA - धन्यवाद।",
    udhariMessage: "आपकी उधारी की रसीद। कृपया समय पर भुगतान करें।",
    jamaMessage: "आपकी जमा राशि की रसीद। धन्यवाद।",
    customerLine1: "आपका भरोसा ही हमारी सबसे बड़ी पूंजी है। ❤️",
    customerLine2: "सही सामान, सही हिसाब और बेहतर सेवा—हर बार आपका स्वागत है।"
  },

  customers: [],
  products: [],
  bills: [],
  transactions: []
};

let appData = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(APP_KEY);

    if (!saved) {
      return JSON.parse(JSON.stringify(defaultData));
    }

    const data = JSON.parse(saved);

    return {
      ...defaultData,
      ...data,
      settings: {
        ...defaultData.settings,
        ...(data.settings || {})
      },
      customers: Array.isArray(data.customers) ? data.customers : [],
      products: Array.isArray(data.products) ? data.products : [],
      bills: Array.isArray(data.bills) ? data.bills : [],
      transactions: Array.isArray(data.transactions)
        ? data.transactions
        : []
    };
  } catch (error) {
    console.error("Data load error:", error);
    return JSON.parse(JSON.stringify(defaultData));
  }
}

function saveData() {
  localStorage.setItem(APP_KEY, JSON.stringify(appData));
}

function data() {
  return appData;
}

/* -------------------------
   DATE & MONEY
------------------------- */

function money(value) {
  return "₹" + Number(value || 0).toFixed(2);
}

function today() {
  return new Date().toLocaleDateString("hi-IN");
}

function nowISO() {
  return new Date().toISOString();
}

/* -------------------------
   BILL NUMBER
------------------------- */

function nextBillNumber() {
  const number = Number(appData.settings.billNo || 1);

  const billNumber =
    "MK-" + String(number).padStart(4, "0");

  appData.settings.billNo = number + 1;

  saveData();

  return billNumber;
}

/* -------------------------
   CUSTOMERS
------------------------- */

function findCustomer(id) {
  return appData.customers.find(c => c.id === id);
}

function findCustomerByMobile(mobile) {
  const value = String(mobile || "").trim();

  if (!value) return null;

  return appData.customers.find(
    c => String(c.mobile || "").trim() === value
  );
}

function findCustomerByName(name) {
  const value = String(name || "").trim().toLowerCase();

  if (!value) return null;

  return appData.customers.find(
    c => String(c.name || "").trim().toLowerCase() === value
  );
}

function addCustomer(name, mobile = "") {
  name = String(name || "").trim();
  mobile = String(mobile || "").trim();

  if (!name) return null;

  let customer =
    findCustomerByMobile(mobile) ||
    findCustomerByName(name);

  if (customer) {
    if (mobile && !customer.mobile) {
      customer.mobile = mobile;
    }

    saveData();
    return customer;
  }

  customer = {
    id: "cust_" + Date.now(),
    name,
    mobile,
    balance: 0,
    createdAt: nowISO()
  };

  appData.customers.push(customer);

  saveData();

  return customer;
}

/* -------------------------
   PRODUCTS
------------------------- */

function findProduct(id) {
  return appData.products.find(p => p.id === id);
}

function findProductByName(name) {
  const value = String(name || "").trim().toLowerCase();

  return appData.products.find(
    p => String(p.name || "").trim().toLowerCase() === value
  );
}

function addProduct(name, rate, unit = "Kg") {
  name = String(name || "").trim();

  if (!name) return null;

  let product = findProductByName(name);

  if (product) {
    product.rate = Number(rate || product.rate || 0);
    product.unit = unit || product.unit || "Kg";

    saveData();

    return product;
  }

  product = {
    id: "prod_" + Date.now(),
    name,
    rate: Number(rate || 0),
    unit: unit || "Kg",
    stock: 0,
    minStock: 0,
    createdAt: nowISO()
  };

  appData.products.push(product);

  saveData();

  return product;
}

/* -------------------------
   TRANSACTIONS
------------------------- */

function addTransaction(
  customerId,
  type,
  amount,
  note = ""
) {
  const customer = findCustomer(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  amount = Number(amount || 0);

  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  if (type === "udhari") {
    customer.balance =
      Number(customer.balance || 0) + amount;
  }

  if (type === "jama") {
    customer.balance =
      Number(customer.balance || 0) - amount;
  }

  const transaction = {
    id: "txn_" + Date.now(),
    customerId,
    type,
    amount,
    note,
    date: nowISO()
  };

  appData.transactions.push(transaction);

  saveData();

  return transaction;
}

/* -------------------------
   BILL
------------------------- */

function createBill(
  customerId,
  items = [],
  paid = 0
) {
  const customer = findCustomer(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  const billItems = items.map(item => {
    const qty = Number(item.qty || 0);
    const rate = Number(item.rate || 0);

    return {
      productId: item.productId || "",
      name: item.name || "",
      qty,
      rate,
      unit: item.unit || "Kg",
      amount: qty * rate
    };
  });

  const total = billItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  paid = Number(paid || 0);

  const oldBalance = Number(customer.balance || 0);

  const newBalance =
    oldBalance + total - paid;

  const bill = {
    id: "bill_" + Date.now(),
    billNo: nextBillNumber(),
    customerId,
    customerName: customer.name,
    customerMobile: customer.mobile || "",
    items: billItems,
    total,
    paid,
    oldBalance,
    newBalance,
    date: nowISO()
  };

  appData.bills.push(bill);

  customer.balance = newBalance;

  if (paid > 0) {
    appData.transactions.push({
      id: "txn_" + Date.now() + "_paid",
      customerId,
      type: "jama",
      amount: paid,
      note: "Bill payment",
      billId: bill.id,
      date: nowISO()
    });
  }

  if (total - paid > 0) {
    appData.transactions.push({
      id: "txn_" + Date.now() + "_due",
      customerId,
      type: "udhari",
      amount: total - paid,
      note: "Bill balance",
      billId: bill.id,
      date: nowISO()
    });
  }

  /* Stock reduce */
  billItems.forEach(item => {
    const product = findProduct(item.productId);

    if (product) {
      product.stock =
        Number(product.stock || 0) - Number(item.qty || 0);
    }
  });

  saveData();

  return bill;
}

/* -------------------------
   WHATSAPP BILL
------------------------- */

function makeBillMessage(bill) {
  const settings = appData.settings;

  let message = "";

  message += `*${settings.shopName || "MANSURI KIRANA"}*\n`;
  message += `${settings.ownerName || "AALAM MANSURI"} • ${settings.mobile || ""}\n`;
  message += `दिनांक: ${new Date(bill.date).toLocaleString("hi-IN")}\n`;
  message += `बिल नं.: ${bill.billNo}\n`;
  message += `ग्राहक: ${bill.customerName}\n`;

  if (bill.customerMobile) {
    message += `मो.: ${bill.customerMobile}\n`;
  }

  message += `\n*सामान*\n`;

  bill.items.forEach((item, index) => {
    message +=
      `${index + 1}. ${item.name} - ${item.qty} ${item.unit} × ${money(item.rate)} = ${money(item.amount)}\n`;
  });

  message += `\nकुल बिल: *${money(bill.total)}*`;
  message += `\nपुराना बाकी: ${money(bill.oldBalance)}`;
  message += `\nजमा: ${money(bill.paid)}`;
  message += `\nनया बाकी: *${money(bill.newBalance)}*`;

  if (settings.footer) {
    message += `\n\n${settings.footer}`;
  }

  return message;
}

function makeTransactionMessage(transaction) {
  const customer = findCustomer(transaction.customerId);
  const settings = appData.settings;

  let title =
    transaction.type === "udhari"
      ? "उधारी रसीद"
      : "जमा रसीद";

  let message = "";

  message += `*${settings.shopName || "MANSURI KIRANA"}*\n`;
  message += `${settings.ownerName || "AALAM MANSURI"} • ${
