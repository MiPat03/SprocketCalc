// script.js

// Global variables
let currentResults = null;

// Store unit preferences for each field (updated to default to mm)
let unitPreferences = {
    chainPitch: 'mm',
    chainRollerDiameter: 'mm',
    od: 'mm',
    hubDia: 'mm',
    hubLength: 'mm',
    zz: 'mm',
    pcdManual: 'mm'
};

document.addEventListener('DOMContentLoaded', function () {
    // Handle unit select dropdowns
    document.querySelectorAll('.unit-select').forEach(function (select) {
        select.addEventListener('change', function () {
            const field = this.getAttribute('data-field');
            const unit = this.value;
            
            // Update unit preference
            unitPreferences[field] = unit;
        });
    });

    // Handle PCD option toggle
    document.querySelectorAll('input[name="pcdOption"]').forEach(function (el) {
        el.addEventListener('change', function () {
            if (this.value === 'manual') {
                document.getElementById('pcdManualInput').style.display = 'block';
                document.getElementById('pcdManual').required = true;
            } else {
                document.getElementById('pcdManualInput').style.display = 'none';
                document.getElementById('pcdManual').required = false;
            }
        });
    });

    // Initialize unit conversion listeners
    initializeUnitConversions();
    
    // Initialize PCD functionality
    initializePCD();

    // Form submission
    document.getElementById('calculatorForm').addEventListener('submit', handleFormSubmit);
});

// Initialize unit conversion functionality
function initializeUnitConversions() {
    const unitSelects = document.querySelectorAll('.unit-select');
    unitSelects.forEach(select => {
        select.addEventListener('change', function() {
            const fieldId = this.getAttribute('data-field');
            const input = document.getElementById(fieldId);
            const currentValue = parseFloat(input.value) || 0;
            const currentUnit = this.value;
            
            // Convert the value based on the new unit
            let convertedValue;
            if (currentUnit === 'inches') {
                convertedValue = currentValue * 25.4; // Convert to mm
            } else {
                convertedValue = currentValue / 25.4; // Convert to inches
            }
            
            // Update the input value
            input.value = convertedValue.toFixed(2);
        });
    });
}

// Initialize PCD functionality
function initializePCD() {
    const pcdAuto = document.getElementById('pcdAuto');
    const pcdManual = document.getElementById('pcdManual');
    const pcdAutoValue = document.getElementById('pcdAutoValue');
    const pcdManualInputInline = document.getElementById('pcdManualInputInline');
    
    // PCD option change listeners
    pcdAuto.addEventListener('change', function() {
        if (this.checked) {
            pcdManualInputInline.style.display = 'none';
        }
    });
    
    pcdManual.addEventListener('change', function() {
        if (this.checked) {
            pcdManualInputInline.style.display = 'block';
        }
    });
    
    // Add listeners for chain pitch and number of teeth to update PCD calculation
    const chainPitchInput = document.getElementById('chainPitch');
    const numberOfTeethInput = document.getElementById('numberOfTeeth');
    
    [chainPitchInput, numberOfTeethInput].forEach(input => {
        input.addEventListener('input', function() {
            // Always update the calculated PCD value regardless of selected option
            calculateAndDisplayPCD();
        });
    });
    
    // Initial PCD calculation
    calculateAndDisplayPCD();
}

