# Industrial_System
* Code in Javascript. 
* It involves storing data from json input efficiently into mongodb and manipulating with the data stored to return the required data as mentioned in the query. 
## Problem Backgound
* In an industrial system there are various types of devices such as sensors,equipments, controllers etc.
<pre>
* The hierarchy is as follows:
  1) 1 Plant can contain multiple Equipments
  2) 1 Equipment can contain multiple sensors.
  3) Sensor is the lowest level.
  4) An equipment uses a sensor in a bounded time range for e.g t1 to t2 for S1, t3 to t4 for S2 and so on.
</pre>

## Problem Statement
* Required to built a data structure, class or a service than can store the data efficiently and handle the following operation:
```
def get_all_sensors( equipment_id : str, start_time : str, end_time :str) -> List
//here we have to return all the sensors along with their start time and end time that lie within the given range and beong to equipment given
```
### Refer input file for the detailed schema of the system(input.json)
* Sample input
```
equipment id : E2
start time : 10:15
end time : 19:20
```
* Sample output
```
{S2: [11:00 - 12:00],S4: [10:30 - 14:30],S5: [13:45 - 19:15]}
```




