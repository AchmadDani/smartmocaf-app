import Swal, { SweetAlertResult } from 'sweetalert2';

/**
 * SmartMocaf SweetAlert2 Theme
 * Modern, clean, animated alerts with brand consistency
 */

// Inject custom CSS animations once
if (typeof window !== 'undefined') {
    const styleId = 'swal-smartmocaf-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes swal-check-draw {
                0% { stroke-dashoffset: 36; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes swal-x-draw {
                0% { stroke-dashoffset: 24; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes swal-icon-pop {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes swal-circle-draw {
                0% { stroke-dashoffset: 283; }
                100% { stroke-dashoffset: 0; }
            }
            @keyframes swal-shake {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-4px); }
                40%, 80% { transform: translateX(4px); }
            }
            @keyframes swal-pulse-ring {
                0% { transform: scale(0.8); opacity: 1; }
                100% { transform: scale(1.4); opacity: 0; }
            }
            @keyframes swal-spin {
                to { transform: rotate(360deg); }
            }
            .swal-icon-animated {
                animation: swal-icon-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .swal-check-path {
                stroke-dasharray: 36;
                stroke-dashoffset: 36;
                animation: swal-check-draw 0.4s ease 0.2s forwards;
            }
            .swal-x-path {
                stroke-dasharray: 24;
                stroke-dashoffset: 24;
                animation: swal-x-draw 0.3s ease 0.2s forwards;
            }
            .swal-circle-path {
                stroke-dasharray: 283;
                stroke-dashoffset: 283;
                animation: swal-circle-draw 0.6s ease forwards;
            }
            .swal-shake {
                animation: swal-shake 0.4s ease 0.3s;
            }
            .swal-pulse-ring {
                animation: swal-pulse-ring 1s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            }
            .swal-spinner {
                animation: swal-spin 0.8s linear infinite;
            }

            /* ── SweetAlert2 Premium Override ── */
            .swal2-popup.swal-premium {
                border-radius: 1.5rem !important;
                padding: 2.5rem 1.5rem !important;
                border: none !important;
                box-shadow: 0 25px 60px rgba(0,0,0,0.15) !important;
                max-width: 400px !important;
                font-family: inherit !important;
            }
            .swal2-popup.swal-premium .swal2-actions {
                gap: 0.875rem !important;
                margin-top: 2rem !important;
                width: 100% !important;
                padding: 0 1rem !important;
            }
            .swal2-popup.swal-premium .swal2-html-container {
                margin: 0.5rem 0 0 !important;
                padding: 0 !important;
            }

            /* ── Button base (buttonsStyling: false) ── */
            .swal-btn {
                border: none !important;
                border-radius: 1rem !important;
                padding: 0.875rem 1.5rem !important;
                font-weight: 800 !important;
                font-size: 0.875rem !important;
                letter-spacing: 0.025em !important;
                text-transform: uppercase !important;
                cursor: pointer !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                min-height: 52px !important;
                flex: 1 !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                outline: none !important;
            }
            .swal-btn:active {
                transform: scale(0.95) !important;
            }

            /* Confirm: Brand Primary (Green) */
            .swal-btn-confirm {
                background: #009e3e !important;
                color: white !important;
                box-shadow: 0 10px 20px -5px rgba(0, 158, 62, 0.3) !important;
            }
            .swal-btn-confirm:hover {
                background: #008a36 !important;
                box-shadow: 0 15px 25px -5px rgba(0, 158, 62, 0.4) !important;
                transform: translateY(-2px) !important;
            }

            /* Confirm: Danger (Red) */
            .swal-btn-danger {
                background: #ef4444 !important;
                color: white !important;
                box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.3) !important;
            }
            .swal-btn-danger:hover {
                background: #dc2626 !important;
                box-shadow: 0 15px 25px -5px rgba(239, 68, 68, 0.4) !important;
                transform: translateY(-2px) !important;
            }

            /* Confirm: Dark (For Errors/Info) */
            .swal-btn-dark {
                background: #1f2937 !important;
                color: white !important;
                box-shadow: 0 10px 20px -5px rgba(31, 41, 55, 0.3) !important;
            }
            .swal-btn-dark:hover {
                background: #111827 !important;
                box-shadow: 0 15px 25px -5px rgba(31, 41, 55, 0.4) !important;
                transform: translateY(-2px) !important;
            }

            /* Cancel: Subtle */
            .swal-btn-cancel {
                background: #f3f4f6 !important;
                color: #4b5563 !important;
                border: none !important;
            }
            .swal-btn-cancel:hover {
                background: #e5e7eb !important;
                color: #1f2937 !important;
                transform: translateY(-1px) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

const animatedIcons = {
    success: `
        <div class="swal-icon-animated" style="width:80px;height:80px;margin:0 auto 1.5rem;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative">
            <svg class="swal-circle-path" width="80" height="80" viewBox="0 0 80 80" fill="none" style="position:absolute;inset:0">
                <circle cx="40" cy="40" r="38" stroke="#009e3e" stroke-width="2" fill="none" opacity="0.3"/>
            </svg>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#009e3e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path class="swal-check-path" d="M5 13l4 4L19 7"/>
            </svg>
        </div>`,
    error: `
        <div class="swal-icon-animated swal-shake" style="width:80px;height:80px;margin:0 auto 1.5rem;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line class="swal-x-path" x1="6" y1="6" x2="18" y2="18"/>
                <line class="swal-x-path" x1="18" y1="6" x2="6" y2="18" style="animation-delay:0.35s"/>
            </svg>
        </div>`,
    warning: `
        <div class="swal-icon-animated" style="width:80px;height:80px;margin:0 auto 1.5rem;background:#fffbeb;border-radius:50%;display:flex;align-items:center;justify-content:center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </div>`,
    question: `
        <div class="swal-icon-animated" style="width:80px;height:80px;margin:0 auto 1.5rem;background:#f0fdf4;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative">
            <div class="swal-pulse-ring" style="position:absolute;inset:0;border-radius:50%;border:2px solid #009e3e;opacity:0.2"></div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#009e3e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
        </div>`,
    logout: `
        <div class="swal-icon-animated" style="width:80px;height:80px;margin:0 auto 1.5rem;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
        </div>`,
    delete: `
        <div class="swal-icon-animated swal-shake" style="width:80px;height:80px;margin:0 auto 1.5rem;background:#fef2f2;border-radius:50%;display:flex;align-items:center;justify-content:center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
        </div>`,
    loading: `
        <div class="swal-icon-animated" style="width:80px;height:80px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center">
            <svg class="swal-spinner" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#e5e7eb" stroke-width="3"/>
                <path d="M20 2a18 18 0 0118 18" stroke="#009e3e" stroke-width="3" stroke-linecap="round"/>
            </svg>
        </div>`,
};

function buildHtml(icon: string, title: string, text?: string): string {
    return `
        ${icon}
        <h2 style="font-size:1.5rem;font-weight:900;color:#111827;margin:0 0 0.5rem;line-height:1.2;letter-spacing:-0.02em">${title}</h2>
        ${text ? `<p style="font-size:1rem;color:#4b5563;margin:0;line-height:1.6;font-weight:500">${text}</p>` : ''}
    `;
}

const basePopupClass = {
    popup: 'swal-premium',
    htmlContainer: '',
    title: '',
    actions: '',
};

export function showSuccess(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
        html: buildHtml(animatedIcons.success, title, text),
        timer: 3000,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: basePopupClass,
        showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
        hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
    });
}

export function showError(title: string, text?: string): Promise<SweetAlertResult> {
    return Swal.fire({
        html: buildHtml(animatedIcons.error, title, text || 'Silakan coba lagi.'),
        confirmButtonText: 'MENGERTI',
        buttonsStyling: false,
        customClass: {
            ...basePopupClass,
            confirmButton: 'swal-btn swal-btn-dark',
        },
    });
}

export function showConfirm(
    title: string,
    text: string,
    confirmText: string = 'LANJUTKAN'
): Promise<SweetAlertResult> {
    return Swal.fire({
        html: buildHtml(animatedIcons.question, title, text),
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'BATAL',
        buttonsStyling: false,
        customClass: {
            ...basePopupClass,
            confirmButton: 'swal-btn swal-btn-confirm',
            cancelButton: 'swal-btn swal-btn-cancel',
        },
        reverseButtons: true,
    });
}

export function showDeleteConfirm(
    title: string = 'Hapus Data?',
    text: string = 'Data yang dihapus tidak dapat dikembalikan.'
): Promise<SweetAlertResult> {
    return Swal.fire({
        html: buildHtml(animatedIcons.delete, title, text),
        showCancelButton: true,
        confirmButtonText: 'HAPUS',
        cancelButtonText: 'BATAL',
        buttonsStyling: false,
        customClass: {
            ...basePopupClass,
            confirmButton: 'swal-btn swal-btn-danger',
            cancelButton: 'swal-btn swal-btn-cancel',
        },
        reverseButtons: true,
    });
}

export function showLogoutConfirm(): Promise<SweetAlertResult> {
    return Swal.fire({
        html: buildHtml(animatedIcons.logout, 'Keluar dari Akun?', 'Anda akan diarahkan ke halaman login.'),
        showCancelButton: true,
        confirmButtonText: 'KELUAR',
        cancelButtonText: 'BATAL',
        buttonsStyling: false,
        customClass: {
            ...basePopupClass,
            confirmButton: 'swal-btn swal-btn-danger',
            cancelButton: 'swal-btn swal-btn-cancel',
        },
        reverseButtons: true,
    });
}

export function showLoading(title: string = 'Memproses...'): void {
    Swal.fire({
        html: `
            ${animatedIcons.loading}
            <h2 style="font-size:1.125rem;font-weight:800;color:#111827;margin:0;letter-spacing:-0.01em">${title}</h2>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        buttonsStyling: false,
        customClass: basePopupClass,
    });
}

export function closeSwal(): void {
    Swal.close();
}

export { Swal };