// Calculate and display PCD automatically
function calculateAndDisplayPCD() {
    console.log('🧮 Calculating PCD automatically...');
    
    const chainPitch = parseFloat(document.getElementById('chainPitch').value) || 0;
    const numberOfTeeth = parseFloat(document.getElementById('numberOfTeeth').value) || 0;
    const chainPitchUnit = document.getElementById('chainPitchUnit').value;
    
    console.log(`📏 Chain Pitch: ${chainPitch} ${chainPitchUnit}`);
    console.log(`🦷 Number of Teeth: ${numberOfTeeth}`);
    
    // Convert chain pitch to mm if needed
    let chainPitchMm = chainPitch;
    if (chainPitchUnit === 'inches') {
        chainPitchMm = chainPitch * 25.4;
        console.log(`  → Converted to: ${chainPitchMm} mm`);
    }
    
    // Calculate PCD: PCD = (Chain Pitch × Number of Teeth) / π
    const pcd = (chainPitchMm * numberOfTeeth) / Math.PI;
    console.log(`🧮 Calculated PCD: (${chainPitchMm} × ${numberOfTeeth}) / π = ${pcd.toFixed(2)} mm`);
    
    // Always display the calculated PCD value regardless of selected option
    const pcdValueSpan = document.querySelector('#pcdAutoValue .pcd-value');
    pcdValueSpan.textContent = `${pcd.toFixed(2)} mm`;
    
    // Log the update
    if (chainPitch > 0 && numberOfTeeth > 0) {
        console.log('✅ PCD calculated value updated in real-time');
    } else {
        console.log('⚠️ PCD calculated value updated (missing values)');
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('🚀 Form submission started');
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    try {
        // Get form data
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        console.log('📋 Raw form data:', data);
        
        // Convert all measurements to mm for backend processing
        const convertedData = convertToMm(data);
        
        console.log('🔄 Converted data (all in mm):', convertedData);
        
        // Send to backend
        console.log('📤 Sending data to backend...');
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(convertedData)
        });
        
        console.log('📥 Backend response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const responseData = await response.json();
        console.log('📊 Backend response data:', responseData);
        
        // Check if the response indicates success
        if (!responseData.success) {
            console.error('❌ Backend returned error:', responseData.error);
            throw new Error(responseData.error || 'Calculation failed');
        }
        
        console.log('✅ Backend calculation successful');
        
        // Store the actual data
        currentResults = responseData.data;
        console.log('💾 Stored results:', currentResults);
        
        // Display results
        console.log('🎨 Displaying results...');
        displayResults(responseData.data);
        
        console.log('🎉 Calculation and display completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during calculation:', error);
        alert('An error occurred while calculating. Please try again.');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Convert all measurements to mm
function convertToMm(data) {
    console.log('🔄 Starting unit conversion...');
    const converted = { ...data };
    
    // List of fields that need conversion
    const measurementFields = [
        'chainPitch', 'chainRollerDiameter', 'od', 'hubDia', 'hubLength', 'zz'
    ];
    
    measurementFields.forEach(field => {
        const value = parseFloat(data[field]) || 0;
        const unit = data[`${field}Unit`] || 'mm';
        
        console.log(`📏 Converting ${field}: ${value} ${unit}`);
        
        if (unit === 'inches') {
            converted[field] = value * 25.4;
            console.log(`  → Converted to: ${converted[field]} mm`);
        } else {
            converted[field] = value;
            console.log(`  → Already in mm: ${converted[field]} mm`);
        }
    });
    
    // Handle PCD conversion
    console.log('🎯 Handling PCD conversion...');
    if (data.pcdOption === 'manual' && data.pcdManual) {
        const pcdValue = parseFloat(data.pcdManual) || 0;
        const pcdUnit = data.pcdManualUnit || 'mm';
        
        console.log(`📐 Manual PCD: ${pcdValue} ${pcdUnit}`);
        
        if (pcdUnit === 'inches') {
            converted.pcd = pcdValue * 25.4;
            console.log(`  → Converted PCD to: ${converted.pcd} mm`);
        } else {
            converted.pcd = pcdValue;
            console.log(`  → PCD already in mm: ${converted.pcd} mm`);
        }
    } else {
        // Use calculated PCD
        const chainPitch = parseFloat(data.chainPitch) || 0;
        const numberOfTeeth = parseFloat(data.numberOfTeeth) || 0;
        const chainPitchUnit = data.chainPitchUnit || 'mm';
        
        let chainPitchMm = chainPitch;
        if (chainPitchUnit === 'inches') {
            chainPitchMm = chainPitch * 25.4;
        }
        
        converted.pcd = (chainPitchMm * numberOfTeeth) / Math.PI;
        console.log(`🧮 Calculated PCD: (${chainPitchMm} × ${numberOfTeeth}) / π = ${converted.pcd} mm`);
    }
    
    console.log('✅ Unit conversion completed:', converted);
    return converted;
}

// Display results
function displayResults(results) {
    console.log('🎨 Starting to display results:', results);
    
    // Display product name
    document.getElementById('productName').textContent = results.product_name;
    console.log('📝 Product name displayed:', results.product_name);
    
    // Display PCD value
    document.getElementById('pcdValue').textContent = results.pcd_mm;
    console.log('📐 PCD value displayed:', results.pcd_mm);
    
    // Display total cost
    document.getElementById('totalCost').textContent = results.total_production_cost;
    console.log('💰 Total cost displayed:', results.total_production_cost);
    
    // Display component breakdown
    console.log('🔧 Displaying component table...');
    displayComponentTable(results.components);
    
    // Display price chart
    console.log('📊 Displaying price chart...');
    displayPriceTable(results.price_chart);
    
    // Show results
    document.getElementById('results').style.display = 'block';
    console.log('✅ Results section made visible');
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    console.log('📜 Scrolled to results section');
}

// Display component table
function displayComponentTable(components) {
    console.log('🔧 Component data received:', components);
    
    const tbody = document.getElementById('componentTableBody');
    tbody.innerHTML = '';
    
    // Handle the backend response format
    const sprocket = components.sprocket;
    const hub = components.hub;
    
    console.log('⚙️ Sprocket data:', sprocket);
    console.log('🔩 Hub data:', hub);
    
    // Add sprocket row
    const sprocketRow = document.createElement('tr');
    sprocketRow.innerHTML = `
        <td><strong>${sprocket.name || 'Sprocket'}</strong></td>
        <td>${sprocket.raw_size.toFixed(2)}</td>
        <td>${sprocket.length.toFixed(2)}</td>
        <td>₹${sprocket.rmc_per_kg.toFixed(2)}</td>
        <td>₹${sprocket.rmc.toFixed(2)}</td>
        <td>₹${sprocket.pc.toFixed(2)}</td>
        <td>₹${sprocket.ht.toFixed(2)}</td>
        <td><strong>₹${sprocket.production_cost.toFixed(2)}</strong></td>
    `;
    tbody.appendChild(sprocketRow);
    console.log('✅ Sprocket row added to table');
    
    // Add hub row
    const hubRow = document.createElement('tr');
    hubRow.innerHTML = `
        <td><strong>${hub.name || 'Hub'}</strong></td>
        <td>${hub.raw_size.toFixed(2)}</td>
        <td>${hub.length.toFixed(2)}</td>
        <td>₹${hub.rmc_per_kg.toFixed(2)}</td>
        <td>₹${hub.rmc.toFixed(2)}</td>
        <td>₹${hub.pc.toFixed(2)}</td>
        <td>₹${hub.ht.toFixed(2)}</td>
        <td><strong>₹${hub.production_cost.toFixed(2)}</strong></td>
    `;
    tbody.appendChild(hubRow);
    console.log('✅ Hub row added to table');
}

// Display price table
function displayPriceTable(priceChart) {
    console.log('📊 Price chart data received:', priceChart);
    
    const tbody = document.getElementById('priceTableBody');
    tbody.innerHTML = '';
    
    priceChart.forEach((item, index) => {
        console.log(`💰 Price item ${index + 1}:`, item);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>₹${item.selling_price.toFixed(2)}</strong></td>
            <td>${item.margin}</td>
            <td><strong>₹${item.net_price.toFixed(2)}</strong></td>
        `;
        tbody.appendChild(row);
    });
    
    console.log(`✅ Added ${priceChart.length} price rows to table`);
}

// Export to PDF
function exportToPDF() {
    if (!currentResults) {
        alert('No results to export. Please calculate first.');
        return;
    }
    
    console.log('📄 Starting PDF generation...');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
        title: `Manufacturing Report - ${currentResults.product_name}`,
        subject: 'Product Cost Analysis & Price Chart',
        author: 'Manufacturing Calculator',
        creator: 'Manufacturing Calculator v1.0'
    });
    
    // Company Header
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MANUFACTURING CALCULATOR', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Product Cost Analysis & Price Chart Generator', 105, 25, { align: 'center' });
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    
    // Report Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MANUFACTURING REPORT', 105, 45, { align: 'center' });
    
    // Product Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUCT INFORMATION', 20, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Get the original form data for product parameters
    const formData = new FormData(document.getElementById('calculatorForm'));
    const originalData = Object.fromEntries(formData);
    
    // Product information with all parameters
    let yPosition = 75;
    doc.text(`Product Name: ${currentResults.product_name}`, 20, yPosition);
    yPosition += 7;
    
    // Get chain pitch with unit
    const chainPitchValue = parseFloat(originalData.chainPitch) || 0;
    const chainPitchUnit = originalData.chainPitchUnit || 'mm';
    doc.text(`Chain Pitch: ${chainPitchValue.toFixed(2)} ${chainPitchUnit}`, 20, yPosition);
    yPosition += 7;
    
    // Get chain roller diameter with unit
    const chainRollerValue = parseFloat(originalData.chainRollerDiameter) || 0;
    const chainRollerUnit = originalData.chainRollerDiameterUnit || 'mm';
    doc.text(`Chain Roller Diameter: ${chainRollerValue.toFixed(2)} ${chainRollerUnit}`, 20, yPosition);
    yPosition += 7;
    
    doc.text(`Number of Teeth: ${originalData.numberOfTeeth}`, 20, yPosition);
    yPosition += 7;
    
    doc.text(`PCD (Pitch Circle Diameter): ${currentResults.pcd_mm} mm`, 20, yPosition);
    yPosition += 7;
    
    // Get OD with unit
    const odValue = parseFloat(originalData.od) || 0;
    const odUnit = originalData.odUnit || 'mm';
    doc.text(`OD (Outer Diameter): ${odValue.toFixed(2)} ${odUnit}`, 20, yPosition);
    yPosition += 7;
    
    // Get HUB DIA with unit
    const hubDiaValue = parseFloat(originalData.hubDia) || 0;
    const hubDiaUnit = originalData.hubDiaUnit || 'mm';
    doc.text(`HUB DIA: ${hubDiaValue.toFixed(2)} ${hubDiaUnit}`, 20, yPosition);
    yPosition += 7;
    
    // Get HUB LENGTH with unit
    const hubLengthValue = parseFloat(originalData.hubLength) || 0;
    const hubLengthUnit = originalData.hubLengthUnit || 'mm';
    doc.text(`HUB LENGTH: ${hubLengthValue.toFixed(2)} ${hubLengthUnit}`, 20, yPosition);
    yPosition += 7;
    
    // Get ZZ with unit
    const zzValue = parseFloat(originalData.zz) || 0;
    const zzUnit = originalData.zzUnit || 'mm';
    doc.text(`ZZ: ${zzValue.toFixed(2)} ${zzUnit}`, 20, yPosition);
    
    // Add a line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition + 10, 190, yPosition + 10);
    
    // Component Cost Breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPONENT COST BREAKDOWN', 20, yPosition + 25);
    
    const componentData = [
        ['Sprocket', currentResults.components.sprocket.raw_size.toFixed(2), currentResults.components.sprocket.length.toFixed(2), 
         `Rs. ${currentResults.components.sprocket.rmc_per_kg.toFixed(2)}`, `Rs. ${currentResults.components.sprocket.rmc.toFixed(2)}`, 
         `Rs. ${currentResults.components.sprocket.pc.toFixed(2)}`, `Rs. ${currentResults.components.sprocket.ht.toFixed(2)}`, 
         `Rs. ${currentResults.components.sprocket.production_cost.toFixed(2)}`],
        ['Hub', currentResults.components.hub.raw_size.toFixed(2), currentResults.components.hub.length.toFixed(2), 
         `Rs. ${currentResults.components.hub.rmc_per_kg.toFixed(2)}`, `Rs. ${currentResults.components.hub.rmc.toFixed(2)}`, 
         `Rs. ${currentResults.components.hub.pc.toFixed(2)}`, `Rs. ${currentResults.components.hub.ht.toFixed(2)}`, 
         `Rs. ${currentResults.components.hub.production_cost.toFixed(2)}`]
    ];
    
    doc.autoTable({
        startY: yPosition + 35,
        head: [['Component', 'RAW SIZE (mm)', 'LENGTH (mm)', 'RMC/KG', 'RMC', 'PC', 'HT', 'Production Cost']],
        body: componentData,
        theme: 'grid',
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 25 },
            1: { cellWidth: 22 },
            2: { cellWidth: 22 },
            3: { cellWidth: 22 },
            4: { cellWidth: 22 },
            5: { cellWidth: 18 },
            6: { cellWidth: 18 },
            7: { fontStyle: 'bold', cellWidth: 31 }
        }
    });
    
    // Price Chart
    const priceChartY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PRICE CHART', 20, priceChartY);
    
    const priceData = currentResults.price_chart.map(item => [
        `Rs. ${item.selling_price.toFixed(2)}`,
        `${item.margin}`,
        `Rs. ${item.net_price.toFixed(2)}`
    ]);
    
    doc.autoTable({
        startY: priceChartY + 10,
        head: [['Selling Price', 'Profit Margin', 'Net Price (incl. 18% GST)']],
        body: priceData,
        theme: 'grid',
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4
        },
        columnStyles: {
            0: { fontStyle: 'bold' },
            2: { fontStyle: 'bold' }
        }
    });
    
    // Footer
    const footerY = doc.lastAutoTable.finalY + 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, 190, footerY);
    
    // Date and Time at bottom
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${dateStr} at ${timeStr}`, 105, footerY + 8, { align: 'center' });
    doc.text('This report was generated automatically by the Manufacturing Calculator system.', 105, footerY + 15, { align: 'center' });
    doc.text('For any queries, please contact the manufacturing department.', 105, footerY + 22, { align: 'center' });
    
    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    console.log('✅ PDF generation completed');
    
    // Save PDF
    const filename = `${currentResults.product_name}_manufacturing_report.pdf`;
    doc.save(filename);
    
    console.log(`📄 PDF saved as: ${filename}`);
}

// Export to Excel
function exportToExcel() {
    if (!currentResults) {
        alert('No results to export. Please calculate first.');
        return;
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Component data
    const componentData = [
        ['Component', 'RAW SIZE (mm)', 'LENGTH (mm)', 'RMC/KG', 'RMC', 'PC', 'HT', 'Production Cost'],
        ['Sprocket', currentResults.components.sprocket.raw_size.toFixed(2), currentResults.components.sprocket.length.toFixed(2), 
         currentResults.components.sprocket.rmc_per_kg.toFixed(2), currentResults.components.sprocket.rmc.toFixed(2), 
         currentResults.components.sprocket.pc.toFixed(2), currentResults.components.sprocket.ht.toFixed(2), 
         currentResults.components.sprocket.production_cost.toFixed(2)],
        ['Hub', currentResults.components.hub.raw_size.toFixed(2), currentResults.components.hub.length.toFixed(2), 
         currentResults.components.hub.rmc_per_kg.toFixed(2), currentResults.components.hub.rmc.toFixed(2), 
         currentResults.components.hub.pc.toFixed(2), currentResults.components.hub.ht.toFixed(2), 
         currentResults.components.hub.production_cost.toFixed(2)]
    ];
    
    const componentWs = XLSX.utils.aoa_to_sheet(componentData);
    XLSX.utils.book_append_sheet(wb, componentWs, 'Component Costs');
    
    // Price chart data
    const priceData = [
        ['Selling Price', 'Margin', 'Net Price (incl. 18% GST)'],
        ...currentResults.price_chart.map(item => [
            item.selling_price.toFixed(2),
            item.margin,
            item.net_price.toFixed(2)
        ])
    ];
    
    const priceWs = XLSX.utils.aoa_to_sheet(priceData);
    XLSX.utils.book_append_sheet(wb, priceWs, 'Price Chart');
    
    // Summary data
    const summaryData = [
        ['Product Information'],
        ['Product Name', currentResults.product_name],
        ['PCD (mm)', currentResults.pcd_mm],
        ['Total Production Cost (₹)', currentResults.total_production_cost],
        [''],
        ['Component Costs'],
        ['Sprocket', currentResults.components.sprocket.production_cost.toFixed(2)],
        ['Hub', currentResults.components.hub.production_cost.toFixed(2)]
    ];
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    
    // Save Excel file
    XLSX.writeFile(wb, `${currentResults.product_name}_report.xlsx`);
} 