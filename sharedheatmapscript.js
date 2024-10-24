document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user');

    if (!user) {
        alert('No user specified in the URL.');
        return;
    }

    const selectedCells = new Set();
    let heatmapData = {};
    let cellData = {};

    fetch('PHP/getHeatmapData.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `user=${encodeURIComponent(user)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        heatmapData = data;

        return fetch('PHP/getHeatmapCellData.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `user=${encodeURIComponent(user)}`
        });
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            cellData = {};
        } else {
            cellData = data.cellData;
        }

        const pageTitle = document.getElementById('pageTitle');
        pageTitle.innerText = `${user}'s Heatmap`;

        createHeatmapTable(heatmapData, cellData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

    function createHeatmapTable(heatmapData, cellData) {
        const heatmapContainer = document.getElementById('heatmapContainer');

        const firstMonthDate = parseInt(heatmapData.firstMonthDate);
        const firstDayDate = parseInt(heatmapData.firstDayDate);
        const length = parseInt(heatmapData.length);
        const firstDay = heatmapData.firstDay;

        const table = document.createElement('table');
        table.setAttribute('border', '1');
        table.setAttribute('cellspacing', '0');
        table.setAttribute('cellpadding', '5');

        const headerRow = document.createElement('tr');
        const emptyHeaderCell = document.createElement('th');
        headerRow.appendChild(emptyHeaderCell);

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let startDayIndex = daysOfWeek.indexOf(firstDay);

        const startDate = new Date();
        startDate.setFullYear(new Date().getFullYear());
        startDate.setMonth(firstMonthDate - 1);
        startDate.setDate(firstDayDate);

        while (startDate.getDay() !== startDayIndex) {
            startDate.setDate(startDate.getDate() + 1);
        }

        for (let i = 0; i < length; i++) {
            let dayIndex = (startDayIndex + i) % 7;
            let dayName = daysOfWeek[dayIndex];

            let currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            let month = currentDate.getMonth() + 1;
            let date = currentDate.getDate();

            const dayCell = document.createElement('th');
            dayCell.innerText = `${dayName} (${month}/${date})`;
            headerRow.appendChild(dayCell);
        }

        table.appendChild(headerRow);

        const counts = Object.values(cellData).map(Number);
        const maxCount = counts.length > 0 ? Math.max(...counts) : 1;
        const minCount = counts.length > 0 ? Math.min(...counts) : 0;

        let cellIdCounter = 1; 

        for (let hour = 1; hour <= 24; hour++) {
            const row = document.createElement('tr');

            const timeCell = document.createElement('td');
            let displayHour = hour % 12 === 0 ? 12 : hour % 12;
            let ampm = hour < 12 || hour === 24 ? 'AM' : 'PM';
            timeCell.innerText = `${displayHour} ${ampm}`;
            row.appendChild(timeCell);

            for (let i = 0; i < length; i++) {
                const cell = document.createElement('td');
                cell.innerText = '';
                cell.dataset.cellId = cellIdCounter;

                const count = cellData[cellIdCounter] || 0;

                const color = getColorForCount(count, minCount, maxCount);
                cell.style.backgroundColor = color;

                cell.addEventListener('click', function() {
                    const cellId = this.dataset.cellId;
                    if (selectedCells.has(cellId)) {
                        selectedCells.delete(cellId);
                        this.classList.remove('selected')
                    }
                    else {
                        selectedCells.add(cellId);
                        this.classList.add('selected');
                    }
                });

                cellIdCounter++;
                row.appendChild(cell);
            }

            table.appendChild(row);
        }

        // Append the table to the container
        heatmapContainer.appendChild(table);
    }

    function getColorForCount(count, minCount, maxCount) {
        // Define RGB colors
        const gray = [67, 82, 102];
        const blue = [100, 149, 237];
        const green = [62, 199, 98];
        const dark_blue = [19, 25, 33];
    
        let color;
        if (count === 0) {
            color = `rgb(${dark_blue.join(',')})`; // No data as RGB
        } 
        else if (count === minCount) {
            color = `rgb(${gray.join(',')})`;
        } 
        else if (count === maxCount) {
            color = `rgb(${green.join(',')})`;
        } 
        else {
            const t = (count - minCount) / (maxCount - minCount);
            color = interpolateColor(gray, green, t);
        }
        return color;
    }

    function interpolateColor(color1, color2, t) {
        const r = Math.round(color1[0] + (color2[0] - color1[0]) * t);
        const g = Math.round(color1[1] + (color2[1] - color1[1]) * t);
        const b = Math.round(color1[2] + (color2[2] - color1[2]) * t);
        return `rgb(${r}, ${g}, ${b})`;
    }

    const submitButton = document.getElementById('submitTimesButton');
    submitButton.addEventListener('click', submitSelectedTimes);

    function submitSelectedTimes() {
        if (selectedCells.size === 0) {
            alert('Please select at least one time slot.');
            return;
        }

        const cellIds = Array.from(selectedCells);

        fetch('PHP/submitTimes.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `user=${encodeURIComponent(user)}&cellIds=${encodeURIComponent(JSON.stringify(cellIds))}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Your times have been submitted successfully!');
                selectedCells.clear();
                const selectedElements = document.querySelectorAll('.selected');
                selectedElements.forEach(cell => cell.classList.remove('selected'));

                location.reload();
            } else {
                alert('Error submitting times: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error submitting times:', error);
            alert('An error occurred while submitting your times.');
        });
    }
});
