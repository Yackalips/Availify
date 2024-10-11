
function scheduleEvent() {
    const day = document.getElementById('day').value;
    const hour = document.getElementById('hour').value;
    const minute = document.getElementById('minute').value;
    const ampm = document.getElementById('ampm').value;
    alert(day);
}

function createHeatmap() {
    const startTime = document.getElementById('start-time').value;
    const endTime = document.  getElementById('end-time').value;
    alert('Heatmap created from ' + startTime + ' to ' + endTime);
    window.location.href = 'index.html';
}
