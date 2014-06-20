rosmsgjs
========

ros message files in json format, and tools to parse .msg files


### Features

- All message files of common_msgs in json format (in directory common_msgs_json)
- An all-in-one json file of all messages from common_msgs (common_msgs.json)
- A node.js tool to parse msg files into json format (rosmsg.js)
- Can be used in web tools for ROS

### Usage

Execute:
```
$ node rosmsg.js
```

### Dependencies

- node.js
- fs
- ROS
- common_msgs
