import { Booking } from "./storage";

export function downloadTicketHTML(booking: Booking) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${booking.pnr}`;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Ticket - ${booking.pnr}</title>
  <style>
    :root {
      --primary: #0F172A;
      --secondary: #f59e0b;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      color: #1f2937;
      margin: 0;
      padding: 40px 20px;
    }
    .ticket-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, var(--primary), #1e293b);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 5px solid var(--secondary);
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: var(--secondary);
    }
    .header p {
      margin: 5px 0 0 0;
      opacity: 0.8;
    }
    .status-pill {
      background-color: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 99px;
      font-weight: bold;
      font-size: 14px;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
      display: flex;
      gap: 30px;
    }
    .main-details {
      flex: 1;
    }
    .side-details {
      width: 200px;
      text-align: center;
      border-left: 2px dashed #e5e7eb;
      padding-left: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .value {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .route {
      display: flex;
      align-items: center;
      gap: 15px;
      margin: 20px 0;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .route-point {
      flex: 1;
    }
    .route-point h3 {
      margin: 0 0 5px 0;
      font-size: 22px;
    }
    .route-point p {
      margin: 0;
      color: #6b7280;
    }
    .route-arrow {
      color: var(--secondary);
      font-weight: bold;
    }
    .passengers {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .passengers th, .passengers td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .passengers th {
      color: #6b7280;
      font-size: 14px;
      font-weight: 500;
    }
    .qr-code {
      width: 150px;
      height: 150px;
      margin-bottom: 15px;
    }
    .barcode-strip {
      height: 40px;
      background: repeating-linear-gradient(
        90deg,
        #1f2937,
        #1f2937 4px,
        transparent 4px,
        transparent 8px,
        #1f2937 8px,
        #1f2937 10px,
        transparent 10px,
        transparent 16px
      );
      margin-top: 20px;
      opacity: 0.3;
    }
    .footer {
      background: #f8fafc;
      padding: 20px 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .actions {
      text-align: center;
      margin-top: 30px;
    }
    .btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1e293b;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .ticket-container {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <div class="header">
      <div>
        <h1>Jay Ambe Travels</h1>
        <p>E-Ticket / Boarding Pass</p>
      </div>
      <div class="status-pill">CONFIRMED</div>
    </div>
    
    <div class="content">
      <div class="main-details">
        <div style="display: flex; gap: 40px;">
          <div>
            <div class="section-title">PNR Number</div>
            <div class="value" style="color: var(--primary); font-size: 24px;">${booking.pnr}</div>
          </div>
          <div>
            <div class="section-title">Journey Date</div>
            <div class="value">${booking.date}</div>
          </div>
          <div>
            <div class="section-title">Bus Type</div>
            <div class="value">${booking.busType}</div>
          </div>
        </div>

        <div class="route">
          <div class="route-point">
            <h3>${booking.from}</h3>
            <p>${booking.departureTime} • ${booking.boardingPoint || "Main Bus Stand"}</p>
          </div>
          <div class="route-arrow">➔</div>
          <div class="route-point" style="text-align: right;">
            <h3>${booking.to}</h3>
            <p>${booking.arrivalTime}</p>
          </div>
        </div>

        <div class="section-title" style="margin-top: 30px;">Passenger Details</div>
        <table class="passengers">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age/Gender</th>
              <th>Seat</th>
            </tr>
          </thead>
          <tbody>
            ${booking.passengers.map((p, i) => `
              <tr>
                <td style="font-weight: 500;">${p.name}</td>
                <td>${p.age} / ${p.gender.charAt(0).toUpperCase()}</td>
                <td><strong style="color: var(--secondary)">${booking.seats[i]}</strong></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          <strong>Contact:</strong> ${booking.contactEmail} | ${booking.contactPhone}<br>
          <strong>Total Fare:</strong> ₹${booking.totalFare.toFixed(2)} (incl. GST)
        </div>
      </div>
      
      <div class="side-details">
        <img src="${qrUrl}" alt="QR Code" class="qr-code">
        <div class="section-title">Scan to verify</div>
        <div class="barcode-strip" style="width: 100%;"></div>
      </div>
    </div>
    
    <div class="footer">
      For support, contact demo@jayambetravels.in | Please arrive 15 minutes before departure.
    </div>
  </div>
  
  <div class="actions no-print">
    <button class="btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ticket-${booking.pnr}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
