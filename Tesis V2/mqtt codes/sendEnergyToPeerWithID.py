import network
import machine
import time
import ujson
from umqtt.simple import MQTTClient


SSID = 'YiroT'
PASSWORD = 'wsnlab01'
MQTT_BROKER = "192.168.0.193"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "pico_energy"
TOPIC_SUB = "p2p/energy"

ACC = '0x643780da2163df13357a40D2aFFE746222cf9719'  # Dirección del peer

RELE = machine.Pin(21, machine.Pin.OUT)
RELE.value(0)  # OFF

adc_current = machine.ADC(27)  # Corriente por ADC

V_BATERIA = 3.3  # Voltaje de la batería
BURDEN_RESISTOR = 10  # En ohmios
TOLERANCIA_WH = 0.5   # Margen de error para comparación de energía


energia_objetivo = 0.0
energia_acumulada_wh = 0.0
tiempo_anterior = time.time()

def conectar_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PASSWORD)
    while not wlan.isconnected():
        print("Conectando a WiFi...")
        time.sleep(1)
    print("Conectado:", wlan.ifconfig())

def medir_corriente():
    raw = adc_current.read_u16()
    voltaje = raw * (3.3 / 65535)
    corriente = voltaje / BURDEN_RESISTOR
    return corriente

def mensaje_recibido(topic, msg):
    global energia_objetivo, energia_acumulada_wh, tiempo_anterior
    try:
        data = ujson.loads(msg)  # Decodifica JSON
        buyer = data.get("buyer")
        energia = float(data.get("energy", 0))

        print("Mensaje recibido:", data)

        if buyer.lower() == ACC.lower():
            energia_objetivo = energia
            energia_acumulada_wh = 0.0
            tiempo_anterior = time.time()
            print(f"It's my energy. Energía solicitada: {energia_objetivo} Wh")
            RELE.value(1)  # Encender relé
        else:
            print(f"Mensaje para otro buyer: {buyer}")
    except Exception as e:
        print("Error al procesar mensaje:", e)


conectar_wifi()

client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER)
client.set_callback(mensaje_recibido)
client.connect()
client.subscribe(TOPIC_SUB)
print(f"Suscrito a {TOPIC_SUB}")

while True:
    client.check_msg()  # Verifica si llega un nuevo mensaje

    if energia_objetivo > 0:
        corriente = medir_corriente()
        potencia = corriente * V_BATERIA
        tiempo_actual = time.time()
        dt_horas = (tiempo_actual - tiempo_anterior) / 3600
        tiempo_anterior = tiempo_actual

        energia_acumulada_wh += potencia * dt_horas
        print(f"Corriente: {corriente:.4f} A | Energía acumulada: {energia_acumulada_wh:.2f} Wh")

        if energia_acumulada_wh >= energia_objetivo - TOLERANCIA_WH:
            print("Energía enviada al otro peer.")
            RELE.value(0)  # Apagar relé
            energia_objetivo = 0.0
            energia_acumulada_wh = 0.0

    time.sleep(100)

