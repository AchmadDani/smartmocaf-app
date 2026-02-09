import AuthForm from '@/components/AuthForm';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthFooter from '@/components/auth/AuthFooter';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f0fdf4] to-[#dcfce7] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            <AuthHeader />
            
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-[#009e3e]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#00c853]/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full flex justify-center py-24">
                <AuthForm mode="REGISTER" />
            </div>

            <AuthFooter />
        </div>
    );
}
