"use client";
import React from "react";
import Modal from "react-modal";

const customStyles = {
  overlay: { zIndex: 50 },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "transparent",
    border: "none",
  },
};

const ReactModal = ({ modalIsOpen, setIsOpen, links }) => {
  return (
    <div className="z-50 relative">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={(e) => {
          setIsOpen(!modalIsOpen);
        }}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className="w-[80vw] md:w-[40vw] max-h-[80vh] md:max-h-[50vh] overflow-x-hidden overflow-y-auto bg-black text-white p-5 rounded-md">
          <h1 className="text-xl mb-3 text-center font-semibold ">
            Links Shared
          </h1>
          {links?.map((e, i) => {
            return (
              <p key={i}>
                {i + 1}.{" "}
                <span
                  className="underline cursor-pointer"
                  onClick={() => {
                    window.open(e);
                  }}
                >
                  {e}
                </span>
              </p>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default ReactModal;
