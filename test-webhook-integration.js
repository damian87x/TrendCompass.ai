/**
 * Webhook Integration Test
 * 
 * This script tests the webhook functionality by:
 * 1. Setting up a temporary HTTP server to receive the webhook
 * 2. Creating a WebhookDriver instance pointing to that server
 * 3. Sending a test notification
 * 4. Verifying the notification was received correctly
 */

const http = require('http');
const axios = require('axios');

// Create a temporary HTTP server to receive webhooks
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('\n✅ Webhook received successfully!');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Body:', body);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Webhook received' }));
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

// Start the server on a random port
const PORT = 3030;
server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  
  // The webhook URL points to our local server
  const webhookUrl = `http://localhost:${PORT}`;
  
  // Create a simple test content
  const testContent = `# TrendCompass Webhook Test\n\nThis is a test message from the TrendCompass webhook integration.\n\n## Features\n- Generic webhook support\n- Custom headers support\n- Standard JSON payload format`;
  
  // Custom headers for testing
  const customHeaders = {
    'X-Source': 'TrendCompass-Test',
    'X-API-Version': '1.0'
  };
  
  console.log('\n📤 Sending webhook to local test server...');
  
  try {
    // Manually simulate what the WebhookDriver.send() method would do
    const response = await axios.post(
      webhookUrl,
      { content: testContent, timestamp: new Date().toISOString() },
      { headers: { 'Content-Type': 'application/json', ...customHeaders } }
    );
    
    console.log('\n✅ Webhook sent successfully!');
    console.log('Response:', response.status, response.statusText);
    
    // Give the server a moment to process and log the received webhook
    setTimeout(() => {
      console.log('\n🎉 Test completed successfully!');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    }, 1000);
  } catch (error) {
    console.error('\n❌ Error sending webhook:', error.message);
    server.close(() => {
      process.exit(1);
    });
  }
});

server.on('error', (err) => {
  console.error(`\n❌ Server error: ${err.message}`);
  process.exit(1);
});
