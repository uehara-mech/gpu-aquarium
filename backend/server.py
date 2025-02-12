import argparse
import json
import re
from datetime import datetime
from typing import Tuple, List

import aiofiles
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import glob
import logging
import os
from rich.logging import RichHandler
from utils import check_time_status

logging.basicConfig(
    format=' %(message)s',
    level=logging.INFO,
    handlers=[RichHandler(rich_tracebacks=True)]
)
log = logging.getLogger('rich')

app = FastAPI()

origins = [
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/merged_data")
async def get_merged_data():
    return FileResponse('merged_data.json', media_type='application/json')

@app.get("/history/")
async def get_log_info(n: str = None):
    def parse_filename(filename) -> Tuple[str, str]:
        if "_G" in filename:
            print(f"filename: {filename}")
            filename, gpu_utils = filename.split("_G")
            gpu_utils = gpu_utils.split(".")[0]
        else:
            raise ValueError(f"filename format is invalid: {filename}; "
                             f"should be 'log_YYYYMMDD-HHMMSS_G[gpu_util].json'")
        match = re.match(r"log_(\d{4})-(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})", filename)
        if not match:
            raise ValueError(f"filename format is invalid: {filename}; "
                             f"should be 'log_YYYYMMDD-HHMMSS_G[gpu_util].json'")

        year, month, day, hour, minute, second = map(int, match.groups())
        dt = datetime(year, month, day, hour, minute, second)

        return dt.strftime("%Y-%m-%d-%H-%M-%S"), gpu_utils

    if n is None:
        return {"message": "n (host name) is required"}
    host_data_dir = f'{data_dir}/{n}'
    log_dir = f"{host_data_dir}/log"
    if not os.path.exists(log_dir):
        raise HTTPException(status_code=404, detail="Item not found")
    # return log time list
    log_files = glob.glob(f"{log_dir}/*.json")
    # log file name: e.g., log_2025-0111-123526_GAFFF.json -> 2025-01-11-12-35-26, GAFFF
    log_times_and_utils: List[Tuple[str, str]] = [parse_filename(os.path.basename(f)) for f in log_files]
    # sort
    log_times_and_utils.sort(reverse=True, key=lambda x: x[0])
    return JSONResponse(content=log_times_and_utils)


@app.get("/log/")
async def get_log_data(n: str = None, t: str = None):
    # url: /log/?n=host_name&t=2025-01-11-12-35-26
    if n is None:
        return {"message": "n (host name) is required"}
    if t is None:
        return {"message": "t (time) is required"}
    host_data_dir = f'{data_dir}/{n}'
    # t: 2025-01-11-12-35-26 -> log_2025-0111-123526_G[gpu_utils].json
    if len(t.split('-')) != 6:
        raise HTTPException(status_code=400, detail="Invalid time format")
    year, month, day, hour, minute, second = t.split('-')
    files = glob.glob(f"{host_data_dir}/log/log_{year}-{month}{day}-{hour}{minute}{second}_G*.json")
    if len(files) == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    log_filename = os.path.basename(files[0])
    log_file = f"{host_data_dir}/log/{log_filename}"
    if not os.path.exists(log_file):
        raise HTTPException(status_code=404, detail="Item not found")
    return FileResponse(log_file, media_type='application/json')


@app.get("/node/")
async def get_host_data(n: str = None):
    if n is None:
        return {"message": "n (host name) is required"}
    host_data_dir = f'{data_dir}/{n}'
    log_files = glob.glob(f"{host_data_dir}/log*.json")
    if len(log_files) == 0:
        latest_log = f"{host_data_dir}/latest_log.json"
    else:
        log.info(f"reading {log_files} ...")
        if len(log_files) == 0:
            return JSONResponse(content={"message": "no log file found"})
        latest_log = max(log_files, key=os.path.getctime)
    log.info(f"reading {latest_log} ...")

    async with aiofiles.open(latest_log, 'r') as file:
        contents = await file.read()
        data = json.loads(contents)

        node_timestamp = data.get('basic_info', {}).get('time', '')
        time_status = check_time_status(node_timestamp, data['basic_info']['status'])
        print(f"{data['basic_info']['status']} -> {time_status}")
        data['basic_info']['status'] = time_status

    return JSONResponse(content=data)


@app.get("/node_stats/")
async def get_node_stats(n: str = None):
    if n is None:
        return {"message": "n (host name) is required"}
    host_data_dir = f'{data_dir}/{n}'
    long_term_log = f"{host_data_dir}/long_term_log.json"
    log.info(f"reading {long_term_log} ...")
    if not os.path.exists(long_term_log):
        raise HTTPException(status_code=404, detail="Item not found")
    return FileResponse(
        long_term_log, media_type='application/json',
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

if __name__ == "__main__":
    import uvicorn
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('--data-dir', default='data', help='')
    args = parser.parse_args()

    data_dir = args.data_dir

    config = uvicorn.Config(app, host="0.0.0.0", port=8000)
    server = uvicorn.Server(config)
    uvicorn.run(app, host="0.0.0.0", port=8000)
