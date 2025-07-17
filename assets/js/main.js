$(document).ready(function () {
  // Mutual disabling logic
  $("#ad_spend").on("input", function () {
    if ($(this).val()) {
      $("#cac").prop("disabled", true);
    } else {
      $("#cac").prop("disabled", false);
    }
  });

  $("#cac").on("input", function () {
    if ($(this).val()) {
      $("#ad_spend").prop("disabled", true);
    } else {
      $("#ad_spend").prop("disabled", false);
    }
  });

  function calculateROI() {
    // Input values
    const visitors = parseFloat($("#visitors").val());
    const cr = parseFloat($("#conversion_rate").val()) / 100;
    const aov = parseFloat($("#aov").val());
    const adSpendRaw = $("#ad_spend").val();
    const cacRaw = $("#cac").val();

    const adSpend = adSpendRaw !== "" ? parseFloat(adSpendRaw) : null;
    const cac = cacRaw !== "" ? parseFloat(cacRaw) : null;

    // Step 1: Current revenue
    const sales = visitors * cr;
    const currentRevenue = sales * aov;

    // Step 2: WhatsApp chat sales (organic)
    const waLeads = visitors * 0.15;
    const waSales = waLeads * 0.05;
    const waRevenue = waSales * aov;

    // Step 3: Cart recovery revenue
    const recoveredSales = visitors * 0.1 * 0.7 * 0.2;
    const recoveredRevenue = recoveredSales * aov;

    // Step 4: Meta charges for WhatsApp
    const metaChatCharge = waLeads * 0.25;
    const metaRecoveryCharge = recoveredSales * 0.04;
    const totalMetaOrganic = metaChatCharge + metaRecoveryCharge;

    // Step 5: Paid campaign projections
    let paidWaRevenue = 0;
    let paidMetaCharge = 0;
    let finalAdSpend = 0;

    if (adSpend !== null && !isNaN(adSpend)) {
      finalAdSpend = adSpend;

      // Estimate number of clicks (clicks = totalAdSpend / costPerClick;)
      const clicks = finalAdSpend / 2.5;

      // Estimate WhatsApp sales from paid traffic
      const paidWaSales = clicks * 0.07;

      paidWaRevenue = paidWaSales * aov;
      paidMetaCharge = paidWaSales * 0.25;
    } else if (cac !== null && !isNaN(cac)) {
      // Estimate # of paid conversions from existing visitor flow
      const paidSales = visitors * cr;

      // Estimate how much ad spend is required to acquire those sales
      finalAdSpend = paidSales * cac;

      // Simulate clicks and WhatsApp conversion from this spend
      const clicks = finalAdSpend / 2.5;
      const paidWaSales = clicks * 0.07;

      paidWaRevenue = paidWaSales * aov;
      paidMetaCharge = paidWaSales * 0.25;
    }

    // Step 6: Totals
    const totalMonthlyRevenueUplift =
      waRevenue + recoveredRevenue + paidWaRevenue + currentRevenue;

    const watsaleCost = 86987;
    const watsaleCostMonth = watsaleCost / 12;
    const totalCost =
      totalMetaOrganic + paidMetaCharge + finalAdSpend + watsaleCostMonth;
    const netAnnualUplift = totalMonthlyRevenueUplift * 12 - totalCost * 12;

    const totalAverageAnnualRevenueUplift = totalMonthlyRevenueUplift * 12;

    const oldAnnualRevenue = currentRevenue * 12;

    const performance = totalAverageAnnualRevenueUplift - oldAnnualRevenue;

    const percentage = (performance / oldAnnualRevenue) * 100;

    // Update DOM
    $("#currentSales").text(`AED ${currentRevenue.toFixed(2)}`);
    $("#improvedSales").text(`AED ${totalMonthlyRevenueUplift.toFixed(2)}`);
    $("#extraRevenue").text(
      `AED ${totalAverageAnnualRevenueUplift.toFixed(2)}`
    );
    $("#roi").text(`${percentage.toFixed(2)}%`);
    $("#annualExtra").text(`AED ${performance.toFixed(2)}`);

    const currentPerformance = finalAdSpend - currentRevenue;

    if (currentPerformance > 0) {
      $("#lossAlert").fadeIn(500);
      $("#lossAlert").text(
        `You Are Currently Spending AED ${finalAdSpend.toFixed(
          0
        )} To Generate AED ${currentRevenue.toFixed(0)}.!!`
      );
    } else {
      $("#lossAlert").fadeOut(500);
    }
  }

  $("#roiForm input").on("input", calculateROI);

  calculateROI();
});
