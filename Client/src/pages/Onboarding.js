import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Nav from '../components/Nav';

const OnBoarding = () => {
    const [cookies, setCookie, removeCookie] = useCookies(null);
    const [formData, setFormData] = useState({
        user_id: cookies.UserId,
        first_name: "",
        breed: "",
        location: {
            text: "",  // City name
            coordinates: { lat: "", lon: "" } // Coordinates
        },
        age: "",
        url: "",
        about: "",
        matches: []
    });

    const [loading, setLoading] = useState(false); // Loading state
    const [locationLoading, setLocationLoading] = useState(false); // Loading state for location

    let navigate = useNavigate();

    const validateDogImage = async (imageUrl) => {
        const IMAGGA_API_KEY = process.env.REACT_APP_IMAGGA_API_KEY;
        const IMAGGA_API_SECRET = process.env.REACT_APP_IMAGGA_API_SECRET;
    
        const imaggaAuth = btoa(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`);

        try {
            const response = await axios.get(
                'https://api.imagga.com/v2/tags?image_url=' + encodeURIComponent(imageUrl),
                {
                    headers: {
                        Authorization: `Basic ${imaggaAuth}`,
                    },
                }
            );

            const tags = response.data.result.tags;
            const dogTag = tags.find(tag => tag.tag.en.toLowerCase() === 'dog');

            return dogTag && dogTag.confidence > 75;
        } catch (err) {
            console.error('Error during image validation:', err);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true); // Set loading to true on form submit

        const isDogImage = await validateDogImage(formData.url);
        
        if (!isDogImage) {
            alert("Please upload an image of a dog.");
            setLoading(false); // Reset loading state if validation fails
            return;
        }
    
        try {
            const response = await axios.put('http://localhost:8000/user', { formData });
            console.log(response);
            if (response.status === 200) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.log(err);
        }

        setLoading(false); // Reset loading state after form submission
    };

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        const name = e.target.name;

        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const getLocation = () => {
        setLocationLoading(true); // Set location loading to true

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
                    .then((response) => response.json())
                    .then((data) => {
                        setFormData((prevState) => ({
                            ...prevState,
                            location: {
                                text: data.locality || data.city || 'Location not found',
                                coordinates: {
                                    lat: latitude,
                                    lon: longitude
                                }
                            }
                        }));
                    })
                    .catch((error) => {
                        console.error('Error fetching location:', error);
                    });
            }, (error) => {
                console.error('Error getting location:', error);
                alert('Unable to retrieve your location.');
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }

        setLocationLoading(false); // Reset location loading after fetching
    };

    const styles = `
        .onboarding {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            box-sizing: border-box;
        }
        h2 {
            color: #ff4458;
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
        }
        form {
            background-color: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        section {
            margin-bottom: 1.5rem;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #4a5568;
            font-weight: bold;
        }
        input[type="text"],
        input[type="number"],
        input[type="url"] {
            width: 100%;
            padding: 0.75rem;
            margin-bottom: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-size: 1rem;
        }
        input[type="submit"] {
            width: 100%;
            padding: 0.75rem;
            background-color: #ff4458;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        input[type="submit"]:hover {
            background-color: #ff2d44;
        }
        .location-container {
            display: flex;
            margin-bottom: 1rem;
        }
        .location-container input {
            flex-grow: 1;
            margin-right: 0.5rem;
            margin-bottom: 0;
        }
        .location-container button {
            padding: 0.75rem;
            background-color: #ff4458;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        .location-container button:hover {
            background-color: #ff2d44;
        }
        .photo-container {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        .photo-container img {
            max-width: 100%;
            max-height: 200px;
            border-radius: 4px;
        }
        .loading {
            display: inline-block;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #ff4458;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    return (
        <>
            <style>{styles}</style>
            <Link to="/">
                <Nav
                    minimal={true}
                    setShowModal={() => {}}
                    showModal={false}
                />
            </Link>
            <div className="onboarding">
                <h2>CREATE ACCOUNT</h2>
                <form onSubmit={handleSubmit}>
                    <section>
                        <label htmlFor="first_name">First Name</label>
                        <input
                            id="first_name"
                            type='text'
                            name="first_name"
                            placeholder="First Name"
                            required={true}
                            value={formData.first_name}
                            onChange={handleChange}
                        />

                        <label htmlFor="breed">Breed</label>
                        <input
                            id="breed"
                            type='text'
                            name="breed"
                            placeholder="Breed"
                            required={true}
                            value={formData.breed}
                            onChange={handleChange}
                        />

                        <label htmlFor="location">Location</label>
                        <div className="location-container">
                            <input
                                id="location"
                                type='text'
                                name="location"
                                placeholder="Location"
                                required={true}
                                value={formData.location.text}  // Display city name
                                onChange={handleChange}
                            />
                            <button type="button" onClick={getLocation}>
                                {locationLoading ? (
                                    <div className="loading"></div>
                                ) : (
                                    'Use My Location'
                                )}
                            </button>
                        </div>

                        <label htmlFor="age">Age</label>
                        <input
                            id="age"
                            type="number"
                            name="age"
                            placeholder="Age"
                            required={true}
                            value={formData.age}
                            onChange={handleChange}
                        />

                        <label htmlFor="about">About me</label>
                        <input
                            id="about"
                            type="text"
                            name="about"
                            placeholder="About me"
                            required={true}
                            value={formData.about}
                            onChange={handleChange}
                        />

                        <label htmlFor="url">Photo URL</label>
                        <input
                            id="url"
                            type="url"
                            name="url"
                            placeholder="Photo URL"
                            required={true}
                            value={formData.url}
                            onChange={handleChange}
                        />
                    </section>

                    <div className="photo-container">
                        {formData.url && (
                            <img src={formData.url} alt="Dog" />
                        )}
                    </div>

                    <input
                        type="submit"
                        value={loading ? 'Creating...' : 'Create Account'}
                        disabled={loading}
                    />
                </form>
            </div>
        </>
    );
};

export default OnBoarding;
