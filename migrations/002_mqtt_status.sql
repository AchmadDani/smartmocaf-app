-- MQTT Status Tracking Table
CREATE TABLE IF NOT EXISTS mqtt_status (
    id INTEGER PRIMARY KEY DEFAULT 1,
    last_payload JSONB,
    last_received_at TIMESTAMPTZ DEFAULT NOW(),
    endpoint_url TEXT DEFAULT '/api/mqtt-webhook',
    status TEXT DEFAULT 'Receiving Data',
    CONSTRAINT single_row CHECK (id = 1)
);

-- Initial row
INSERT INTO mqtt_status (id, endpoint_url, status)
VALUES (1, '/api/mqtt-webhook', 'Waiting for Data')
ON CONFLICT (id) DO NOTHING;

-- Grant access
ALTER TABLE mqtt_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_read_mqtt_status" ON mqtt_status;
CREATE POLICY "allow_read_mqtt_status" ON mqtt_status FOR SELECT USING (true);
