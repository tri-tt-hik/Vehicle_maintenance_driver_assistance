import cv2
import numpy as np
from playsound import playsound
import threading
import os

def play_alert():
    threading.Thread(target=playsound, args=(r"project/alert.mp3",), daemon=True).start()

def run_vehicle_detection(video_path):
    net = cv2.dnn.readNet("project/yolov4.weights", "project/yolov4.cfg")
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

    with open("project/coco.names", "r") as f:
        classes = [line.strip() for line in f.readlines()]

    vehicle_classes = ['car', 'truck', 'bus', 'motorbike']
    CRITICAL_AREA_THRESHOLD = 10000
    FOCAL_LENGTH = 400

    cap = cv2.VideoCapture(video_path)

    def calculate_distance(w, real_vehicle_width, focal_length):
        return (real_vehicle_width * focal_length) / w

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        height, width, _ = frame.shape
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (250, 250), (0, 0, 0), True, crop=False)
        net.setInput(blob)
        detections = net.forward(output_layers)

        boxes, confidences, class_ids = [], [], []

        for out in detections:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.5:
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    boxes.append([center_x - w // 2, center_y - h // 2, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)

        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

        if len(indexes) > 0:
            for i in indexes.flatten():
                x, y, w, h = boxes[i]
                area = w * h
                label = str(classes[class_ids[i]])
                REAL_VEHICLE_WIDTH = 1.5 if label == "car" else 2 if label in ["truck", "bus"] else 0.8
                color = (0, 255, 0)
                if area > CRITICAL_AREA_THRESHOLD:
                    color = (0, 0, 255)
                    play_alert()
                distance = calculate_distance(w, REAL_VEHICLE_WIDTH, FOCAL_LENGTH)
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, f"{label}: {distance:.2f}m", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

        cv2.imshow("Vehicle and Obstacle Detection", frame)
        cv2.moveWindow("Vehicle and Obstacle Detection", 350, 250)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
