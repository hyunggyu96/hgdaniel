import os
import subprocess
import datetime

def check_process(name):
    try:
        output = subprocess.check_output(["pgrep", "-f", name])
        return True
    except:
        return False

def get_last_log(path, lines=5):
    if not os.path.exists(path):
        return "Log file not found."
    try:
        with open(path, "r") as f:
            content = f.readlines()
            return "".join(content[-lines:])
    except:
        return "Error reading log."

print(f"--- Tablet System Check ({datetime.datetime.now()}) ---")

processes = ["ollama", "async_collector.py", "processor.py"]
for p in processes:
    status = "RUNNING" if check_process(p) else "STOPPED"
    print(f"[*] {p:20}: {status}")

print("\n--- Last Processor Log ---")
print(get_last_log("processor.log"))

print("\n--- Last Collector Log ---")
print(get_last_log("collector.log"))
