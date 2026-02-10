/**
 * LOCAL WEBHOOK TEST SCRIPT
 * Hits the local API route directly to verify data ingestion logic.
 */
async function testWebhook() {
    console.log('--- TESTING WEBHOOK LOCALLY ---');
    
    const payload = {
        device_id: "0001",
        temp: 27.4,
        ph: 6.99,
        water_level: 85.5,
        relay: 0,
        mode: "auto",
        datetime: new Date().toISOString()
    };

    const webhookBody = {
        topic: "growify/0001/sensors",
        payload: JSON.stringify(payload)
    };

    try {
        console.log('Sending payload to http://localhost:3000/api/mqtt-webhook ...');
        const response = await fetch('http://localhost:3000/api/mqtt-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookBody)
        });

        const result = await response.json();
        console.log('Response:', result);

        if (response.ok) {
            console.log('✅ Webhook logic works! Check the dashboard now.');
        } else {
            console.log('❌ Webhook failed:', result.error);
        }
    } catch (err) {
        console.error('❌ Error hitting local webhook:', err.message);
        console.log('NOTE: Make sure your local server (npm run dev) is running on port 3000!');
    }
}

testWebhook();
