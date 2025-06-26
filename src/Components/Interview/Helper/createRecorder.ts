export const createRecorder = (stream: MediaStream, onStop: (blob: Blob) => void, onError?: (err: Error) => void) => {
  let recorder: MediaRecorder | null = null;
  let chunks: BlobPart[] = [];
  let mimeType = "";

  // Extract only audio tracks from the stream for speech transcription
  const audioTracks = stream.getAudioTracks();

  if (audioTracks.length === 0) {
    onError?.(new Error("No audio tracks found in stream"));
    return {
      start: () => {},
      stop: () => {},
      get state() { return "stopped"; }
    };
  }

  // Create a new stream with only audio tracks
  const audioOnlyStream = new MediaStream(audioTracks);

  // Determine the best audio MIME type for speech recording
  if (MediaRecorder.isTypeSupported("audio/ogg; codecs=opus")) {
    mimeType = "audio/ogg; codecs=opus";
  } else if (MediaRecorder.isTypeSupported("audio/webm; codecs=opus")) {
    mimeType = "audio/webm; codecs=opus";
  } else {
    mimeType = "audio/wav";
  }

  recorder = new MediaRecorder(audioOnlyStream, { mimeType });

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mimeType });
    chunks = [];
    onStop(blob);
  };

  recorder.onerror = (event) => {
    if (onError) onError(new Error(`MediaRecorder error: ${event.error}`));
  };

  return {
    start: () => recorder.start(),
    stop: () => recorder && recorder.state === "recording" && recorder.stop(),
    get state() { return recorder?.state ?? "inactive" as RecordingState; }
  };
};
