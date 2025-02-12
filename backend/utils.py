import time
from datetime import datetime, timezone, timedelta


def check_time_status(time_str: str, original_status: str) -> str:
    # time_str = file_data.get('basic_info', {}).get('time', '')
    if time_str:
        time_obj = time.strptime(time_str, "%Y/%m/%d %H:%M:%S")  # already in JST
        time_obj = time.mktime(time_obj)
        time_obj_in_jst = datetime.fromtimestamp(time_obj, timezone(timedelta(hours=+9)))
        # compare time in JST
        current_time_in_jst = datetime.now(timezone(timedelta(hours=+9)))
        time_diff = current_time_in_jst - time_obj_in_jst
        if time_diff.total_seconds() > 30 * 60:
            return 'warning'
    return original_status