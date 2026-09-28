document.addEventListener("DOMContentLoaded", function () {
    /* CHART ELEMENTS */
    const chartContainer   = document.getElementById("messageTrafficChart");
    const chartDataElement = document.getElementById("statisticsChartData");

    if (!chartContainer || !chartDataElement) {
        return;
    }

    /* READ CHART DATA */
    let chartData;

    try {
        chartData = JSON.parse(chartDataElement.textContent);
    } catch (error) {
        chartContainer.textContent = "Grafik verileri okunamadı.";
        return;
    }

    const labels = chartData.labels;
    const values = chartData.values;

    if (!Array.isArray(labels) || !Array.isArray(values) || labels.length !== values.length) {
        chartContainer.textContent = "Grafik verileri geçersiz.";
        return;
    }

    /* CALCULATE MAXIMUM VALUE */
    const maxValue = Math.max(1, ...values);

    /* CLEAR CHART */
    chartContainer.innerHTML = "";

    /* CREATE CHART COLUMNS */
    labels.forEach(function (label, index) {
        const count  = Number(values[index]) || 0;
        const height = count > 0 ? Math.max((count / maxValue) * 100, 3) : 0;

        /* COLUMN */
        const column = document.createElement("div");
        column.className = "statistics-chart-column";

        /* VALUE */
        const valueElement = document.createElement("span");
        valueElement.className   = "statistics-chart-value";
        valueElement.textContent = count.toLocaleString("tr-TR");

        /* BAR AREA */
        const barArea = document.createElement("div");
        barArea.className = "statistics-chart-bar-area";

        /* BAR */
        const bar = document.createElement("div");
        bar.className     = "statistics-chart-bar";
        bar.style.height  = `${height}%`;
        bar.dataset.count = count;
        bar.setAttribute("aria-label", `${label}: ${count} mesaj`);

        /* LABEL */
        const labelElement = document.createElement("span");
        labelElement.className   = "statistics-chart-label";
        labelElement.textContent = label;

        /* BUILD COLUMN */
        barArea.appendChild(bar);
        column.appendChild(valueElement);
        column.appendChild(barArea);
        column.appendChild(labelElement);

        chartContainer.appendChild(column);
    });
});