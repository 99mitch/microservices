from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from pathlib import Path
from encoder import encode_video

app = FastAPI()

class VideoEncodingRequest(BaseModel):
    video_id: int
    file_path: str

@app.post("/encode")
async def start_encoding(video_request: VideoEncodingRequest, background_tasks: BackgroundTasks):
    """
    Start encoding a video in the background.
    """
    input_path = Path(video_request.file_path)
    output_dir = Path("public/encoded") / str(video_request.video_id)

    if not input_path.exists():
        return {"error": f"Input video file does not exist at {input_path}"}

    # Add encoding task to the background
    background_tasks.add_task(encode_video, input_path, output_dir, video_request.video_id)
    return {"message": "Encoding started", "video_id": video_request.video_id}

