let names = [];
let foods = [];
let gst = 0;
let serviceCharge = 0;

// Initialize Materialize modal
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('confirmationModal');
  M.Modal.init(modal);
});

function addName() {
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  const nameError = document.getElementById('nameError');

  if (!name) {
    nameError.textContent = "Please enter a name.";
    return;
  }
  if (names.includes(name)) {
    nameError.textContent = "Name already exists.";
    return;
  }

  names.push(name);
  nameInput.value = '';
  nameError.textContent = '';
  updateTableHeader();
  updateTableBody();
  calculateTotal();
}

function addFood() {
  const foodInput = document.getElementById('foodInput');
  const priceInput = document.getElementById('priceInput');
  const quantityInput = document.getElementById('quantityInput');
  const food = foodInput.value.trim();
  const price = parseFloat(priceInput.value);
  const quantity = parseInt(quantityInput.value) || 1;
  const foodError = document.getElementById('foodError');

  if (!food) {
    foodError.textContent = "Please enter a food item.";
    return;
  }
  if (foods.some(item => item.food === food)) {
    foodError.textContent = "Food item already exists.";
    return;
  }
  if (isNaN(price) || price <= 0) {
    foodError.textContent = "Please enter a valid price.";
    return;
  }

  foods.push({ food, price, quantity, payers: new Array(names.length).fill(false) });
  foodInput.value = '';
  priceInput.value = '';
  quantityInput.value = '';
  foodError.textContent = '';
  updateTableBody();
  calculateTotal();
}

function updateTableHeader() {
  const table = document.getElementById('billTable');
  const headerRow = table.getElementsByTagName('thead')[0].rows[0];
  headerRow.innerHTML = '<th>Item/Name</th>' + names.map((name, index) =>
    `<th>${name} <button class="remove-btn" onclick="confirmRemoveName(${index})">×</button></th>`
  ).join('');
}

function updateTableBody() {
  const table = document.getElementById('billTable');
  const tbody = table.getElementsByTagName('tbody')[0];
  tbody.innerHTML = '';

  foods.forEach((food, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${food.food} (Qty: ${food.quantity}, $${(food.price * food.quantity).toFixed(2)}) <button class="remove-btn" onclick="confirmRemoveFood(${index})">×</button></td>` +
      names.map((name, i) => `<td><label><input type="checkbox" onchange="updatePayer(${index}, ${i})" ${food.payers[i] ? 'checked' : ''}><span></span></label></td>`).join('');
    tbody.appendChild(row);
  });
}

function updatePayer(foodIndex, payerIndex) {
  foods[foodIndex].payers[payerIndex] = !foods[foodIndex].payers[payerIndex];
  calculateTotal();
}

function toggleChargeInputs(show) {
  document.getElementById('gstInputContainer').style.display = show ? 'block' : 'none';
  document.getElementById('serviceChargeInputContainer').style.display = show ? 'block' : 'none';
  calculateTotal();
}

function calculateTotal() {
  const gstInput = document.getElementById('gstInput');
  const serviceChargeInput = document.getElementById('serviceChargeInput');
  gst = parseFloat(gstInput.value) || 0;
  serviceCharge = parseFloat(serviceChargeInput.value) || 0;

  const totals = new Array(names.length).fill(0);

  foods.forEach(food => {
    const totalPayers = food.payers.filter(p => p).length;
    if (totalPayers > 0) {
      const costPerPayer = (food.price * food.quantity) / totalPayers;
      food.payers.forEach((payer, index) => {
        if (payer) {
          totals[index] += costPerPayer;
        }
      });
    }
  });

  const totalBeforeCharges = totals.reduce((sum, value) => sum + value, 0);
  const totalWithCharges = totalBeforeCharges * (1 + gst / 100) * (1 + serviceCharge / 100);

  const totalSection = document.getElementById('totalSection');
  totalSection.innerHTML = names.map((name, index) =>
    `${name}: $${(totals[index] * (1 + gst / 100) * (1 + serviceCharge / 100)).toFixed(2)}`
  ).join('<br>');
}

function confirmRemoveName(index) {
  const modal = document.getElementById('confirmationModal');
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.textContent = `Are you sure you want to remove "${names[index]}"?`;
  const confirmRemoveBtn = document.getElementById('confirmRemove');
  confirmRemoveBtn.onclick = () => removeName(index);
  M.Modal.getInstance(modal).open();
}

function confirmRemoveFood(index) {
  const modal = document.getElementById('confirmationModal');
  const modalMessage = document.getElementById('modalMessage');
  modalMessage.textContent = `Are you sure you want to remove "${foods[index].food}"?`;
  const confirmRemoveBtn = document.getElementById('confirmRemove');
  confirmRemoveBtn.onclick = () => removeFood(index);
  M.Modal.getInstance(modal).open();
}

function removeName(index) {
  names.splice(index, 1);
  foods.forEach(food => food.payers.splice(index, 1));
  updateTableHeader();
  updateTableBody();
  calculateTotal();
}

function removeFood(index) {
  foods.splice(index, 1);
  updateTableBody();
  calculateTotal();
}

function handleNameKeyPress(event) {
  if (event.key === 'Enter') {
    addName();
  }
}

function handleFoodKeyPress(event) {
  if (event.key === 'Enter') {
    addFood();
  }
}