import Nav from '../components/Nav'
import AuthModal from "../components/AuthModal"
import {useState} from 'react'
import {useCookies} from "react-cookie"
import { Loader2 } from "lucide-react" // Import loading icon

const Home = () => {
    const [showModal, setShowModal] = useState(false)
    const [isSignUp, setIsSignUp] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [cookies, setCookie, removeCookie] = useCookies(['user'])
    const authToken = cookies.AuthToken

    const handleClick = async () => {
        if (authToken) {
            removeCookie('UserId', cookies.UserId)
            removeCookie('AuthToken', cookies.AuthToken)
            window.location.reload()
            return
        }
        setIsLoading(true)
        try {
            // Add a small delay to ensure modal transitions smoothly
            await new Promise(resolve => setTimeout(resolve, 500))
            setShowModal(true)
            setIsSignUp(true)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="overlay">
            <Nav
                authToken={authToken}
                minimal={false}
                setShowModal={setShowModal}
                showModal={showModal}
                setIsSignUp={setIsSignUp}
            />
            <div className="home">
                <h1 className="primary-title">Love at first Bark®</h1>
                <button 
                    className="primary-button flex items-center gap-2" 
                    onClick={handleClick}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                           
                            <span>Please wait...</span>
                        </>
                    ) : (
                        authToken ? 'Signout' : 'Create Account'
                    )}
                </button>

                {showModal && (
                    <AuthModal setShowModal={setShowModal} isSignUp={isSignUp}/>
                )}
            </div>
        </div>
    )
}

export default Home