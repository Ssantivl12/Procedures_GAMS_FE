import Swal from 'sweetalert2';

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
  customClass: {
    popup: 'rounded-xl border border-border bg-card text-foreground shadow-lg',
    title: 'text-sm font-semibold',
  }
});

export const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string) => {
  Toast.fire({
    icon,
    title,
  });
};
