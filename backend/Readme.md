## How to run the backend system

This is the backend system for the GPU server monitoring system.
The system consists of the following components:
- API server
- DB script
- Data collection script


---
### API server

The API server is a Flask server that provides the following endpoints:
- `/merged_data`
- `/history?n=<node_name>`
- `/node?n=<node_name>`

```shell
$ python server.py
```


### DB script
The DB script is a script that merges the data collected by the data collection script and stores it in JSON files.
```shell
$ python db.py
```

In order to configure the servers displayed on the dashboard, please edit `config.yaml`.

Example:
```yaml
server:
  host1:
    gpu: RTX A6000
    status: operational
  host2-down:
    gpu: Tesla A100
    status: down
```

### Data collection script
The data collection script `get_server_info.py` is a script that collects the data from the servers and stores it in JSON files.
You need to run this script on each server.

```shell
$ python get_server_info.py -d
```