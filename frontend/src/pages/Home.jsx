import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/logout");
    };

    return (
        <div className="home-container">
            <div className="header">
                <h2>Welcome</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            <div className="nav-buttons">
                <button onClick={() => navigate("/vehicles")}>Vehicles</button>
                <button onClick={() => navigate("/documents")}>Documents</button>
                <button onClick={() => navigate("/detection")}>Detection</button>
            </div>
        </div>
    );
}

export default Home;
