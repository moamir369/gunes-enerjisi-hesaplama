const citySunHours = {
  konya: 7.5,
  ankara: 6.5,
  istanbul: 5.0,
  antalya: 7.8,
  izmir: 7.2
};

const cityNames = {
  konya: "Konya",
  ankara: "Ankara",
  istanbul: "İstanbul",
  antalya: "Antalya",
  izmir: "İzmir",
  custom: "Manuel şehir"
};

document.getElementById("city").addEventListener("change", function () {
  if (this.value !== "custom") {
    document.getElementById("sunHours").value = citySunHours[this.value];
  }

  calculateSolar();
});

document.querySelectorAll("input, select").forEach((element) => {
  element.addEventListener("input", calculateSolar);
});

function formatNumber(value, digits = 2) {
  return Number(value).toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function formatMoney(value) {
  return Number(value).toLocaleString("tr-TR", {
    maximumFractionDigits: 0
  }) + " TL";
}

function calculateSolar() {
  const city = document.getElementById("city").value;
  const sunHours = Number(document.getElementById("sunHours").value);
  const people = Number(document.getElementById("people").value);
  const monthlyPerPerson = Number(document.getElementById("monthlyPerPerson").value);
  const panelPowerW = Number(document.getElementById("panelPower").value);
  const efficiencyPercent = Number(document.getElementById("efficiency").value);
  const electricityPrice = Number(document.getElementById("electricityPrice").value);
  const costPerKw = Number(document.getElementById("costPerKw").value);
  const extraCost = Number(document.getElementById("extraCost").value);
  const panelArea = Number(document.getElementById("panelArea").value);

  if (
    !sunHours ||
    !people ||
    !monthlyPerPerson ||
    !panelPowerW ||
    !efficiencyPercent ||
    !electricityPrice
  ) {
    return;
  }

  const monthlyConsumption = people * monthlyPerPerson;
  const yearlyConsumption = monthlyConsumption * 12;

  const panelPowerKw = panelPowerW / 1000;
  const efficiency = efficiencyPercent / 100;

  const dailyPanelProduction = panelPowerKw * sunHours * efficiency;
  const yearlyPanelProductionTheoretical = dailyPanelProduction * 365;

  // Ek güvenlik katsayısı: kapalı hava, mevsimsel farklar ve üretim dalgalanmaları için.
  const yearlyPanelProductionSafe = yearlyPanelProductionTheoretical * 0.89;

  const panelCountRaw = yearlyConsumption / yearlyPanelProductionSafe;
  const panelCount = Math.ceil(panelCountRaw);

  const totalProduction = panelCount * yearlyPanelProductionSafe;
  const installedPowerKw = panelCount * panelPowerKw;
  const totalArea = panelCount * panelArea * 1.2;

  const baseCost = installedPowerKw * costPerKw;
  const totalCost = baseCost + extraCost;

  const yearlyBill = yearlyConsumption * electricityPrice;
  const monthlyBill = yearlyBill / 12;
  const payback = totalCost / yearlyBill;

  document.getElementById("yearlyConsumptionBox").textContent =
    formatNumber(yearlyConsumption, 0) + " kWh";

  document.getElementById("panelCountBox").textContent =
    panelCount + " adet";

  document.getElementById("installedPowerBox").textContent =
    formatNumber(installedPowerKw, 2) + " kW";

  document.getElementById("paybackBox").textContent =
    formatNumber(payback, 1) + " yıl";

  document.getElementById("calculationDetails").innerHTML = `
    <h3>1. Tüketim hesabı</h3>
    <p>
      ${cityNames[city]} için ${people} kişilik aile seçilmiştir.
      Kişi başı aylık tüketim ${monthlyPerPerson} kWh alınmıştır.
    </p>

    <div class="formula">
      E<sub>aylık</sub> = kişi sayısı × kişi başı tüketim =
      ${people} × ${monthlyPerPerson} = ${formatNumber(monthlyConsumption, 0)} kWh/ay
    </div>

    <div class="formula">
      E<sub>yıllık</sub> = E<sub>aylık</sub> × 12 =
      ${formatNumber(monthlyConsumption, 0)} × 12 =
      ${formatNumber(yearlyConsumption, 0)} kWh/yıl
    </div>

    <h3>2. Panel üretim hesabı</h3>

    <div class="formula">
      P<sub>panel</sub> = ${panelPowerW} W = ${formatNumber(panelPowerKw, 2)} kW
    </div>

    <div class="formula">
      η = ${efficiencyPercent}% = ${formatNumber(efficiency, 2)}
    </div>

    <div class="formula">
      E<sub>günlük</sub> = P × t × η =
      ${formatNumber(panelPowerKw, 2)} × ${sunHours} × ${formatNumber(efficiency, 2)}
      = ${formatNumber(dailyPanelProduction, 2)} kWh/gün
    </div>

    <div class="formula">
      E<sub>yıllık teorik</sub> =
      ${formatNumber(dailyPanelProduction, 2)} × 365 =
      ${formatNumber(yearlyPanelProductionTheoretical, 2)} kWh/yıl
    </div>

    <div class="formula">
      E<sub>güvenli</sub> =
      ${formatNumber(yearlyPanelProductionTheoretical, 2)} × 0.89 =
      ${formatNumber(yearlyPanelProductionSafe, 2)} kWh/yıl
    </div>

    <h3>3. Panel sayısı</h3>

    <div class="formula">
      N = E<sub>aile</sub> / E<sub>panel</sub> =
      ${formatNumber(yearlyConsumption, 0)} / ${formatNumber(yearlyPanelProductionSafe, 2)}
      = ${formatNumber(panelCountRaw, 2)}
    </div>

    <p>
      Panel sayısı tam sayı olmalıdır. Bu yüzden ${formatNumber(panelCountRaw, 2)}
      yukarı yuvarlanır.
    </p>

    <div class="ok">Gerekli panel sayısı: ${panelCount} adet</div>

    <h3>4. Kurulu güç ve alan</h3>

    <div class="formula">
      P<sub>toplam</sub> = ${panelCount} × ${formatNumber(panelPowerKw, 2)}
      = ${formatNumber(installedPowerKw, 2)} kW
    </div>

    <div class="formula">
      A<sub>gerekli</sub> = ${panelCount} × ${panelArea} × 1.20
      = ${formatNumber(totalArea, 2)} m²
    </div>

    <div class="ok">
      Yıllık üretim yaklaşık ${formatNumber(totalProduction, 0)} kWh olur.
      Bu değer yıllık tüketim olan ${formatNumber(yearlyConsumption, 0)} kWh değerini karşılar.
    </div>
  `;

  document.getElementById("costTable").innerHTML = `
    <tr>
      <td>Kurulum maliyeti</td>
      <td>${formatNumber(installedPowerKw, 2)} kW × ${formatMoney(costPerKw)}</td>
      <td>${formatMoney(baseCost)}</td>
    </tr>

    <tr>
      <td>Ek maliyet</td>
      <td>Montaj, kablo, sigorta vb.</td>
      <td>${formatMoney(extraCost)}</td>
    </tr>

    <tr>
      <th>Toplam yatırım</th>
      <th>${formatMoney(baseCost)} + ${formatMoney(extraCost)}</th>
      <th>${formatMoney(totalCost)}</th>
    </tr>

    <tr>
      <td>Yıllık elektrik faturası</td>
      <td>${formatNumber(yearlyConsumption, 0)} kWh × ${electricityPrice} TL/kWh</td>
      <td>${formatMoney(yearlyBill)}</td>
    </tr>

    <tr>
      <td>Aylık ortalama fatura</td>
      <td>${formatMoney(yearlyBill)} / 12</td>
      <td>${formatMoney(monthlyBill)}</td>
    </tr>

    <tr>
      <th>Amortisman</th>
      <th>${formatMoney(totalCost)} / ${formatMoney(yearlyBill)}</th>
      <th>${formatNumber(payback, 2)} yıl</th>
    </tr>
  `;

  const savingTable = document.getElementById("savingTable");
  savingTable.innerHTML = "";

  for (let year = 1; year <= 10; year++) {
    const cumulative = yearlyBill * year;
    const status =
      cumulative >= totalCost
        ? "Sistem maliyeti karşılandı"
        : "Yatırım geri dönüyor";

    savingTable.innerHTML += `
      <tr>
        <td>${year}</td>
        <td>${formatMoney(yearlyBill)}</td>
        <td>${formatMoney(cumulative)}</td>
        <td>${status}</td>
      </tr>
    `;
  }

  document.getElementById("chartComment").innerHTML = `
    Grafikte birikimli tasarruf her yıl ${formatMoney(yearlyBill)} artar.
    Sistem maliyeti ${formatMoney(totalCost)} seviyesindedir.
    Birikimli tasarruf bu değeri geçtiğinde sistem kendini amorti etmiş olur.
    Sonuç: yaklaşık <b>${formatNumber(payback, 1)} yıl</b>.
  `;

  drawChart(totalCost, yearlyBill, payback);
}

function drawChart(totalCost, yearlySaving, payback) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  const padding = 60;
  const maxYears = 10;
  const maxY = Math.max(yearlySaving * maxYears, totalCost) * 1.15;

  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  function xPosition(year) {
    return padding + (year / maxYears) * chartWidth;
  }

  function yPosition(value) {
    return canvas.height - padding - (value / maxY) * chartHeight;
  }

  function drawLine(x1, y1, x2, y2, color, width = 2, dashed = false) {
    ctx.beginPath();
    ctx.setLineDash(dashed ? [8, 6] : []);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawText(text, x, y, size = 13, color = "#222") {
    ctx.fillStyle = color;
    ctx.font = `${size}px Arial`;
    ctx.fillText(text, x, y);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawLine(padding, padding, padding, canvas.height - padding, "#333", 2);
  drawLine(padding, canvas.height - padding, canvas.width - padding, canvas.height - padding, "#333", 2);

  for (let i = 0; i <= maxYears; i++) {
    drawLine(xPosition(i), padding, xPosition(i), canvas.height - padding, "#e5e5e5", 1);
    drawText(i, xPosition(i) - 4, canvas.height - 35, 12);
  }

  for (let i = 0; i <= 5; i++) {
    const value = (maxY / 5) * i;
    drawLine(padding, yPosition(value), canvas.width - padding, yPosition(value), "#e5e5e5", 1);
    drawText(Math.round(value).toLocaleString("tr-TR"), 8, yPosition(value) + 4, 12);
  }

  drawLine(padding, yPosition(totalCost), canvas.width - padding, yPosition(totalCost), "#e67e22", 3, true);
  drawText("Sistem Maliyeti", xPosition(6), yPosition(totalCost) - 10, 14, "#e67e22");

  ctx.beginPath();
  for (let year = 0; year <= maxYears; year++) {
    const x = xPosition(year);
    const y = yPosition(year * yearlySaving);

    if (year === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle = "#2980b9";
  ctx.lineWidth = 3;
  ctx.stroke();

  for (let year = 0; year <= maxYears; year++) {
    ctx.beginPath();
    ctx.arc(xPosition(year), yPosition(year * yearlySaving), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#2980b9";
    ctx.fill();
  }

  if (payback <= maxYears) {
    drawLine(xPosition(payback), padding, xPosition(payback), canvas.height - padding, "#27ae60", 2, true);
    drawText("Amortisman ≈ " + formatNumber(payback, 1) + " yıl", xPosition(payback) + 8, padding + 25, 14, "#27ae60");
  }

  drawText("Amortisman Grafiği", 350, 30, 18);
  drawText("Yıl", canvas.width / 2, canvas.height - 10, 15);
  drawText("Tutar (TL)", 10, 25, 15);
  drawText("Birikimli Tasarruf", 650, 60, 14, "#2980b9");
  drawText("Sistem Maliyeti", 650, 82, 14, "#e67e22");
}

calculateSolar();
