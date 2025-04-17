# Advanced Disk Scheduling Simulator 🚀

An interactive web-based simulator for visualizing and comparing disk scheduling algorithms like **FCFS**, **SSTF**, **SCAN**, and **C-SCAN**. Built with HTML, CSS, and JavaScript to help students and developers better understand seek time optimization and head movement behavior in operating systems.

## 🎯 Features

- Input and manage disk requests (range: 0–199)
- Select scheduling algorithm: FCFS, SSTF, SCAN, C-SCAN
- Set initial head position and direction (for SCAN variants)
- Real-time disk head movement animation
- Performance metrics:
  - Total Seek Time
  - Average Seek Time
  - Throughput
- Visual comparison of all algorithms via charts
- Dark/light theme toggle 🌙☀️
- Responsive and mobile-friendly UI



## 🔧 Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Libraries & Frameworks**:
  - Bootstrap 5
  - Font Awesome
  - Chart.js (for algorithm comparison)
  - Particles.js (for animated background)
- **Tools**:
  - Visual Studio Code
  - GitHub for version control



## 📁 File Structure

```
├── index.html              # Main HTML structure
├── script.js               # Disk scheduling logic + visualization logic
├── styles.css              # UI styling and responsiveness
├── README.md               # This file

```

## 🧠 How It Works

1. User adds disk requests and selects an algorithm.
2. Head position and direction (if applicable) are configured.
3. Simulator computes seek sequence and total seek time.
4. Animation displays head movement across track.
5. Chart compares all algorithms for the given input.

## 🔍 Algorithms Implemented

- **FCFS**: First Come First Serve
- **SSTF**: Shortest Seek Time First
- **SCAN**: Elevator Algorithm (moves in both directions)
- **C-SCAN**: Circular SCAN (jumps back to start after one pass)

## 📈 Performance Metrics Explained

- **Total Seek Time**: Sum of all seek operations
- **Average Seek Time**: `Total Seek Time / Number of Requests`
- **Throughput**: `Requests Processed per Unit Time`

## 🚀 Future Scope

- Add LOOK and C-LOOK scheduling
- Export simulation data to CSV/PDF
- Support multiple disk heads
- 3D visualization of disk platters
- Machine learning-based adaptive scheduling
- Cloud-based collaboration mode

## 🙌 Author

**Arsh Jaiswal**  
B.Tech CSE, Lovely Professional University  
Reg No: 12310191 | Section: K23DX

## 📚 References

- Operating System Concepts by Silberschatz et al.
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [MDN Web Docs (JavaScript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

