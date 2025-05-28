import paho.mqtt.client as mqtt
import time
#codigo para HEMS/EMA que recibe energia de la blockchain
#y envia esa energia a la raspberry pico

# === Configuración de la Raspberry A (Broker local) ===
MQTT_BROKER_LOCAL = 'localhost'
MQTT_PORT_LOCAL = 1883
MQTT_TOPIC_ENERGY = 'p2p/energy' #el que viene del oraculo

#MQTT_TOPIC_SEND = 'p2p/energyToSend'

# === Cliente para la Raspberry A (receptor) ===
def on_connect(client, userdata, flags, rc):
    print(f"Conectado al broker local con código {rc}")
    client.subscribe(MQTT_TOPIC_ENERGY)
    print(f"Suscrito al tópico {MQTT_TOPIC_ENERGY}")

def on_message_local(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        print(f"Recibido en '{msg.topic}': {payload}")

        # Reenvío al broker remoto
        client.publish(msg.topic, payload)
        print(f"Reenviado a Raspberry B: {payload}")

    except Exception as e:
        print("Error al procesar mensaje:", e)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message_local
client.connect(MQTT_BROKER_LOCAL, MQTT_PORT_LOCAL, 60)
client.loop_forever()

# Puedes dejarlo corriendo o hacer una espera breve

#time.sleep(2)
#client.disconnect()