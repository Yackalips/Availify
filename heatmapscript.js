
document.addEventListener('DOMContentLoaded', () => {
    if (!user) {
        alert('Please log in to view your heatmap.');
        window.location.href = 'login.html';
        return;
    }

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

        //fetch the cell data
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

        createHeatmapTable(heatmapData, cellData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

    function createHeatmapTable(data, cellData) {
        const heatmapContainer = document.getElementById('heatmapContainer');

        const firstMonthDate = parseInt(data.firstMonthDate);
        const firstDayDate = parseInt(data.firstDayDate);  
        const length = parseInt(data.length);         
        const firstDay = data.firstDay;         

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

                cellIdCounter++;
                row.appendChild(cell);
            }

            table.appendChild(row);
        }

        heatmapContainer.appendChild(table);
    }

    function getColorForCount(count, minCount, maxCount) {
        // rbg colors
        const gray = [67, 82, 102];
        const blue = [100, 149, 237];
        const green = [62, 199, 98];
        const dark_blue = [19, 25, 33];
    
        let color;
        if (count === 0) {
            color = `rgb(${dark_blue.join(',')})`;
        } else if (count === minCount) {
            color = `rgb(${gray.join(',')})`;
        } else if (count === maxCount) {
            color = `rgb(${green.join(',')})`;
        } else {
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

    const copyLinkButton = document.getElementById('copyLinkButton');
    copyLinkButton.addEventListener('click', copyShareableLink);

    function copyShareableLink() {
        const shareableURL = `http://localhost/Availify/sharedheatmap.html?user=${encodeURIComponent(user)}`;

        navigator.clipboard.writeText(shareableURL)
            .then(() => {
                alert('Shareable link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy the link. Please try again.');
            });
    }
});
