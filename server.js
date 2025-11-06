// server.js
const http = require('http');
const port = process.env.PORT || 8080;

// Student class
class Student {
  constructor(name, className, rollNo) {
    this.name = name;
    this.className = className;
    this.rollNo = rollNo;
  }
}

// Create a student instance
const student = new Student('Saravanakrishnn B', 'IoT-B', '22011102092');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Information</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 50px auto;
          padding: 20px;
          background-color:rgb(0, 0, 0);
        }
        .container {
          background-color: black;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #fff;
          margin-bottom: 20px;
        }
        .info {
          margin: 15px 0;
          padding: 10px;
          background-color:rgb(0, 0, 0);
          border-left: 4px solid #39FF14;
        }
        .label {
          font-weight: bold;
          color: #fff;
        }
        .value {
          color: #fff;
          margin-left: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello, Im ${student.name}!</h1>
        <div class="info">
          <span class="label">Class:</span>
          <span class="value">${student.className}</span>
        </div>
        <div class="info">
          <span class="label">Roll No:</span>
          <span class="value">${student.rollNo}</span>
        </div>
      </div>
    </body>
    </html>
  `;
  
  res.end(html);
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
