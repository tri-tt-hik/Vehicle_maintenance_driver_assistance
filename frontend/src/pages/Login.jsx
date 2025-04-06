import { Link } from "react-router-dom";
import Form from "../components/Form";
import "../styles/Login.css"; // 👈 Import the stylesheet

function Login() {
    return (
        <div className="login-wrapper">
            <Form route="/api/token/" method="login" />
            <p className="register-link">
                Don’t have an account?{" "}
                <Link to="/register">Register</Link>
            </p>
        </div>
    );
}

export default Login;
