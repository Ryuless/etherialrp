import { useEffect, useState } from 'react';

const CLOSE_ANIMATION_MS = 180;

export default function AnimatedModal({ onClose, maxWidth = '700px', children }) {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                requestClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    });

    const requestClose = () => {
        if (isClosing) return;
        setIsClosing(true);
        setTimeout(() => {
            onClose?.();
        }, CLOSE_ANIMATION_MS);
    };

    return (
        <div className={`omni-modal-backdrop${isClosing ? ' closing' : ''}`} onClick={requestClose}>
            <div
                className={`omni-modal-panel${isClosing ? ' closing' : ''}`}
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
            >
                {typeof children === 'function' ? children(requestClose) : children}
            </div>
        </div>
    );
}
