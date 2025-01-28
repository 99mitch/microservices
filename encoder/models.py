from pydantic import BaseModel

class VideoEncodingRequest(BaseModel):
    video_id: int
    file_path: str
