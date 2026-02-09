import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

/**
 * SmartMocaf Premium SWAL2 Theme
 * Minimalist, elegant, and modern aesthetic
 */

const colors = {
    primary: '#009e3e',
    danger: '#ef4444',
    warning: '#f59e0b',
    neutral: '#f3f4f6',
    text: '#111827',
    subtext: '#6b7280'
};

const baseCustomClass = {
    popup: 'rounded-[2rem] border-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl bg-white/95 p-8',
    title: 'text-2xl font-black text-gray-900 tracking-tight mb-2',
    htmlContainer: 'text-gray-500 font-medium leading-relaxed',
    confirmButton: 'rounded-2xl px-8 py-4 font-black uppercase tracking-[0.1em] text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#009e3e]/20 hover:shadow-xl hover:shadow-[#009e3e]/30 h-auto min-h-0',
    cancelButton: 'rounded-2xl px-8 py-4 font-black uppercase tracking-[0.1em] text-xs text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 transition-all h-auto min-h-0',
    actions: 'gap-4 mt-8',
};

// Premium Minimalist Icons
const icons = {
    success: `<div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#009e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    </div>`,
    error: `<div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </div>`,
    warning: `<div class="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    </div>`,
    question: `<div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-[#009e3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>`,
    delete: `<div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    </div>`,
    info: `<div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </div>`,
};

export function showSuccess(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
        html: `
            ${icons.success}
            <h2 class="${baseCustomClass.title}">${title}</h2>
            <div class="${baseCustomClass.htmlContainer}">${text || ''}</div>
        `,
        padding: '2rem',
        timer: 2500,
        showConfirmButton: false,
        customClass: baseCustomClass,
        showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
        hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' }
    });
}

export function showError(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
        html: `
            ${icons.error}
            <h2 class="${baseCustomClass.title}">${title}</h2>
            <div class="${baseCustomClass.htmlContainer}">${text || 'Silakan coba lagi'}</div>
        `,
        confirmButtonText: 'KERTI',
        confirmButtonColor: '#111827',
        customClass: baseCustomClass,
    });
}

export function showConfirm(
    title: string,
    text: string,
    confirmText: string = 'LANJUTKAN'
): Promise<SweetAlertResult> {
    return Swal.fire({
        html: `
            ${icons.question}
            <h2 class="${baseCustomClass.title}">${title}</h2>
            <div class="${baseCustomClass.htmlContainer}">${text}</div>
        `,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'BATAL',
        confirmButtonColor: colors.primary,
        customClass: baseCustomClass,
        reverseButtons: true,
    });
}

export function showDeleteConfirm(
    title: string = 'Hapus Data?',
    text: string = 'Data yang dihapus tidak dapat dikembalikan.'
): Promise<SweetAlertResult> {
    return Swal.fire({
        html: `
            ${icons.delete}
            <h2 class="${baseCustomClass.title}">${title}</h2>
            <div class="${baseCustomClass.htmlContainer}">${text}</div>
        `,
        showCancelButton: true,
        confirmButtonText: 'HAPUS SEKARANG',
        cancelButtonText: 'BATAL',
        confirmButtonColor: colors.danger,
        customClass: baseCustomClass,
        reverseButtons: true,
    });
}

export function showLoading(title: string = 'MEMPROSES...'): void {
    Swal.fire({
        title,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
            ...baseCustomClass,
            popup: 'rounded-[2rem] p-12 bg-white/95 backdrop-blur-xl border-0 shadow-2xl'
        },
        didOpen: () => {
            Swal.showLoading();
        },
    });
}

export function closeSwal(): void {
    Swal.close();
}

export { Swal };
