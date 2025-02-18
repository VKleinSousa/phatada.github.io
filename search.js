let jsonData = [];
let filteredData = []; // Stores filtered results
let currentSortColumn = null;
let ascendingOrder = true; // Track sorting direction

// Load dataset when user selects it
function loadDataset() {
    let selectedDataset = document.getElementById('datasetChoice').value;

    if (!selectedDataset) {
        alert("Please select a dataset.");
        return;
    }

    fetch(selectedDataset)
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            filteredData = data; // Set filtered data to full dataset initially
            console.log("Dataset Loaded:", jsonData);
            document.getElementById('searchInput').disabled = false;
            createTableHeaders();
            displayResults(filteredData);
        })
        .catch(error => console.error("Error loading dataset:", error));
}

// Create table headers dynamically with sorting functionality
function createTableHeaders() {
    let tableHead = document.getElementById('resultsHead');
    tableHead.innerHTML = "";

    if (jsonData.length === 0) return;

    let firstRow = jsonData[0];
    let tr = document.createElement('tr');

    Object.keys(firstRow).forEach(key => {
        let th = document.createElement('th');
        th.textContent = key.replace(/_/g, " ");
        th.style.cursor = "pointer";
        th.onclick = () => sortTableByColumn(key);
        tr.appendChild(th);
    });

    tableHead.appendChild(tr);
}

// Sort table by a specific column (Preserves filtered search results)
function sortTableByColumn(column) {
    if (currentSortColumn === column) {
        ascendingOrder = !ascendingOrder; // Toggle sorting order
    } else {
        ascendingOrder = true;
        currentSortColumn = column;
    }

    filteredData.sort((a, b) => {
        let valA = a[column] || "";
        let valB = b[column] || "";

        let numA = parseFloat(valA);
        let numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
            return ascendingOrder ? numA - numB : numB - numA;
        }

        return ascendingOrder ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    displayResults(filteredData);
}

// Search function (Filters dataset)
function searchJSON() {
    if (jsonData.length === 0) {
        alert("Please select a dataset first.");
        return;
    }

    let query = document.getElementById('searchInput').value.trim().toLowerCase();
    
    filteredData = jsonData.filter(row => {
        return Object.values(row).some(value =>
            value && value.toString().toLowerCase().includes(query)
        );
    });

    displayResults(filteredData);
}

// Display search results (Keeps sorting)
function displayResults(data) {
    let resultsBody = document.getElementById('resultsBody');
    resultsBody.innerHTML = "";

    if (data.length === 0) {
        resultsBody.innerHTML = `<tr><td colspan="${Object.keys(jsonData[0]).length}">No results found</td></tr>`;
        return;
    }

    data.forEach(row => {
        let tr = document.createElement('tr');

        Object.keys(row).forEach(key => {
            let td = document.createElement('td');

            if (key.toLowerCase().includes("accession code")) {
                let accessionCode = row[key];
                let uniprotLink = `https://www.uniprot.org/uniprotkb?query=${accessionCode}`;
                td.innerHTML = `<a href="${uniprotLink}" target="_blank">${accessionCode}</a>`;
            } else {
                td.textContent = row[key] || "N/A";
            }

            tr.appendChild(td);
        });

        resultsBody.appendChild(tr);
    });
}
