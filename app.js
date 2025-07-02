// Format angka ke Rupiah + pembulatan ke satuan terdekat
const formatRupiah = (value) => {
  const MathRound = Math.round(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(MathRound);
};

const cleanInput = (value) => {
  return parseFloat(value) || 0;
};

document.getElementById("loanForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = cleanInput(document.getElementById("amount").value);
  const interest = cleanInput(document.getElementById("interest").value) / 100;
  const tenor = cleanInput(document.getElementById("tenor").value);
  const type = document.getElementById("type").value.toUpperCase();
  const extra = cleanInput(document.getElementById("extra").value || "0");

  if (!amount || !interest || !tenor || amount <= 0 || tenor <= 0) {
    alert("Mohon isi semua data dengan benar!");
    return;
  }

  let resultHTML = `<h3>Hasil Simulasi (${type})</h3>
    <table id="hasilTable">
      <thead>
      <tr>
        <th>Bulan</th>
        <th>Pokok Pinjaman</th>
        <th>Cicilan Pokok</th>
        <th>Bunga</th>
        <th>Angsuran Perbulan</th>
        <th>Saldo Pokok</th>
      </tr>
      </thead>
      <tbody>`;

  let remaining = amount;
  let currentPrincipal = amount;
  let totalInterest = 0, totalInstallment = 0;
  let i = 1;

  while (remaining > 0 && i <= tenor) {
    let bunga = 0, pokok = 0, angsuran = 0;

    switch (type) {
      case "FLAT":
        pokok = amount / tenor;
        bunga = amount * (interest / 12);
        break;
      case "EFEKTIF":
        pokok = amount / tenor;
        bunga = remaining * (interest / 12);
        break;
      case "ANUITAS":
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
      <td>${formatRupiah(currentPrincipal)}</td>
      <td>${formatRupiah(pokok)}</td>
      <td>${formatRupiah(bunga)}</td>
      <td>${formatRupiah(angsuran)}</td>
      <td>${formatRupiah(remaining - pokok)}</td>
    </tr>`;

    remaining -= pokok;
    currentPrincipal -= pokok;
    i++;
  }

  resultHTML += `</tbody></table>
    <p><strong>Total Bunga:</strong> ${formatRupiah(totalInterest)}<br />
    <strong>Total Angsuran:</strong> ${formatRupiah(totalInstallment)}<br />
    <strong>Lama Pelunasan:</strong> ${i - 1} bulan</p>`;

  document.getElementById("result").innerHTML = resultHTML;
});
