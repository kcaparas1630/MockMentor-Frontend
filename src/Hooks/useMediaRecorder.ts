const recordStream = (stream: MediaStream): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    let recorder: MediaRecorder | null = null;
    let chunks: BlobPart[] = [];
    try {
      // Extract only audio tracks from the stream for speech transcription
      const audioTracks = stream.getAudioTracks();

      if (audioTracks.length === 0) {
        reject(new Error("No audio tracks found in stream"));
        return;
      }

      // Create a new stream with only audio tracks
      const audioOnlyStream = new MediaStream(audioTracks);

      // Determine the best audio MIME type for speech recording
      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/ogg; codecs=opus")) {
        mimeType = "audio/ogg; codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm; codecs=opus")) {
        mimeType = "audio/webm; codecs=opus";
      } else {
        mimeType = "audio/wav";
      }

      // Create new MediaRecorder with audio-only stream
      recorder = new MediaRecorder(audioOnlyStream, {
        mimeType: mimeType,
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        chunks = [];
        resolve(blob);
      };

      recorder.onerror = (event) => {
        reject(new Error(`MediaRecorder error: ${event.error}`));
      };

      // Start recording
      recorder.start();

      // Stop recording after 5 seconds
      // TODO: Implement Web-VAD to detect when the user is speaking.
      setTimeout(() => {
        if (recorder && recorder.state === "recording") {
          recorder.stop();
        }
      }, 5000);
    } catch (error) {
      reject(error);
    }
  });
};

export default recordStream;
