$(document).ready(function () {
  const currencySymbols = {
    AED: "AED ",
    USD: "$",
  };

  let selectedCurrency = "USD";

  function formatNumber(value) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatCurrency(value) {
    if (value == null || isNaN(value))
      return `${currencySymbols[selectedCurrency]}0`;

    return `${currencySymbols[selectedCurrency]}${formatNumber(value)}`;
  }

  function updateRevenueUI(data) {
    if (
      data.totalMonthlyRevenueUplift === 0 ||
      isNaN(data.totalMonthlyRevenueUplift)
    ) {
      $("#ResultNote").fadeOut(300);
    } else {
      $("#ResultNote").fadeIn(300);
      if (data.finalAdSpend === 0 || isNaN(data.finalAdSpend)) {
        $("#adSpendNoteOne").fadeIn(300);
        $("#adSpendNoteTwo").fadeOut(300);
        $("#withAds").fadeOut(300);
      } else {
        $("#adSpendNoteOne").fadeOut(300);
        $("#adSpendNoteTwo").fadeIn(300);
        $("#withAds").fadeIn(300);
      }
    }
  }

  $("input[name='currency']").on("change", function () {
    selectedCurrency = $(this).val();
    calculateROI();
    if (selectedCurrency === "USD") {
      $("#aov").attr("placeholder", "Average Order Value (USD)");
      $("#ad_spend").attr("placeholder", "Ad Spend (USD)");
      $("#cac").attr("placeholder", "Customer Acquisition Cost (USD)");
      $("#flowStackPrice").text("$549");
      $(".growthLiftPrice").text("$4,999");
      $("#flowStackProPrice").text("$999");
    } else {
      $("#aov").attr("placeholder", "Average Order Value (AED)");
      $("#ad_spend").attr("placeholder", "Ad Spend (AED)");
      $("#cac").attr("placeholder", "Customer Acquisition Cost (AED)");
      $("#flowStackPrice").text("AED 1,999");
      $(".growthLiftPrice").text("AED 18,399");
      $("#flowStackProPrice").text("AED 3,699");
    }
  });

  function calculateROI() {
    const visitors = parseFloat($("#visitors").val());
    const cr = parseFloat($("#conversion_rate").val()) / 100;
    const aov = parseFloat($("#aov").val());
    const adSpendRaw = $("#ad_spend").val();
    const cacRaw = $("#cac").val();

    const adSpend = adSpendRaw !== "" ? parseFloat(adSpendRaw) : null;
    const cac = cacRaw !== "" ? parseFloat(cacRaw) : null;

    const isUSD = selectedCurrency === "USD";

    // Cost per click
    const costPerClick = isUSD ? 0.68 : 2.5;
    // Meta chat charges
    const metaChatRate = isUSD ? 0.068 : 0.25;
    const metaRecoveryRate = isUSD ? 0.011 : 0.04;
    const paidMetaRate = isUSD ? 0.068 : 0.25;

    const sales = visitors * cr;
    const currentRevenue = sales * aov;

    const waLeads = visitors * 0.15;
    const waSales = waLeads * 0.05;
    const waRevenue = waSales * aov;

    const recoveredSales = visitors * 0.1 * 0.7 * 0.2;
    const recoveredRevenue = recoveredSales * aov;

    const metaChatCharge = waLeads * metaChatRate;
    const metaRecoveryCharge = recoveredSales * metaRecoveryRate;
    const totalMetaOrganic = metaChatCharge + metaRecoveryCharge;

    let paidWaRevenue = 0;
    let paidMetaCharge = 0;
    let finalAdSpend = 0;

    if (adSpend !== null && !isNaN(adSpend)) {
      finalAdSpend = adSpend;
      const clicks = finalAdSpend / costPerClick;
      const paidWaSales = clicks * 0.07;
      paidWaRevenue = paidWaSales * aov;
      paidMetaCharge = paidWaSales * paidMetaRate;
    } else if (cac !== null && !isNaN(cac)) {
      const paidSales = visitors * cr;
      finalAdSpend = paidSales * cac;
      const clicks = finalAdSpend / 2.5;
      const paidWaSales = clicks * 0.07;
      paidWaRevenue = paidWaSales * aov;
      paidMetaCharge = paidWaSales * paidMetaRate;
    }

    const totalMonthlyRevenueUplift =
      waRevenue + recoveredRevenue + paidWaRevenue + currentRevenue;

    const watsaleCost = isUSD ? 71976 : 265176; // Annual cost in USD or AED
    const watsaleCostMonth = watsaleCost / 12;
    const totalCost =
      totalMetaOrganic + paidMetaCharge + finalAdSpend + watsaleCostMonth;

    const netAnnualUplift = totalMonthlyRevenueUplift * 12 - totalCost * 12;
    const totalAverageAnnualRevenueUplift = totalMonthlyRevenueUplift * 12;
    const oldAnnualRevenue = currentRevenue * 12;
    const performance = totalAverageAnnualRevenueUplift - oldAnnualRevenue;
    const percentage = (performance / oldAnnualRevenue) * 100;

    $("#currentSales").text(formatCurrency(currentRevenue));
    $("#improvedSales").text(formatCurrency(totalMonthlyRevenueUplift));
    $("#extraRevenue").text(formatCurrency(totalAverageAnnualRevenueUplift));
    if (performance <= 0 || isNaN(performance)) {
      $("#roi").text("0%");
    } else {
      $("#roi").text(`${percentage.toFixed(2)}%`);
    }
    $("#annualExtra").text(formatCurrency(performance));
    $("#spendAmount").text(formatCurrency(finalAdSpend));
    $(".currentRevenue").text(formatCurrency(currentRevenue));
    $("#monthlyRevenueWatsale").text(formatCurrency(totalMonthlyRevenueUplift));
    $("#yearlyRevenueWatsale").text(formatCurrency(performance));

    updateRevenueUI({ totalMonthlyRevenueUplift, finalAdSpend });
  }

  $("#ad_spend").on("input", function () {
    $("#cac").prop("disabled", !!$(this).val());
  });

  $("#cac").on("input", function () {
    $("#ad_spend").prop("disabled", !!$(this).val());
  });

  $("#roiForm input").on("input", calculateROI);

  calculateROI();
});
