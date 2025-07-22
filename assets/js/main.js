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
    $("#currentRevenue").text(formatCurrency(currentRevenue));
    $("#monthlyRevenueWatsale").text(formatCurrency(totalMonthlyRevenueUplift));
    $("#yearlyRevenueWatsale").text(formatCurrency(performance));
  }

  $("#ad_spend").on("input", function () {
    $("#cac").prop("disabled", !!$(this).val());
  });

  $("#cac").on("input", function () {
    $("#ad_spend").prop("disabled", !!$(this).val());
  });

  $("#roiForm input").on("input", calculateROI);

  calculateROI();

  // PDF Generation & Download Functionality
  document.getElementById("downloadPdf").addEventListener("click", function () {
    const target = document.getElementById("roi-results");

    html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Brand Header
      const logoUrl = "../../assets/img/logo.png";
      const titleText = "Watsale | ARP Report";
      const siteUrl = "www.watsale.com";

      const marginX = 10;
      const contentYStart = 35; // leave space for branding

      // Add logo (async)
      const imgProps = pdf.getImageProperties(imgData);
      const contentWidth = pageWidth - 2 * marginX;
      const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Load logo image and draw everything
      const logo = new Image();
      logo.crossOrigin = "anonymous";
      logo.src = logoUrl;

      logo.onload = () => {
        const logoTargetWidth = 30; // desired width in mm

        // Get original image dimensions
        const imgRatio = logo.height / logo.width;
        const logoWidth = logoTargetWidth;
        const logoHeight = logoWidth * imgRatio;

        const centerX = pageWidth / 2;
        const logoX = centerX - logoWidth / 2;

        pdf.addImage(logo, "PNG", logoX, 10, logoWidth, logoHeight);

        // Title just below logo
        const titleText = "Watsale | ARP Report";
        pdf.setFont("helvetica", "bold"); // or use 'times', 'courier', etc.
        pdf.setFontSize(12);
        pdf.setTextColor("#333333");

        const textWidth = pdf.getTextWidth(titleText);
        const textX = centerX - textWidth / 2;

        const titleY = 10 + logoHeight + 5; // 5mm below logo
        pdf.text(titleText, textX, titleY);

        // Content area starts after header
        const contentYStart = titleY + 10;

        pdf.addImage(
          imgData,
          "PNG",
          marginX,
          contentYStart,
          contentWidth,
          contentHeight
        );

        // Footer
        pdf.setFontSize(9);
        pdf.setTextColor("#999999");
        pdf.text(`Generated on ${formattedDate}`, marginX, pageHeight - 10);
        pdf.text(`${siteUrl}`, pageWidth - marginX - 40, pageHeight - 10);

        pdf.save("Watsale_ARP_Report.pdf");
      };

      logo.onerror = () => {
        alert("Failed to load logo image for PDF export.");
      };
    });
  });
});
