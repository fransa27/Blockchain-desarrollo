import paho.mqtt.client as mqtt
import requests

THINGSPEAK_WRITE_APIKEY='2MDS0Q7YP9XWJWFR'
THINGSPEAK_URL='https://api.thingspeak.com/update?api_key='

MQTT_BROKER='localhost'
MQTT_PORT=1883
MQTT_topic_voltagePV='p2p/voltage'
MQTT_topic_currentPV='p2p/current'
MQTT_topic_potenciaPV='p2p/potencia'
MQTT_topic_voltageBESS='p2p/voltageBESS'

TOPICS={
	'p2p/voltage': 'field1',
	'p2p/current': 'field2' ,
	'p2p/potencia': 'field3' ,
	'p2p/voltageBESS': 'field5' 
}
sensorData={
	'field1': None,
	'field2': None ,
	'field3': None,
	'field5': None 

}
def on_connect(client, userdata, flags, rc):
	print(f"Conectando al broker... ",rc)
	for topic in TOPICS:
		client.subscribe(topic)
		print(f"Suscrito al topic {topic}")
	
	
def on_message(client, userdata, msg):	
	try:
		topic = msg.topic
		payload=msg.payload.decode()
		print(f"{topic}=> {payload}")
		
		if topic in TOPICS:	
			field=TOPICS[topic]
			sensorData[field]=payload
			payload_to_send={
				'api_key':	THINGSPEAK_WRITE_APIKEY
			}
		for f,val in sensorData.items():
			if val is not None:
				payload_to_send[f]=val
				
		response=requests.post(THINGSPEAK_URL,params=payload_to_send)
		if response.status_code==200:
			print("Dato enviado a ThingSpeak: ", payload_to_send)
		else:
			print("Error to send ThingSpeak: ", response.text)
			
	except Exception as e:
		print("Error ",e)
		
client = mqtt.Client()
client.on_connect=on_connect
client.on_message=on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_forever()