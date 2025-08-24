import { Role } from '@/stores/authStore'
import React, { useEffect, useState } from 'react'

interface MyAccountProps {
    role: Role
}
const MyAccount: React.FC<MyAccountProps> = ({ role }) => {
    
    if (role === 'customer'){
// useEffect(,) -fetch data
    const [username, setUsername] = useState('');
    const [address, setAddress] = useState('');
    }
    
    return (
        // background grey
        <>
            <div className="container bg-white w-[90vw] h-[90vh]">
                <div className="container w-[90%] h-[90%] py-11">
                    {role === 'customer' && (
                        <>
                            <span className="flex flex-col">
                                {/* Title */}
                                <span className="font-bold">Profile image</span>
                                <div className="w-full flex justify-center">
                                    <img
                                        src="https://picsum.photos/200"
                                        alt="Profile"
                                        className="w-50 h-50 object-cover border border-gray-300 shadow-sm"
                                    />
                                </div>

                                <span className="font-bold">Username</span>
                                <input className="mb-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 rounded-lg p-2"></input>

                                <span className="font-bold">Address</span>
                                <input className="mb-2 text-sm font-medium text-gray-900 dark:text-white border border-gray-300 rounded-lg p-2"></input>

                                <span className="font-bold">Password</span>
                                <button className="py-2 px-4 bg-gray-50 text-gray-900 text-sm font-medium border border-gray-200 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">Change password</button>
                            </span>
                            <div className="flex justify-end mt-4">
                                <button className="rounded-lg px-10 py-1 text-white"
                                    style={{ backgroundColor: '#1E7A5A' }}
                                >
                                    Update account
                                </button>
                            </div>

                        </>
                    )}
                </div>
            </div>

        </>
    )
}


export default MyAccount


