// script.js

// --- Helper: Save buyer info to localStorage ---
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('buyerForm')) {
    const buyerForm = document.getElementById('buyerForm');
    buyerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const buyer = {
        name: document.getElementById('buyerNameInput').value.trim(),
        email: document.getElementById('buyerEmail').value.trim(),
        phone: document.getElementById('buyerPhone').value.trim(),
        address: document.getElementById('buyerAddress').value.trim()
      };

      // Basic validation
      if (!buyer.name || !buyer.email || !buyer.phone || !buyer.address) {
        alert('Please fill all buyer fields.');
        return;
      }

      localStorage.setItem('invoiceBuyer', JSON.stringify(buyer));

      // Redirect to add item page
      window.location.href = 'items.html';
    });
  }

  // --- Add Items page ---
  if (document.getElementById('addItemForm')) {
    const addItemForm = document.getElementById('addItemForm');
    const itemsList = document.getElementById('itemsList');

    // Load existing items
    let items = JSON.parse(localStorage.getItem('invoiceItems')) || [];
    renderItems();

    addItemForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const itemName = document.getElementById('itemName').value.trim();
      const itemQty = parseInt(document.getElementById('itemQty').value);
      const itemPrice = parseFloat(document.getElementById('itemPrice').value);

      if (!itemName || itemQty <= 0 || itemPrice < 0) {
        alert('Please enter valid item details.');
        return;
      }

      items.push({
        name: itemName,
        qty: itemQty,
        price: itemPrice
      });

      localStorage.setItem('invoiceItems', JSON.stringify(items));
      renderItems();

      addItemForm.reset();
      document.getElementById('itemQty').value = 1;
    });

    // Remove item function
    itemsList.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item')) {
        const index = e.target.dataset.index;
        items.splice(index, 1);
        localStorage.setItem('invoiceItems', JSON.stringify(items));
        renderItems();
      }
    });

    // Render items in the table
    function renderItems() {
      itemsList.innerHTML = '';
      if (items.length === 0) {
        itemsList.innerHTML = '<tr><td colspan="5" class="text-center">No items added yet.</td></tr>';
        return;
      }

      items.forEach((item, index) => {
        const total = (item.qty * item.price).toFixed(2);
        const row = `
          <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${total}</td>
            <td><button class="btn btn-danger btn-sm remove-item" data-index="${index}">Remove</button></td>
          </tr>
        `;
        itemsList.insertAdjacentHTML('beforeend', row);
      });
    }

    // Go to preview button
    document.getElementById('goToPreview').addEventListener('click', () => {
      if (items.length === 0) {
        alert('Add at least one item to preview the invoice.');
        return;
      }
      window.location.href = 'preview.html';
    });
  }

  // --- Preview page ---
  if (document.getElementById('downloadInvoice')) {
    const buyer = JSON.parse(localStorage.getItem('invoiceBuyer'));
    const items = JSON.parse(localStorage.getItem('invoiceItems')) || [];

    if (!buyer || items.length === 0) {
      alert('Missing buyer or item data. Please enter details again.');
      window.location.href = 'buyer.html';
      return;
    }

    // Fill buyer info
    document.getElementById('buyerName').textContent = buyer.name;
    document.getElementById('buyerEmail').textContent = buyer.email;
    document.getElementById('buyerPhone').textContent = buyer.phone;
    document.getElementById('buyerAddress').textContent = buyer.address;

    // Fill items table
    const invoiceItems = document.getElementById('invoiceItems');
    invoiceItems.innerHTML = '';
    let subtotal = 0;

    items.forEach(item => {
      const total = item.qty * item.price;
      subtotal += total;

      const row = `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>₹${item.price.toFixed(2)}</td>
          <td>₹${total.toFixed(2)}</td>
        </tr>
      `;
      invoiceItems.insertAdjacentHTML('beforeend', row);
    });

    const gst = subtotal * 0.18;
    const totalAmount = subtotal + gst;

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('gstAmount').textContent = gst.toFixed(2);
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(2);

    // Download PDF
    document.getElementById('downloadInvoice').addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Company Header
      doc.setFontSize(16);
      doc.text("Awesome Company Pvt. Ltd.", 20, 20);
      doc.setFontSize(10);
      doc.text("123 Business Rd, City, Country", 20, 27);
      doc.text("Email: contact@awesomecompany.com | Phone: +1234567890", 20, 33);
      doc.text("GST: 18%", 20, 39);

      // Buyer info
      doc.setFontSize(12);
      doc.text("Buyer Information:", 20, 50);
      doc.setFontSize(10);
      doc.text(`Name: ${buyer.name}`, 20, 57);
      doc.text(`Email: ${buyer.email}`, 20, 63);
      doc.text(`Phone: ${buyer.phone}`, 20, 69);
      doc.text(`Address: ${buyer.address}`, 20, 75);

      // Table Headers
      doc.setFontSize(12);
      doc.text("Items:", 20, 90);
      doc.setFontSize(10);

      // Column titles
      const startY = 95;
      doc.text("Item", 20, startY);
      doc.text("Qty", 90, startY);
      doc.text("Price", 120, startY);
      doc.text("Total", 150, startY);

      let y = startY + 7;

      items.forEach(item => {
        doc.text(item.name, 20, y);
        doc.text(item.qty.toString(), 90, y);
        doc.text(`₹${item.price.toFixed(2)}`, 120, y);
        doc.text(`₹${(item.qty * item.price).toFixed(2)}`, 150, y);
        y += 7;
      });

      // Summary
      y += 10;
      doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 20, y);
      doc.text(`GST (18%): ₹${gst.toFixed(2)}`, 20, y + 7);
      doc.setFontSize(12);
      doc.text(`Total: ₹${totalAmount.toFixed(2)}`, 20, y + 14);

      doc.save("invoice.pdf");
    });
  }
});
