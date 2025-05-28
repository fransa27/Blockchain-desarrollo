import network
import machine
import time
from umqtt.simple import MQTTClient

# ======== Configuración WiFi y MQTT =========
SSID = 'YiroT'
PASSWORD = 'wsnlab01'
MQTT_BROKER = "192.168.0.193"
MQTT_PORT = 1883
MQTT_CLIENT_ID = "pico_client"
TOPIC_SUB = b"p2p/energy"

# ======== Pines =========
RELE = machine.Pin(21, machine.Pin.OUT)
RELE.value(1)  # OFF

adc_current = machine.ADC(27)  # Corriente por ADC

# ======== Parámetros de medición =========
V_BATERIA = 3.3  # Voltaje de la batería
BURDEN_RESISTOR = 10  # En ohmios
TOLERANCIA_WH = 0.5   # Margen de error para comparación de energía

# ======== Variables de energía =========
energia_objetivo = 0.0
energia_acumulada_wh = 0.0
tiempo_anterior = time.time()

# ======== Funciones =========
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
        energia_objetivo = float(msg.decode())
        print(f"⚡ Energía solicitada: {energia_objetivo} Wh")
        energia_acumulada_wh = 0.0  # Reinicia la acumulación
        tiempo_anterior = time.time()
        
        # Activa el relé para comenzar a enviar energía
        RELE.value(0)
    except Exception as e:
        print("❌ Error al procesar mensaje:", e)

# ======== Programa principal =========
conectar_wifi()

client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER)
client.set_callback(mensaje_recibido)
client.connect()
client.subscribe(TOPIC_SUB)
print(f"✅ Suscrito a {TOPIC_SUB}")

while True:
    client.check_msg()  # Verifica si llega un nuevo mensaje
    
    if energia_objetivo > 0:
        corriente = medir_corriente()
        potencia = corriente * V_BATERIA
        
        tiempo_actual = time.time()
        dt_horas = (tiempo_actual - tiempo_anterior) / 3600
        tiempo_anterior = tiempo_actual

        energia_acumulada_wh += potencia * dt_horas
        print(f"🔄 Corriente: {corriente:.4f} A | Energía acumulada: {energia_acumulada_wh:.2f} Wh")

        if energia_acumulada_wh >= energia_objetivo - TOLERANCIA_WH:
            print("✅ Energía enviada al otro peer.")
            RELE.value(1)  # Apagar relé
            energia_objetivo = 0.0  # Reinicia el ciclo
            energia_acumulada_wh = 0.0

    time.sleep(1)  # Delay para evitar uso excesivo de CPU
