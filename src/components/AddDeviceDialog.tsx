'use client';

import { useState } from 'react';
import { createDevice } from '../app/actions/device';

export default function AddDeviceButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const name = formData.get('name') as string;
            const code = `DEV-${Date.now().toString().slice(-4)}`;
            await createDevice(name, code);
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            // Handle error (optional: toast)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 bg-[#C08080] text-white text-base font-medium rounded-xl hover:bg-[#A06060] transition-colors shadow-sm"
            >
                Tambah alat
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm relative">
                        {/* Title */}
                        <h3 className="text-sm font-normal text-black mb-2">Simpan Sebagai</h3>

                        <form action={handleSubmit}>
                            {/* Input */}
                            <input
                                name="name"
                                type="text"
                                required
                                autoFocus
                                className="w-full border border-gray-400 rounded-lg p-2.5 text-black outline-none focus:border-black mb-6"
                            />

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-[#C08080] text-white font-normal rounded-lg hover:bg-[#A06060] transition-colors"
                            >
                                {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </form>
                    </div>
                    <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
}
