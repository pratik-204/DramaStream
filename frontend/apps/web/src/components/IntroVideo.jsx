import './IntroVideo.css';

function IntroVideo({ onEnd }) {
    return (
        <div className="intro-container">
            <video
                className="intro-video"
                autoPlay
                muted
                playsInline
                onEnded={onEnd}
            >
                <source src="/intro%20video/temp.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

export default IntroVideo;
