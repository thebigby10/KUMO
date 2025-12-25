"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateLabModal from "../components/CreateLabModal";

export default function CreateLabModalWrapper({ userEmail }: { userEmail: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
        title="Create or join a class"
      >
        <Plus size={24} />
      </button>

      <CreateLabModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userEmail={userEmail}
      />
    </>
  );
}