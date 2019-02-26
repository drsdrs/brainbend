import time
import serial

ser = serial.Serial(port='/dev/ttyUSB2',baudrate=19200)

if __name__=="__main__":
  for i in range(256):
    ser.write(chr(12))
    time.sleep(.1)
