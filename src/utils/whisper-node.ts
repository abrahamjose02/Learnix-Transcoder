import { SpeechClient, protos } from '@google-cloud/speech';
import * as fs from 'fs';

// Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'D:\\Coding\\Learnix E -learn\\Microservice\\Learnix Trancode\\skilful-firefly-433706-v6-bb9e0bbc9177.json';

const client = new SpeechClient();

export const transcriber = async (filePath: string): Promise<void> => {
  try {
    // Read the audio file and encode it as base64
    const audioBytes = fs.readFileSync(filePath).toString('base64');

    // Configure the request with audio and recognition parameters
    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'LINEAR16' as any as protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding,
        sampleRateHertz: 16000, // Ensure this matches your audio sample rate
        languageCode: 'en-US',
      },
    };

    // Perform speech recognition
    const [response] = await client.recognize(request);

    // Extract and log the transcription
    if (response.results && response.results.length > 0) {
      const transcription = response.results
        .filter(result => result.alternatives && result.alternatives.length > 0)
        .map(result => result.alternatives![0].transcript) // Use non-null assertion operator since alternatives is checked
        .join('\n');

      console.log('Transcription completed:', transcription);

      // Optionally, save the transcription to a file (e.g., .vtt format)
      const vttFilePath = `${filePath}.vtt`;
      const vttContent = `WEBVTT\n\n${transcription}`; // Simple VTT format
      fs.writeFileSync(vttFilePath, vttContent);

      console.log(`Transcription saved to ${vttFilePath}`);
    } else {
      console.log('No results found in the response.');
    }
  } catch (err) {
    console.error('Error during transcription:', err);
    throw err;
  }
};
