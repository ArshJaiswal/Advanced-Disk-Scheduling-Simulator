document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme toggle
    const themeToggle = document.querySelector('.btn-theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Disk scheduling data
    let requests = [];
    let currentHeadPosition = 50;
    let isSimulating = false;
    let comparisonChart = null;
    
    // DOM Elements
    const requestPositionInput = document.getElementById('request-position');
    const initialHeadInput = document.getElementById('initial-head');
    const addRequestBtn = document.getElementById('add-request');
    const simulateBtn = document.getElementById('simulate');
    const resetBtn = document.getElementById('reset');
    const requestTableBody = document.getElementById('request-table-body');
    const diskTrack = document.getElementById('disk-track');
    const diskHead = document.getElementById('disk-head');
    const seekSequenceElement = document.getElementById('seek-sequence');
    const totalSeekTimeElement = document.getElementById('total-seek-time');
    const avgSeekTimeElement = document.getElementById('avg-seek-time');
    const throughputElement = document.getElementById('throughput');
    
    // Add request event
    addRequestBtn.addEventListener('click', function() {
        if (isSimulating) return;
        
        const position = parseInt(requestPositionInput.value);
        if (isNaN(position) || position < 0 || position > 199) {
            alert('Please enter a valid position between 0 and 199');
            return;
        }
        
        requests.push(position);
        updateRequestTable();
        renderDiskRequests();
        requestPositionInput.value = '';
    });
    
    // Simulate event
    simulateBtn.addEventListener('click', async function() {
        if (isSimulating || requests.length === 0) return;
        
        const algorithm = document.getElementById('algorithm').value;
        currentHeadPosition = parseInt(initialHeadInput.value) || 50;
        const initialDirection = document.getElementById('initial-direction').value;
        
        // Run simulation
        const result = simulateDiskScheduling(algorithm, currentHeadPosition, initialDirection);
        
        // Display results with animation
        await animateDiskMovement(result.seekSequence, currentHeadPosition);
        displayResults(result);
        updateComparisonChart(result);
    });
    
    // Reset event
    resetBtn.addEventListener('click', function() {
        if (isSimulating) return;
        
        requests = [];
        currentHeadPosition = parseInt(initialHeadInput.value) || 50;
        updateRequestTable();
        renderDiskRequests();
        seekSequenceElement.innerHTML = '';
        totalSeekTimeElement.textContent = '0';
        avgSeekTimeElement.textContent = '0';
        throughputElement.textContent = '0';
        
//      Reset disk head position
        diskHead.style.left = `${(currentHeadPosition / 199) * 100}%`;
        
        // Clear chart if exists
        if (comparisonChart) {
            comparisonChart.destroy();
        }
    });
    
    // Helper functions
    function toggleTheme() {
        const body = document.body;
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    function updateRequestTable() {
        requestTableBody.innerHTML = '';
        requests.forEach((request, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${request}</td>
                <td><button class="btn btn-sm btn-danger remove-request" data-index="${index}"><i class="fas fa-trash-alt"></i></button></td>
            `;
            requestTableBody.appendChild(row);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-request').forEach(button => {
            button.addEventListener('click', function() {
                if (isSimulating) return;
                const index = parseInt(this.getAttribute('data-index'));
                requests.splice(index, 1);
                updateRequestTable();
                renderDiskRequests();
            });
        });
    }
    
    function renderDiskRequests() {
        // Clear existing requests (except head)
        const existingRequests = document.querySelectorAll('.disk-request');
        existingRequests.forEach(req => req.remove());
        
        // Add new requests
        requests.forEach(position => {
            const requestElement = document.createElement('div');
            requestElement.className = 'disk-request';
            requestElement.style.left = `${(position / 199) * 100}%`;
            diskTrack.appendChild(requestElement);
        });
        
        // Update head position
        diskHead.style.left = `${(currentHeadPosition / 199) * 100}%`;
    }
    

//           Algorithms


    function simulateDiskScheduling(algorithm, initialHead, initialDirection) {
        let seekSequence = [];
        let totalSeekTime = 0;
        
        // Make a copy of requests to work with
        let requestQueue = [...requests];
        
        switch(algorithm) {
            case 'fcfs':
                // First Come First Serve
                seekSequence = [...requestQueue];
                totalSeekTime = calculateTotalSeekTime(initialHead, seekSequence);
                break;
                
            case 'sstf':
                // Shortest Seek Time First
                seekSequence = sstfAlgorithm(initialHead, requestQueue);
                totalSeekTime = calculateTotalSeekTime(initialHead, seekSequence);
                break;
                
            case 'scan':
                // SCAN (Elevator)
                seekSequence = scanAlgorithm(initialHead, requestQueue, initialDirection);
                totalSeekTime = calculateTotalSeekTime(initialHead, seekSequence);
                break;
                
            case 'cscan':
                // C-SCAN (Circular SCAN)
                seekSequence = cscanAlgorithm(initialHead, requestQueue, initialDirection);
                totalSeekTime = calculateTotalSeekTime(initialHead, seekSequence);
                break;
        }
        
        const avgSeekTime = totalSeekTime / seekSequence.length;
        const throughput = seekSequence.length / totalSeekTime;
        
        return {
            algorithm,
            seekSequence,
            totalSeekTime,
            avgSeekTime,
            throughput
        };
    }
//     sstf    
    function sstfAlgorithm(initialHead, requestQueue) {
        let seekSequence = [];
        let currentHead = initialHead;
        
        while (requestQueue.length > 0) {
            // Find request with shortest seek time
            let minSeek = Infinity;
            let nextIndex = 0;
            
            for (let i = 0; i < requestQueue.length; i++) {
                const seek = Math.abs(requestQueue[i] - currentHead);
                if (seek < minSeek) {
                    minSeek = seek;
                    nextIndex = i;
                }
            }
            
            // Add to sequence and update head
            seekSequence.push(requestQueue[nextIndex]);
            currentHead = requestQueue[nextIndex];
            requestQueue.splice(nextIndex, 1);
        }
        
        return seekSequence;
    }
    
    function scanAlgorithm(initialHead, requestQueue, initialDirection) {
        let seekSequence = [];
        let currentHead = initialHead;
        let direction = initialDirection === 'right' ? 1 : -1;
        
        // Sort requests
        requestQueue.sort((a, b) => a - b);
        
        while (requestQueue.length > 0) {
            if (direction === 1) {
                // Moving right (increasing)
                const rightRequests = requestQueue.filter(req => req >= currentHead);
                
                if (rightRequests.length > 0) {
                    // Serve all requests to the right
                    for (let req of rightRequests) {
                        seekSequence.push(req);
                        currentHead = req;
                        requestQueue.splice(requestQueue.indexOf(req), 1);
                    }
                } else {
                    // No more requests to the right, go to end
                    seekSequence.push(199);
                    currentHead = 199;
                    direction = -1;
                }
            } else {
                // Moving left (decreasing)
                const leftRequests = requestQueue.filter(req => req <= currentHead);
                
                if (leftRequests.length > 0) {
                    // Serve all requests to the left
                    leftRequests.reverse(); // Process from highest to lowest
                    for (let req of leftRequests) {
                        seekSequence.push(req);
                        currentHead = req;
                        requestQueue.splice(requestQueue.indexOf(req), 1);
                    }
                } else {
                    // No more requests to the left, go to start
                    seekSequence.push(0);
                    currentHead = 0;
                    direction = 1;
                }
            }
        }
        
        return seekSequence;
    }
    
    function cscanAlgorithm(initialHead, requestQueue, initialDirection) {
        let seekSequence = [];
        let currentHead = initialHead;
        let direction = initialDirection === 'right' ? 1 : -1;
        
        // Sort requests
        requestQueue.sort((a, b) => a - b);
        
        while (requestQueue.length > 0) {
            if (direction === 1) {
                // Moving right (increasing)
                const rightRequests = requestQueue.filter(req => req >= currentHead);
                
                if (rightRequests.length > 0) {
                    // Serve all requests to the right
                    for (let req of rightRequests) {
                        seekSequence.push(req);
                        currentHead = req;
                        requestQueue.splice(requestQueue.indexOf(req), 1);
                    }
                }
                
                // Jump to start if needed
                if (requestQueue.length > 0) {
                    seekSequence.push(199);
                    seekSequence.push(0);
                    currentHead = 0;
                }
            } else {
                // Moving left (decreasing)
                const leftRequests = requestQueue.filter(req => req <= currentHead);
                
                if (leftRequests.length > 0) {
                    // Serve all requests to the left
                    leftRequests.reverse(); // Process from highest to lowest
                    for (let req of leftRequests) {
                        seekSequence.push(req);
                        currentHead = req;
                        requestQueue.splice(requestQueue.indexOf(req), 1);
                    }
                }
                
                // Jump to end if needed
                if (requestQueue.length > 0) {
                    seekSequence.push(0);
                    seekSequence.push(199);
                    currentHead = 199;
                }
            }
        }
        
        return seekSequence;
    }
//           Totalseek Time    
    function calculateTotalSeekTime(initialHead, seekSequence) {
        let totalSeekTime = 0;
        let currentHead = initialHead;
        
        for (let position of seekSequence) {
            totalSeekTime += Math.abs(position - currentHead);
            currentHead = position;
        }
        
        return totalSeekTime;
    }
    
    async function animateDiskMovement(seekSequence, initialHead) {
        isSimulating = true;
        simulateBtn.disabled = true;
        resetBtn.disabled = true;
        
        // Clear previous seek sequence
        seekSequenceElement.innerHTML = '';
        
        // Move head to initial position
        let currentHead = initialHead;
        diskHead.style.left = `${(currentHead / 199) * 100}%`;
        
        // Process each request in sequence
        for (let i = 0; i < seekSequence.length; i++) {
            const targetPosition = seekSequence[i];
            
            // Add to seek sequence display
            const seqItem = document.createElement('span');
            seqItem.textContent = targetPosition;
            seekSequenceElement.appendChild(seqItem);
            
            // Animate head movement
            await moveHeadToPosition(currentHead, targetPosition);
            currentHead = targetPosition;
            
            // Highlight the current request
            const requestElements = document.querySelectorAll('.disk-request');
            requestElements.forEach(el => {
                const pos = parseInt(el.style.left) / 100 * 199;
                if (Math.round(pos) === targetPosition) {
                    el.classList.add('active-request');
                    setTimeout(() => el.classList.remove('active-request'), 1000);
                }
            });
            
            // Small delay between movements
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        isSimulating = false;
        simulateBtn.disabled = false;
        resetBtn.disabled = false;
    }
    
    function moveHeadToPosition(currentPos, targetPos) {
        return new Promise(resolve => {
            const duration = 500 + Math.abs(targetPos - currentPos) * 5;
            const startTime = performance.now();
            
            function animate(currentTime) {
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                // Calculate new position
                const newPosition = currentPos + (targetPos - currentPos) * progress;
                diskHead.style.left = `${(newPosition / 199) * 100}%`;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            }
            
            requestAnimationFrame(animate);
        });
    }
//       Results
        
    function displayResults(result) {
        totalSeekTimeElement.textContent = result.totalSeekTime;
        avgSeekTimeElement.textContent = result.avgSeekTime.toFixed(2);
        throughputElement.textContent = result.throughput.toFixed(4);
    }
    
    function updateComparisonChart(currentResult) {
        // Destroy previous chart if exists
        if (comparisonChart) {
            comparisonChart.destroy();
        }
        
        // Calculate results for all algorithms
        const initialHead = parseInt(initialHeadInput.value) || 50;
        const initialDirection = document.getElementById('initial-direction').value;
        
        const algorithms = ['fcfs', 'sstf', 'scan', 'cscan'];
        const labels = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'];
        const seekTimes = [];
        const avgSeekTimes = [];
        
        algorithms.forEach(alg => {
            const result = simulateDiskScheduling(alg, initialHead, initialDirection);
            seekTimes.push(result.totalSeekTime);
            avgSeekTimes.push(result.avgSeekTime);
        });
//      Create chart
        const ctx = document.getElementById('comparison-chart').getContext('2d');
        comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Seek Time',
                        data: seekTimes,
                        backgroundColor: [
                            'rgba(78, 115, 223, 0.7)',
                            'rgba(28, 200, 138, 0.7)',
                            'rgba(156, 39, 176, 0.7)',
                            'rgba(255, 152, 0, 0.7)'
                        ],
                        borderColor: [
                            'rgba(78, 115, 223, 1)',
                            'rgba(28, 200, 138, 1)',
                            'rgba(156, 39, 176, 1)',
                            'rgba(255, 152, 0, 1)'
                        ],
                        borderWidth: 1
                    },
                    {
                        label: 'Average Seek Time',
                        data: avgSeekTimes,
                        backgroundColor: [
                            'rgba(78, 115, 223, 0.4)',
                            'rgba(28, 200, 138, 0.4)',
                            'rgba(156, 39, 176, 0.4)',
                            'rgba(255, 152, 0, 0.4)'
                        ],
                        borderColor: [
                            'rgba(78, 115, 223, 1)',
                            'rgba(28, 200, 138, 1)',
                            'rgba(156, 39, 176, 1)',
                            'rgba(255, 152, 0, 1)'
                        ],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Seek Time'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Algorithm Comparison'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Initialize disk visualization
    renderDiskRequests();
    
    // Initialize particles.js for background
    particlesJS('particles-background', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
});