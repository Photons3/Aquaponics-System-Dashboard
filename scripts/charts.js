var ctx = document.getElementById('temp-chart').getContext('2d');

var chart = new Chart(ctx, {
    // Type of chart
    type: 'line',

    // Data for data set
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: '#58ACFA',
            borderColor: 'rgb(255, 99, 132)',
            data: [0, 10, 5, 2, 20, 30, 45]
        }]
    }
})