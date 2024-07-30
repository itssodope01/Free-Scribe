import React, { useRef, useState, useEffect } from 'react'

function HomePage(props) {
    const {setAudioStream, setFile} = props;

    const [recordingStatus, setRecordingStatus] = useState('inactive');
    const [audioChunks, setAudioChunks] = useState([]);
    const [duration, setDuration] = useState(0);

    const mediaRecorder = useRef(null);

    const mimeType = 'audio/webm';

    const [stream, setStream] = useState(null);

    const startRecording = async () => {
        let tempStream
        console.log('Start recording')
    
        try {
            const streamData = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            })
            tempStream = streamData
            setStream(tempStream) 
        } catch (err) {
            console.log(err.message)
            return
        }
    
        setRecordingStatus('recording')
    
        const media = new MediaRecorder(tempStream, { type: mimeType })
        mediaRecorder.current = media
    
        mediaRecorder.current.start()
        let localAudioChunks = []
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') { return }
            if (event.data.size === 0) { return }
            localAudioChunks.push(event.data)
        }
        setAudioChunks(localAudioChunks)
    }
    
    const stopRecording = async () => {
        setRecordingStatus('inactive')
        console.log('Stop recording')
    
        mediaRecorder.current.stop()
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType })
            setAudioStream(audioBlob)
            setAudioChunks([])
            setDuration(0)
        }
    
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }
    }
    

    useEffect(() => {
        if (recordingStatus === 'recording') {
            const interval = setInterval(() => {
                setDuration((prevDuration) => prevDuration + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }
    , [recordingStatus]);
    

    return (
        <div>
            <main className='flex-1  p-4 flex flex-col gap-3 text-center sm:gap-4  justify-center pb-20 mt-10 '>
                
                <h1 className='font-semibold text-5xl sm:text-6xl md:text-7xl'>Free<span className='text-blue-400 bold'>Scribe</span></h1>
                <h3 className='font-medium md:text-lg'>Record <span className='text-blue-400'>&rarr;</span> Transcribe <span className='text-blue-400'>&rarr;</span> Translate</h3>
                {/* <p className='text-sm sm:text-base md:text-lg'>FreeScribe is a free speech-to-text transcription and translation tool that allows you to convert spoken words into written text in real-time.</p> */}
                <button className='flex specialBtn px-4 py-2 rounded-xl items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4'>
                    <p 
                    className='text-blue-400'
                    onClick={() => {
                        if (recordingStatus === 'inactive') {
                            startRecording();
                        } else {
                            stopRecording();
                        }
                    }}
                    >
                        {recordingStatus === 'inactive' ? 'Record' : 'Stop Recording'}
                    </p>
                    <div className='flex items-center gap-2'>
                        {recordingStatus === 'recording' && <p className='text-sm'>{duration}s</p>}
                        <i className={"fa-solid duration-200 fa-microphone " + 
                        (recordingStatus === 'recording' ? 'text-rose-300' : 'text-blue-400')}></i>
                    </div>
                </button>
                <p className='text-base'>Or&nbsp;
                    <label className='text-blue-400 cursor-pointer hover:text-blue-600 duration-200'>
                    upload 
                    <input 
                        onChange={(e) => {
                            const tempFile = e.target.files[0]
                            setFile(tempFile)
                        }} 
                    className='hidden' type='file' accept='.mp3,.wave' />
                    </label> a mp3 file</p>
                <p className='italic text-slate-400'>Free now free forever</p>
            </main>
        </div>
    )
}

export default HomePage


