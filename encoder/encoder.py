import subprocess
from pathlib import Path
import requests

RESOLUTIONS = {
    "1080p": "1920x1080",
    "720p": "1280x720",
    "480p": "854x480",
    "360p": "640x360",
    "240p": "426x240",
}

MAIN_API_URL = "http://localhost:8000/video/formats"  # Replace with your main API endpoint

def encode_video(input_path: Path, output_dir: Path, video_id: int):
    """
    Encode video into multiple resolutions and update the main API.
    """
    output_dir = Path("public/videos/encoded") / str(video_id)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Input path: {input_path}")
    print(f"Output directory: {output_dir}")

    if not input_path.exists():
        print(f"Input file does not exist: {input_path}")
        return

    try:
        original_resolution = get_video_resolution(input_path)
        print(f"Original resolution: {original_resolution}")
    except Exception as e:
        print(f"Error getting video resolution: {e}")
        return

    encoded_formats = []

    for resolution, dimensions in RESOLUTIONS.items():
        if is_resolution_lower_or_equal(original_resolution, dimensions):
            output_file = output_dir / f"{resolution}.mp4"
            ffmpeg_command = [
                "ffmpeg", "-i", str(input_path), "-vf", f"scale={dimensions}",
                "-c:v", "libx264", "-preset", "fast", "-crf", "23", str(output_file)
            ]
            try:
                print(f"Encoding {resolution}: {' '.join(map(str, ffmpeg_command))}")
                subprocess.run(ffmpeg_command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                relative_path = f"public/videos/encoded/{video_id}/{resolution}.mp4"
                encoded_formats.append({"code": resolution.replace('p', ''), "uri": relative_path})
                print(f"Successfully encoded {resolution}")
            except subprocess.CalledProcessError as e:
                print(f"Encoding failed for resolution {resolution}: {e}")
                print(f"Error output: {e.stderr.decode()}")

    if encoded_formats:
        print(f"Notifying main API with formats: {encoded_formats}")
        notify_main_api(video_id, encoded_formats)
    else:
        print("No formats were successfully encoded")

def get_video_resolution(video_path: Path):
    command = [
        "ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
        "stream=width,height", "-of", "csv=s=x:p=0", str(video_path)
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    width, height = map(int, result.stdout.decode("utf-8").strip().split("x"))
    return f"{width}x{height}"

def is_resolution_lower_or_equal(original_res, target_res):
    orig_width, orig_height = map(int, original_res.split("x"))
    target_width, target_height = map(int, target_res.split("x"))
    return target_width <= orig_width and target_height <= orig_height

def notify_main_api(video_id: int, formats: list):
    payload = {"video_id": video_id, "formats": formats}
    try:
        response = requests.post(MAIN_API_URL, json=payload)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to notify main API: {e}")
