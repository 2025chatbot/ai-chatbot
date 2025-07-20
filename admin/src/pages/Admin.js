import React, { useState } from 'react';

const Admin = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a JSON file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            setMessage(data.message);
        } catch (err) {
            setMessage('Error uploading file.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-lg font-semibold mb-4">Upload a JSON File</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleChange}
                        className="block w-full text-sm border rounded px-3 py-2"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                        Upload
                    </button>
                </form>
                {message && <p className="mt-4 text-sm text-center text-gray-700">{message}</p>}
            </div>
        </div>
    );
};

export default Admin;
