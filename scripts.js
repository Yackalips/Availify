let user = localStorage.getItem('user');


function scheduleEvent() {
    document.getElementById('message').textContent;
    triggerPHP("server.php");
    alert('JavaScript Alert: Button Clicked!');
}

async function createHeatmap() {
    if (!user) {
        alert('Please log in to create a heatmap.');
        window.location.href = 'login.html';
        return;
    }
    const firstDay = document.getElementById('day').value;
    const firstHour = document.getElementById('hour').value;
    const firstMinute = document.getElementById('minute').value;
    const firstAMPM = document.getElementById('ampm').value;

    const secondDay = document.getElementById('day2').value;
    const secondHour = document.getElementById('hour2').value;
    const secondMinute = document.getElementById('minute2').value;
    const secondAMPM = document.getElementById('ampm2').value;

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(firstDay);

    let daysUntilNext = targetDayIndex-currentDayIndex;
    if (daysUntilNext <= 0) {
        daysUntilNext += 7; 
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNext);

    const firstMonthDate = nextDate.getMonth()+1; 
    const firstDayDate = nextDate.getDate();
    const length = daysOfWeek.indexOf(secondDay)-daysOfWeek.indexOf(firstDay)+1;
    if(length <= 0) length = 8-daysOfWeek.indexOf(secondDay)-daysOfWeek.indexOf(firstDay);

    const response = await fetch('PHP/createheatmap.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `firstMonthDate=${encodeURIComponent(firstMonthDate)}&firstDayDate=${encodeURIComponent(firstDayDate)}&length=${encodeURIComponent(length)}&firstDay=${encodeURIComponent(firstDay)}&user=${encodeURIComponent(user)}`
    });

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result === true) {
        alert("Successfully created heatmap!");
        window.location.href = 'home.html';
    
    } 
    else {
        alert("An error occured.");
        return;
    }
    
}

async function signup() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    const response = await fetch('PHP/createaccount.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result === true) {
        user = username;
        localStorage.setItem('user', user);
        alert("Successfully created the account "+user+"!");
        window.location.href = 'home.html';
    }
    else {
        alert("An error occured.");
        return;
    }
}

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    const response = await fetch('PHP/checkuser.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });

    if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    if (result === true) {
        user = username;
        localStorage.setItem('user', user);
        alert("Successfully logged in as "+user+"!");
        window.location.href = 'home.html';
    
    } 
    else {
        alert("Invalid username or password.");
        return;
    }


}


async function triggerPHP(filePath, method = 'GET', params = {}) {
    try {
        let url = "PHP/"+filePath;
        const options = {
            method: method.toUpperCase(),
            headers: {}
        };

        if (options.method === 'GET') {
            const queryString = new URLSearchParams(params).toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        } else if (options.method === 'POST') {
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.body = new URLSearchParams(params).toString();
        } else {
            throw new Error('Unsupported HTTP method. Use GET or POST.');
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Network response was not ok (${response.status} ${response.statusText})`);
        }

        const data = await response.text();
        console.log('PHP script executed successfully:', data);
        return data;
    } catch (error) {
        console.error('Error executing PHP script:', error);
        throw error;
    }
}
