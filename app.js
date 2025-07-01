// Format angka ke Rupiah + pembulatan ke satuan terdekat
const formatRupiah = (value) => {
  const rounded = Math.round(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(rounded);
};

// Bersihkan input jadi angka murni
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
    <table>
      <tr>
        <th>Bulan</th>
        <th>Pokok Pinjaman</th>
        <th>Cicilan Pokok</th>
        <th>Bunga</th>
        <th>Angsuran Perbulan</th>
        <th>Saldo Pokok</th>
      </tr>`;

  let remaining = amount;
  let currentPrincipal = amount;
  let totalInterest = 0,
      totalInstallment = 0;
  let i = 1;

  while (remaining > 0 && i <= tenor) {
    let bunga = 0,
        pokok = 0,
        angsuran = 0;

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
        const fixed =
          amount * r * Math.pow(1 + r, tenor) /
          (Math.pow(1 + r, tenor) - 1);
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

  resultHTML += `</table>
    <p><strong>Total Bunga:</strong> ${formatRupiah(totalInterest)}<br />
    <strong>Total Angsuran:</strong> ${formatRupiah(totalInstallment)}<br />
    <strong>Lama Pelunasan:</strong> ${i - 1} bulan</p>`;

  document.getElementById("result").innerHTML = resultHTML;
});

// Ekspor ke PDF
document.getElementById("exportPdf").addEventListener("click", function () {
  const resultDiv = document.getElementById("result");
  if (!resultDiv.innerHTML.trim()) return alert("Tidak ada hasil untuk diekspor!");

  html2canvas(resultDiv).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let position = 10;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    while (heightLeft > pageHeight) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("simulasi-pinjaman.pdf");
  });
});
