// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Le Nguyen Khuong Duy
// ID: s402664

import React, { useState } from 'react';
import ChatBox from './ChatBox';

interface FloatingChatProps {
  senderId: string;
  receiverId: string | undefined;
  trigger: React.ReactNode; // nút trigger bên ngoài
}

export default function FloatingChat({
  senderId,
  receiverId,
  trigger,
}: FloatingChatProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button */}
      <span onClick={() => setOpen(true)}>{trigger}</span>

      {/* Floating chat box */}
      {open && (
        <div className="fixed bottom-4 right-24 z-50 w-[350px] h-[500px] bg-white shadow-xl rounded-lg flex flex-col border">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b bg-[#1E7A5A] text-white rounded-t-lg">
            <p className="font-semibold">Chat with Vendor</p>
            <button onClick={() => setOpen(false)} className="hover:opacity-80">
              ✕
            </button>
          </div>

          {/* Chat content */}
          <div className="flex-1 overflow-hidden">
            <ChatBox senderId={senderId} receiverId={receiverId} />
          </div>
        </div>
      )}
    </>
  );
}
