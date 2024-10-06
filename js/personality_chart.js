// read sessionStorage data to generate bar chart
    window.onload = function() {
        const percentages = JSON.parse(sessionStorage.getItem('personalityPercentages'));

        if (percentages) 
        {
            const ctx = document.getElementById('personalityChart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar', // 使用柱状图类型
                data: 
                {
                    labels: ['Extraversion', 'Agreeableness', 'Conscientiousness', 'Neuroticism', 'Openness'],
                    datasets: [{
                        label: 'Personality Traits Percentage',
                        data: [percentages.extraversion, percentages.agreeableness, percentages.conscientiousness, percentages.neuroticism, percentages.openness],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: 
                {
                    plugins: {
                        datalabels: {
                            anchor: 'end', // 标签的位置
                            align: 'end',  // 标签的对齐方式
                            formatter: (value) => value + '%', // 显示百分比
                            color: '#000', // 标签颜色
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    scales: 
                    {
                        x: {
                            barThickness: 'flex',
                            maxBarThickness: 40 // 设置最大柱子宽度
                        },
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: 
                            {
                                callback: function(value) {
                                    return value + "%"; // y轴显示百分比
                                }
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels] // 启用 datalabels 插件
            });
        } else {
            alert('No personality percentage data available.');
        }
    };