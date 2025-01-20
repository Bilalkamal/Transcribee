# flask_transcriber/app.py
from flask import Flask, request, jsonify
from flask_transcriber.transcription_logic import process_transcription
import logging

app = Flask(__name__)

# Configure Logging
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

@app.route('/process_transcription', methods=['POST'])
def process_transcription_endpoint():
    try:
        data = request.get_json()
        if not data or 'video_id' not in data or 'job_id' not in data:
            logging.warning("Invalid request data.")
            return jsonify({'status': 'error', 'message': 'Invalid request data.'}), 400

        video_id = data['video_id']
        job_id = data['job_id']

        # Start the transcription process
        process_transcription(video_id, job_id)

        return jsonify({'status': 'success', 'message': 'Transcription processed.'}), 200
    except Exception as e:
        logging.error(f"Error processing transcription: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9696)
