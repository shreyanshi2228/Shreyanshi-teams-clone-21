import { Link } from "react-router-dom";
import "./NoMatch.scss";

const NoMatch = () => {
  return (
    <div className="no-match">
      <div className="content">
        <h2>Invalid video call link.</h2>
        <div className="action-btn">
          <Link className="btn white" to="/">
            Click here to return to home screen!
          </Link>
        </div>
      </div>
    </div>
  );
};
export default NoMatch;
