import AuthForm from '@/components/AuthForm';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <AuthForm mode="REGISTER" />
        </div>
    );
}
