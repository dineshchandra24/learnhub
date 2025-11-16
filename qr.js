import qrcode from 'qrcode-terminal';
import os from 'os';

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    for (const details of interfaces[key]) {
      if (details.family === 'IPv4' && !details.internal) {
        return details.address;
      }
    }
  }
}

const ip = getLocalIPAddress();
const port = 5173;
const url = `http://${ip}:${port}`;

console.log("\n📱 Scan this QR to open your Vite app on phone:\n");
qrcode.generate(url, { small: true });
console.log("\nURL:", url, "\n");
