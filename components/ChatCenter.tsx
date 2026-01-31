import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';

interface ChatCenterProps {
  user: User;
  messages: Message[];
  contacts: User[];
  onSendMessage: (text: string, receiverId: string) => void;
}

const ChatCenter: React.FC<ChatCenterProps> = ({ user, messages, contacts, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isOpen, selectedContact]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedContact) return;
    onSendMessage(inputText, selectedContact.id);
    setInputText('');
  };

  const currentChatMessages = messages.filter(m => 
    (m.senderId === user.id && m.receiverId === selectedContact?.id) ||
    (m.senderId === selectedContact?.id && m.receiverId === user.id)
  );

  return (
    <div className={`fixed z-[200] transition-all duration-700 font-arabic ${isOpen ? 'inset-0 flex flex-col md:inset-auto md:bottom-10 md:left-10 md:w-[450px] md:h-[700px]' : 'bottom-6 left-6'}`} dir="rtl">
      {isOpen && (
        <div className="w-full h-full bg-white md:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-10 duration-500">
          {/* Chat Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-6 sm:p-8 text-white flex justify-between items-center shadow-xl flex-shrink-0">
            {selectedContact ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedContact(null)} className="font-black text-2xl hover:scale-110 transition-transform">←</button>
                <div className="flex items-center gap-3">
                  <img src={selectedContact.avatar} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-white/20 object-cover" alt={selectedContact.name} />
                  <div className="text-right">
                    <p className="font-black text-sm sm:text-lg leading-none">{selectedContact.name}</p>
                    <p className="text-[10px] text-blue-100 font-bold opacity-70 mt-1">
                      {selectedContact.role === 'DOCTOR' ? (selectedContact.specialty || 'طبيب') : 'مريض'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
               <h3 className="text-xl sm:text-2xl font-black tracking-tight">محادثاتي</h3>
            )}
            <button onClick={() => setIsOpen(false)} className="text-3xl font-black opacity-40 hover:opacity-100 transition-opacity">×</button>
          </div>
          
          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4 custom-scrollbar" ref={scrollRef}>
            {!selectedContact ? (
              <div className="space-y-3">
                {contacts.length === 0 ? (
                  <div className="py-24 text-center text-slate-400 font-bold px-10">
                    <div className="text-4xl mb-4">📭</div>
                    لا توجد جهات اتصال نشطة حالياً. بمجرد وجود حجز أو تواصل، سيظهر هنا.
                  </div>
                ) : (
                  contacts.map(c => (
                    <button key={c.id} onClick={() => setSelectedContact(c)} className="w-full p-4 bg-white border border-slate-100 rounded-[1.5rem] text-right flex items-center gap-4 hover:border-blue-400 hover:shadow-lg transition-all">
                      <img src={c.avatar} className="w-12 h-12 rounded-xl border-2 border-slate-50 object-cover" alt={c.name} />
                      <div className="flex-1">
                        <p className="font-black text-slate-800 leading-none">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1.5">{c.role === 'DOCTOR' ? c.specialty : 'مريض مسجل'}</p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {currentChatMessages.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 font-bold text-sm">ابدأ المحادثة الآن...</div>
                ) : (
                  currentChatMessages.map(m => (
                    <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-4 rounded-[1.5rem] text-sm font-bold max-w-[85%] shadow-sm ${
                         m.senderId === user.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          {selectedContact && (
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex gap-3 flex-shrink-0">
              <input 
                type="text" 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleSend()} 
                className="flex-1 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner" 
                placeholder="اكتب رسالتك..." 
              />
              <button onClick={handleSend} className="bg-blue-600 text-white w-12 h-12 rounded-[1rem] flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all shadow-lg">
                <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          )}
        </div>
      )}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 active:scale-90 transition-all animate-bounce"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatCenter;
