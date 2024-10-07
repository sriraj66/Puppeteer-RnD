import os
import csv
import time
import signal
import sys

shm_usage_logs = []

def get_shm_usage():
    shm_path = '/dev/shm'
    
    statvfs = os.statvfs(shm_path)
    
    block_size = statvfs.f_frsize
    
    total_blocks = statvfs.f_blocks
    free_blocks = statvfs.f_bfree
    used_blocks = total_blocks - free_blocks
    
    total_size = total_blocks * block_size / (1024 ** 2)  # Convert to MB
    used_size = used_blocks * block_size / (1024 ** 2)    # Convert to MB
    free_size = free_blocks * block_size / (1024 ** 2)    # Convert to MB
    
    return {
        'Total Size (MB)': round(total_size, 2),
        'Used Size (MB)': round(used_size, 2),
        'Free Size (MB)': round(free_size, 2),
        'Used Percentage (%)': round((used_size / total_size) * 100, 2) if total_size > 0 else 0
    }

def log_shm_usage():
    shm_stats = get_shm_usage()
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    log_entry = {
        'Timestamp': timestamp,
        'Total Size (MB)': shm_stats['Total Size (MB)'],
        'Used Size (MB)': shm_stats['Used Size (MB)'],
        'Free Size (MB)': shm_stats['Free Size (MB)'],
        'Used Percentage (%)': shm_stats['Used Percentage (%)'],
    }
    print(f"[{timestamp}] Shared Memory Usage: {log_entry}")
    shm_usage_logs.append(log_entry)

def save_to_csv():
    csv_filename = 'shm_usage_log.csv'
    
    fieldnames = ['Timestamp', 'Total Size (MB)', 'Used Size (MB)', 'Free Size (MB)', 'Used Percentage (%)']
    
    with open(csv_filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(shm_usage_logs)
    
    print(f"\nData saved to {csv_filename}")

def signal_handler(sig, frame):
    print("\nCtrl+C pressed. Exiting and saving data...")
    save_to_csv()
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)

    print("Monitoring shared memory usage. Press Ctrl+C to stop and save the log to CSV.")
    
    try:
        while True:
            log_shm_usage()
            time.sleep(0.5)
    except Exception as e:
        print(f"Error: {e}")
        save_to_csv()
        sys.exit(1)
