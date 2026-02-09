'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

interface MqttContextType {
    client: MqttClient | null;
    isConnected: boolean;
    lastMessages: Record<string, any>;
    publish: (topic: string, message: any) => void;
}

const MqttContext = createContext<MqttContextType>({
    client: null,
    isConnected: false,
    lastMessages: {},
    publish: () => {},
});

export const useMqtt = () => useContext(MqttContext);

const MQTT_HOST = "wss://g0d76118.ala.asia-southeast1.emqxsl.com:8084/mqtt";
const MQTT_USER = "test";
const MQTT_PASS = "test";

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessages, setLastMessages] = useState<Record<string, any>>({});

    useEffect(() => {
        const mqttClient = mqtt.connect(MQTT_HOST, {
            username: MQTT_USER,
            password: MQTT_PASS,
            clientId: 'web_' + Math.random().toString(16).substring(2, 10),
            clean: true,
            reconnectPeriod: 5000,
        });

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT Broker');
            setIsConnected(true);
        });

        mqttClient.on('message', (topic, payload) => {
            try {
                const message = JSON.parse(payload.toString());
                setLastMessages((prev) => ({
                    ...prev,
                    [topic]: message,
                }));
            } catch (e) {
                console.error('MQTT Parse Error:', e);
            }
        });

        mqttClient.on('error', (err) => {
            console.error('MQTT Error:', err);
            setIsConnected(false);
        });

        mqttClient.on('close', () => {
            setIsConnected(false);
        });

        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, []);

    const publish = (topic: string, message: any) => {
        if (client && isConnected) {
            client.publish(topic, JSON.stringify(message));
        }
    };

    return (
        <MqttContext.Provider value={{ client, isConnected, lastMessages, publish }}>
            {children}
        </MqttContext.Provider>
    );
};
