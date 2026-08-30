#!/bin/bash
source venv/bin/activate
export PYTHONPATH=$PYTHONPATH:$(pwd)

if [ ! -f "data/argo_southern_ocean.nc" ]; then
    echo "First run: downloading Argo datasets..."
    python datasets/fetch_argo.py
fi

echo "Starting MQTT broker..."
mosquitto -c config/mosquitto.conf &
MQTT_PID=$!

echo "Starting virtual sensor publisher..."
python virtual_sensors/virtual_publisher.py &
PUB_PID=$!

echo "Starting MQTT subscriber..."
python platform/mqtt_subscriber.py &
SUB_PID=$!

echo "Starting dashboard..."
streamlit run dashboard/app.py &
DASH_PID=$!

echo "All services started. Press Ctrl+C to stop."

trap "kill $MQTT_PID $PUB_PID $SUB_PID $DASH_PID; exit" SIGINT SIGTERM
wait
