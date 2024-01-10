import { useContext } from 'react';
import { ToastContext } from '../components/context/ToastContext';

export const useToast = () => useContext(ToastContext);
