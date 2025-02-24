import React from "react";

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  containerClasses?: string;
};

const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
  containerClasses = "bg-white dark:bg-gray-800 p-8 rounded shadow-lg max-w-4xl w-[90vw]",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <div className={containerClasses}>{children}</div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl md:text-3xl text-gray-700 dark:text-gray-100 hover:text-gray-600 hover:dark:text-gray-50"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
