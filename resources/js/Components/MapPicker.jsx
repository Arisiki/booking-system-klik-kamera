import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const center = {
    lat: -8.409518, // Default center (Denpasar, Bali)
    lng: 115.188919,
};

const libraries = ['places'];

export default function MapPicker({ onAddressSelect, initialAddress = '' }) {
    const apiKey = window.googleMapsApiKey;
    
    
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey,
        libraries,
    });

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [address, setAddress] = useState(initialAddress);
    const [showInfoWindow, setShowInfoWindow] = useState(false);
    
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);


    // Handle place selection
    const handlePlaceSelect = () => {
        if (!autocompleteRef.current) return;
        
        const place = autocompleteRef.current.getPlace();
        console.log("Place selected:", place);
        
        if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            setSelectedLocation({ lat, lng });
            setShowInfoWindow(true);
            
            // Update the address
            const fullAddress = place.formatted_address;
            setAddress(fullAddress);
            onAddressSelect(fullAddress);
        }
    };

    // Setup autocomplete when the map is loaded
    useEffect(() => {
        if (isLoaded && inputRef.current) {
            try {
                const autocompleteOptions = {
                    componentRestrictions: { country: 'id' },
                    fields: ['formatted_address', 'geometry', 'name'],
                };
                
                autocompleteRef.current = new window.google.maps.places.Autocomplete(
                    inputRef.current,
                    autocompleteOptions
                );
                
                // Add listener for place selection
                autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
                
                console.log("Autocomplete initialized successfully");
            } catch (error) {
                console.error("Error initializing autocomplete:", error);
            }
        }
        
        // Cleanup
        return () => {
            if (autocompleteRef.current && window.google && window.google.maps) {
                try {
                    window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
                } catch (error) {
                    console.error("Error cleaning up autocomplete:", error);
                }
            }
        };
    }, [isLoaded]);

    const handleMapClick = async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedLocation({ lat, lng });
        setShowInfoWindow(true);

        try {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const fullAddress = results[0].formatted_address;
                    setAddress(fullAddress);
                    
                    // Update the input field with the selected address
                    if (inputRef.current) {
                        inputRef.current.value = fullAddress;
                    }
                    
                    onAddressSelect(fullAddress);
                } else {
                    console.error("Geocoding failed:", status);
                    setAddress('Alamat tidak ditemukan');
                }
            });
        } catch (error) {
            console.error("Error during geocoding:", error);
        }
    };

    // Handle address input change
    const handleAddressChange = (e) => {
        setAddress(e.target.value);
        onAddressSelect(e.target.value);
    };

    if (loadError) {
        console.error("Error loading Google Maps:", loadError);
        return <div>Error loading maps: {loadError.message}</div>;
    }
    
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div>
            {/* Address input with autocomplete */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                    Masukan Alamat Lengkap
                </label>
                <input
                    ref={inputRef}
                    type='text'
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Cari alamat..."
                    required
                    maxLength={200}
                    style={{ 
                        width: '100%', 
                        padding: '8px', 
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    Ketik alamat untuk mendapatkan rekomendasi atau pilih lokasi pada peta
                </small>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={selectedLocation || center}
                onClick={handleMapClick}
                options={{
                    fullscreenControl: false,
                    streetViewControl: true,
                    mapTypeControl: false,
                    zoomControl: true
                }}
            >
                {selectedLocation && (
                    <Marker
                        position={selectedLocation}
                        animation={window.google.maps.Animation.DROP}
                    >
                        {showInfoWindow && (
                            <InfoWindow
                                position={selectedLocation}
                                onCloseClick={() => setShowInfoWindow(false)}
                            >
                                <div>
                                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        {address}
                                    </p>
                                    <p style={{ fontSize: '12px', margin: 0 }}>
                                        Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                                    </p>
                                </div>
                            </InfoWindow>
                        )}
                    </Marker>
                )}
            </GoogleMap>

            {selectedLocation && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Alamat Terpilih:</h3>
                    <p style={{ margin: '0 0 5px 0' }}>{address}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        Koordinat: Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                    </p>
                </div>
            )}
        </div>
    );
}