import Form from "../components/Form"
import { Link } from "react-router-dom";
import "../styles/Login.css"; // 👈 Import the stylesheet
function Register() {
    return(
        <div className="login-wrapper">
            <Form route="/api/register/" method="register" />
            <p className="register-link">
                Already have an account?{" "}
                <Link to="/login">Login</Link>
            </p>
        </div>
    )
}

export default Register
