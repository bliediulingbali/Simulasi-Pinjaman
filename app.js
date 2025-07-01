document.getElementById("loanForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("amount").value);
  const interest = parseFloat(document.getElementById("interest").value) / 100;
  const tenor = parseInt(document.getElementById("tenor").value);
  const type = document.getElementById("type").value.toUpperCase();
  const extra = parseFloat(document.getElementById("extra").value || 0);

  if (amount <= 0 || interest < 0 || tenor <= 0) {
    alert("Mohon isi semua data dengan benar!");
    return;
  }

  let resultHTML = `<h3>Hasil Simulasi (${type})</h3>
    <table>
      <tr>
        <th>Bulan</th>
        <th>Pokok</th>
        <th>Bunga</th>
        <th>Angsuran</th>
        <th>Saldo</th>
      </tr>`;

  let remaining = amount;
  let totalInterest = 0, totalInstallment = 0;
  let i = 1;

  while (remaining > 0 && i <= tenor) {
    let bunga = 0, pokok = 0, angsuran = 0;

    switch (type) {
      case "FLAT":
        pokok = amount / tenor;
        bunga = amount * (interest / 12);
        break;
      case "SLIDING":
        pokok = amount / tenor;
        bunga = remaining * (interest / 12);
        break;
      case "EFEKTIF":
        const r = interest / 12;
        const fixed = amount * r * Math.pow(1 + r, tenor) / (Math.pow(1 + r, tenor) - 1);
        bunga = remaining * r;
        pokok = fixed - bunga;
        break;
    }

    pokok += extra;
    if (pokok > remaining) pokok = remaining;
    angsuran = pokok + bunga;

    totalInterest += bunga;
    totalInstallment += angsuran;

    resultHTML += `<tr>
      <td>${i}</td>
      <td>Rp ${pokok.toFixed(0)}</td>
      <td>Rp ${bunga.toFixed(0)}</td>
      <td>Rp ${angsuran.toFixed(0)}</td>
      <td>Rp ${(remaining - pokok).toFixed(0)}</td>
    </tr>`;

    remaining -= pokok;
    i++;
  }

  resultHTML += `</table>
    <p><strong>Total Bunga:</strong> Rp ${totalInterest.toFixed(0)}<br />
    <strong>Total Angsuran:</strong> Rp ${totalInstallment.toFixed(0)}<br />
    <strong>Lama Pelunasan:</strong> ${i - 1} bulan</p>`;

  document.getElementById("result").innerHTML = resultHTML;
});
