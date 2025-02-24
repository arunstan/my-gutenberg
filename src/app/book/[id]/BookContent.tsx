import Modal from "@/app/components/Modal";
import React from "react";

type BookContentProps = {
  content: string;
  onClose: () => void;
};

const contentStyle = {
  fontFamily: "Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif",
};

export default function BookContent({ content, onClose }: BookContentProps) {
  return (
    <Modal onClose={onClose}>
      <div
        className="whitespace-pre-wrap text-xl max-h-[80vh] overflow-y-auto p-2 leading-8"
        style={contentStyle}
      >
        {content || "No content available."}
      </div>
    </Modal>
  );
}
