import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Users, Clock, ShieldCheck, Edit3 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { PET_SPECIES } from '../../data/species';
import { soundManager } from '../../utils/audio';

export interface RealChatMessage {
  id: string;
  sender: string;
  avatar: string;
  badge?: string;
  text: string;
  timestamp: string;
  createdAt?: number;
}

const CLIENT_ID_KEY = 'azuki_trainer_client_id';
const TRAINER_NAME_KEY = 'azuki_trainer_name';

function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = `trainer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

export const GlobalChat: React.FC = () => {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<RealChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // User details
  const [trainerName, setTrainerName] = useState(() => {
    return localStorage.getItem(TRAINER_NAME_KEY) || `Trainer_${Math.floor(100 + Math.random() * 900)}`;
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(trainerName);

  // Input & 3s Cooldown timer
  const [inputMessage, setInputMessage] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Current equipped pet avatar
  const primaryPet = state.inventory.find((p) => state.equippedPetIds[0] === p.id) || state.inventory[0];
  const petSpecies = primaryPet ? PET_SPECIES.find((s) => s.id === primaryPet.speciesId) : null;
  const playerAvatar = petSpecies?.iconSvg || '🐾';

  // Cooldown countdown interval
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Connect to Real WebSocket
  useEffect(() => {
    let isMounted = true;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isMounted) return;
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              if (Array.isArray(data.messages)) {
                setMessages(data.messages);
              }
              if (typeof data.onlineCount === 'number') {
                setOnlineCount(data.onlineCount);
              }
            } else if (data.type === 'message:new' && data.message) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev.slice(-99), data.message];
              });
              soundManager.playTap();
              if (!isOpen) {
                setUnreadCount((c) => Math.min(99, c + 1));
              }
            } else if (data.type === 'online_count' && typeof data.onlineCount === 'number') {
              setOnlineCount(data.onlineCount);
            } else if (data.type === 'cooldown:started') {
              setCooldownRemaining(data.cooldownSeconds || 3);
            } else if (data.type === 'error:cooldown') {
              setCooldownRemaining(data.remainingSeconds || 3);
              setErrorMessage(data.message);
              setTimeout(() => setErrorMessage(null), 3000);
            }
          } catch (e) {
            console.error('Error parsing WS event:', e);
          }
        };

        socket.onclose = () => {
          if (!isMounted) return;
          setIsConnected(false);
          // Try reconnect in 3s
          reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch (e) {
        console.warn('WS connection setup failed, will retry:', e);
        reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 4000);
      }
    };

    connectWebSocket();

    // Also fetch initial messages via REST in case WS takes a moment to handshake
    fetch('/api/chat/messages')
      .then((r) => r.json())
      .then((data) => {
        if (isMounted && Array.isArray(data.messages)) {
          setMessages((prev) => (prev.length === 0 ? data.messages : prev));
          if (typeof data.onlineCount === 'number') {
            setOnlineCount(data.onlineCount);
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Auto-scroll on new message if open
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tempName.trim().slice(0, 18);
    if (clean) {
      setTrainerName(clean);
      localStorage.setItem(TRAINER_NAME_KEY, clean);
      setIsEditingName(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || cooldownRemaining > 0) return;

    const textToSend = inputMessage.trim();
    const clientId = getClientId();
    const badgeText = state.rebirths > 0 ? `R${state.rebirths}` : undefined;

    // Start 3-second cooldown immediately on client
    setCooldownRemaining(3);
    setInputMessage('');

    // If WebSocket is open, send via WS
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat:send',
          sender: trainerName,
          avatar: playerAvatar,
          badge: badgeText,
          text: textToSend,
          clientId,
        })
      );
    } else {
      // Fallback via HTTP POST
      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: trainerName,
            avatar: playerAvatar,
            badge: badgeText,
            text: textToSend,
            clientId,
          }),
        });

        if (res.status === 429) {
          const errData = await res.json();
          setCooldownRemaining(errData.remainingSeconds || 3);
          setErrorMessage(errData.error || 'Please wait before replying.');
          setTimeout(() => setErrorMessage(null), 3000);
        } else if (res.ok) {
          const resData = await res.json();
          if (resData.message) {
            setMessages((prev) => [...prev.slice(-99), resData.message]);
          }
        }
      } catch (err) {
        console.error('Failed to post chat message:', err);
      }
    }
  };

  const latestMessage = messages[messages.length - 1];

  return (
    <>
      {/* FLOATING CHAT BUTTON / TICKER (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-16 right-3 sm:right-6 z-40 max-w-[280px] sm:max-w-[340px] flex items-center gap-2 animate-fade-in">
          <button
            onClick={() => {
              setIsOpen(true);
              setUnreadCount(0);
            }}
            className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-slate-900/95 hover:bg-slate-850 border border-amber-500/50 shadow-2xl backdrop-blur-md text-left transition-all hover:scale-102 cursor-pointer ring-1 ring-amber-400/20"
          >
            <div className="relative shrink-0 w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-sm">
              <MessageSquare className="w-4 h-4 text-amber-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-black rounded-full bg-rose-600 text-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5 leading-none mb-0.5">
                <span className="text-[10px] font-black text-amber-300 truncate">
                  Global Chat
                </span>
                <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  {onlineCount} online
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate max-w-[190px] sm:max-w-[230px]">
                {latestMessage ? `${latestMessage.sender}: ${latestMessage.text}` : 'Join the conversation...'}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* EXPANDED REAL GLOBAL CHAT WINDOW */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-16 sm:right-6 sm:left-auto sm:w-96 z-50 flex flex-col h-[460px] max-h-[72vh] bg-slate-900/98 rounded-3xl border border-amber-500/50 shadow-2xl backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5 leading-none">
                  <span>Real Online Chat</span>
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                </h4>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-emerald-400 font-semibold">{onlineCount} Online</span>
                  <span>·</span>
                  <span className="text-amber-300/90">3s cooldown</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditingName(!isEditingName)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Change Trainer Name"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Edit Name Bar */}
          {isEditingName && (
            <form
              onSubmit={handleSaveName}
              className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs"
            >
              <span className="text-slate-400 font-bold shrink-0">Your Name:</span>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={18}
                className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer text-xs"
              >
                Save
              </button>
            </form>
          )}

          {/* Real Chat Messages List */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs select-text touch-pan-y">
            {messages.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No messages yet. Send the first message to the realm!
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === trainerName;
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-2xl transition-all ${
                      isMe
                        ? 'bg-amber-950/45 border border-amber-500/40 ml-4'
                        : 'bg-slate-950/70 border border-slate-800/80 mr-2'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{m.avatar}</span>
                        <span
                          className={`font-black text-[11px] truncate ${
                            isMe ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {m.sender}
                        </span>
                        {m.badge && (
                          <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 border border-slate-700">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">
                        {m.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed break-words pl-5">
                      {m.text}
                    </p>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Cooldown Error Alert */}
          {errorMessage && (
            <div className="px-3 py-1 bg-rose-950/90 text-rose-300 text-[11px] font-bold text-center border-t border-rose-500/40 animate-pulse">
              {errorMessage}
            </div>
          )}

          {/* Input Box with 3-Second Cooldown */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={
                cooldownRemaining > 0
                  ? `Reply available in ${cooldownRemaining}s...`
                  : 'Message all online trainers...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={cooldownRemaining > 0}
              maxLength={150}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || cooldownRemaining > 0}
              className={`p-2 px-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1 shrink-0 ${
                cooldownRemaining > 0
                  ? 'bg-slate-800 text-amber-400 font-mono cursor-not-allowed border border-slate-700'
                  : inputMessage.trim()
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {cooldownRemaining > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{cooldownRemaining}s</span>
                </>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};
