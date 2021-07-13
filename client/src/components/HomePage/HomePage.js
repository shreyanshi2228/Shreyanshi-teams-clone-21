import { useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo,} from "@fortawesome/free-solid-svg-icons";
import shortid from "shortid";
import Header from "./../UI/Header/Header";
import "./HomePage.scss";

const HomePage = () => {

  const history = useHistory();

  const startCall = () => {
    const uid = shortid.generate();
    history.push(`/${uid}#init`);
  };

    return (
        <div className="home-page">
            <Header />
            <div className="body">
                <div className="left-side">
                    <div className="content">
                        <h2>Microsoft Teams</h2>
                        <p>
                            Meet, chat, call, and collaborate in just one place.
                        </p>
                        <div className="action-btn">
              <button className="btn green" onClick={startCall}>
                <FontAwesomeIcon className="icon-block" icon={faVideo} />
                Meet Now
              </button>
              
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};
export default HomePage;
