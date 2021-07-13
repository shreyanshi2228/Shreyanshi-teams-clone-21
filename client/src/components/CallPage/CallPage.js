import { useEffect, useState, useRef, useReducer } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getRequest, postRequest } from "./../../utils/apiRequests";
import {
    BASE_URL,
    GET_CALL_ID,
    GET_ICE_SERVER,
    SAVE_CALL_ID,
} from "./../../utils/apiEndpoints";
import io from "socket.io-client";
import CallPageHeader from "../UI/CallPageHeader/CallPageHeader";
import CallPageFooter from "../UI/CallPageFooter/CallPageFooter";
import MeetingInfo from "../UI/MeetingInfo/MeetingInfo";
import Messenger from "./../UI/Messenger/Messenger";
import MessageListReducer from "../../reducers/MessageListReducer";
import Alert from "../UI/Alert/Alert";
import Peer from "simple-peer";

import './CallPage.scss';

let peer = null;
const socket = io.connect(process.env.REACT_APP_BASE_URL);
const initialState = [];

const CallPage = () => {
    const history = useHistory();
    let { id } = useParams();
    const isAdmin = window.location.hash == "#init" ? true : false;
    const url = `${window.location.origin}${window.location.pathname}`;
    let alertTimeout = null;

    const [messageList, messageListReducer] = useReducer(
        MessageListReducer,
        initialState
    );

    const iceServers = useRef([]);

    const [streamObj, setStreamObj] = useState();
    const [screenCastStream, setScreenCastStream] = useState();
    const [meetInfoPopup, setMeetInfoPopup] = useState(false);
    const [isPresenting, setIsPresenting] = useState(false);
    const [isMessenger, setIsMessenger] = useState(false);
    const [messageAlert, setMessageAlert] = useState({});
    const [isAudio, setIsAudio] = useState(true);
    const [isVideo, setIsVideo] = useState(true);

    useEffect(() => {
        if (isAdmin) {
            setMeetInfoPopup(true);
            getICServer();
        } else {
            initWebRTC();
        }
        socket.on("code", (data) => {
            if (data.url === url) {
                peer.signal(data.code);
            }
        });
    }, []);

    const getICServer = async () => {
        const response = await getRequest(`${BASE_URL}${GET_ICE_SERVER}`);
        iceServers.current = response;
        initWebRTC();
    }

    const getRecieverCode = async () => {
        const response = await getRequest(`${BASE_URL}${GET_CALL_ID}/${id}`);
        if (response.code) {
            peer.signal(response.code);
        }
    };

    const initWebRTC = () => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        })
            .then((stream) => {
                setStreamObj(stream);

                if (isAdmin && iceServers.current && iceServers.current.length) {
                    peer = new Peer({
                        initiator: isAdmin,
                        trickle: false,
                        stream: stream,
                        config: {
                            iceServers: iceServers.current
                        }
                    });
                }

                if (!isAdmin) {
                    peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: stream,
                    });
                    getRecieverCode();
                }

                peer.on("signal", async (data) => {
                    if (isAdmin) {
                        console.log("data", data);
                        let payload = {
                            id,
                            signalData: data,
                        };
                        await postRequest(`${BASE_URL}${SAVE_CALL_ID}`, payload);
                    } else {
                        socket.emit("code", { code: data, url }, (cbData) => {
                            console.log("code sent");
                        });
                    }
                });

                peer.on("connect", () => {
                    console.log("peer connected");
                });

                peer.on("data", (data) => {
                    clearTimeout(alertTimeout);
                    messageListReducer({
                        type: "addMessage",
                        payload: {
                            user: "other",
                            msg: data.toString(),
                            time: Date.now(),
                        },
                    });

                    setMessageAlert({
                        alert: true,
                        isPopup: true,
                        payload: {
                            user: "other",
                            msg: data.toString(),
                        },
                    });

                    alertTimeout = setTimeout(() => {
                        setMessageAlert({
                            ...messageAlert,
                            isPopup: false,
                            payload: {},
                        });
                    }, 10000);
                });


                peer.on("stream", (stream) => {
                    // got remote video stream, now let's show it in a video tag
                    let video = document.querySelector("video");

                    if ("srcObject" in video) {
                        video.srcObject = stream;
                    } else {
                        video.src = window.URL.createObjectURL(stream); // for older browsers
                    }

                    video.play();
                });

            })
            .catch(() => {
                console.log("error");
            });

    };

    const screenShare = () => {
        navigator.mediaDevices
            .getDisplayMedia({ cursor: true })
            .then((screenStream) => {
                peer.replaceTrack(
                    streamObj.getVideoTracks()[0],
                    screenStream.getVideoTracks()[0],
                    streamObj
                );
                setScreenCastStream(screenStream);
                screenStream.getTracks()[0].onended = () => {
                    peer.replaceTrack(
                        screenStream.getVideoTracks()[0],
                        streamObj.getVideoTracks()[0],
                        streamObj
                    );
                };
                setIsPresenting(true);
            });
    };

    const sendMsg = (msg) => {
        peer.send(msg);
        messageListReducer({
            type: "addMessage",
            payload: {
                user: "you",
                msg: msg,
                time: Date.now(),
            },
        });
    };

    const stopScreenShare = () => {
        screenCastStream.getVideoTracks().forEach(function (track) {
            track.stop();
        });
        peer.replaceTrack(
            screenCastStream.getVideoTracks()[0],
            streamObj.getVideoTracks()[0],
            streamObj
        );
        setIsPresenting(false);
    };

    const toggleAudio = (value) => {
        streamObj.getAudioTracks()[0].enabled = value;
        setIsAudio(value);
    };
    const toggleVideo = (value) => {
        streamObj.getVideoTracks()[0].enabled = value;
        setIsVideo(value);
    };

    const disconnectCall = () => {
        peer.destroy();
        history.push("/");
        window.location.reload();
    };


    return (
        <div className="callpage-container">
            <video className="video-container" src="" controls></video>

            <CallPageHeader
                isMessenger={isMessenger}
                setIsMessenger={setIsMessenger}
                messageAlert={messageAlert}
                setMessageAlert={setMessageAlert}
            />
            <CallPageFooter
                isPresenting={isPresenting}
                stopScreenShare={stopScreenShare}
                screenShare={screenShare}
                isAudio={isAudio}
                toggleAudio={toggleAudio}
                isVideo={isVideo}
                toggleVideo={toggleVideo}
                disconnectCall={disconnectCall}
            />
            {isAdmin && meetInfoPopup && (
                <MeetingInfo setMeetInfoPopup={setMeetInfoPopup} url={url} />
            )}
            {isMessenger ? (
                <Messenger
                    setIsMessenger={setIsMessenger}
                    sendMsg={sendMsg}
                    messageList={messageList}
                />
            ) : (
                messageAlert.isPopup && <Alert messageAlert={messageAlert} />
            )}
        </div>
    );
};
export default CallPage;
