import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [show, setShow] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>();

    const confirm = (opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setShow(true);

        return new Promise((resolve) => {
            setResolvePromise(() => resolve);
        });
    };

    const handleClose = (result: boolean) => {
        setShow(false);
        resolvePromise?.(result);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            <Modal show={show} onHide={() => handleClose(false)} centered data-bs-theme="dark">
                <Modal.Header closeButton className="bg-dark text-light border-secondary">
                    <Modal.Title>{options?.title || 'Confirm Action'}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="bg-dark text-light">
                    <div className="d-flex align-items-start gap-3">
                        <i className="bi bi-exclamation-triangle-fill text-warning fs-3"></i>
                        <div>{options?.message}</div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="bg-dark border-secondary">
                    <Button variant="secondary" onClick={() => handleClose(false)}>
                        {options?.cancelText || 'Cancel'}
                    </Button>
                    <Button variant="danger" onClick={() => handleClose(true)}>
                        {options?.confirmText || 'Confirm'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
};