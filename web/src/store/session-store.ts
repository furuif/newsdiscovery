import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export type WorkflowStatus = 
  | 'pending' | 'analyzing' | 'designing' | 'validating' 
  | 'generating' | 'printing' | 'completed' | 'failed';

export interface ProgressUpdate {
  message: string;
  progress: number;
  stage?: string;
}

export interface SessionState {
  sessionId: string | null;
  status: WorkflowStatus;
  progress: number;
  currentMessage: string;
  imageUrl: string | null;
  result: any | null;
  error: string | null;
  isProcessing: boolean;
  socket: Socket | null;
}

interface SessionActions {
  setSessionId: (id: string) => void;
  setStatus: (status: WorkflowStatus) => void;
  setProgress: (progress: number, message: string) => void;
  setImageUrl: (url: string) => void;
  setResult: (result: any) => void;
  setError: (error: string) => void;
  connectSocket: (sessionId: string) => void;
  disconnectSocket: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState & SessionActions>((set, get) => ({
  sessionId: null,
  status: 'pending',
  progress: 0,
  currentMessage: '等待开始',
  imageUrl: null,
  result: null,
  error: null,
  isProcessing: false,
  socket: null,

  setSessionId: (id: string) => set({ sessionId: id }),

  setStatus: (status: WorkflowStatus) => set({ status }),

  setProgress: (progress: number, message: string) => 
    set({ progress, currentMessage: message }),

  setImageUrl: (url: string) => set({ imageUrl: url }),

  setResult: (result: any) => set({ result, isProcessing: false, progress: 100 }),

  setError: (error: string) => set({ error, isProcessing: false }),

  connectSocket: (sessionId: string) => {
    const socket = io('ws://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('join', sessionId);
    });

    socket.on('progress', (data: { message: string; progress: number }) => {
      console.log('Progress update:', data);
      set({ 
        progress: data.progress, 
        currentMessage: data.message,
        isProcessing: data.progress < 100,
      });
    });

    socket.on('result', (data: any) => {
      console.log('Result received:', data);
      set({ result: data, isProcessing: false, progress: 100 });
    });

    socket.on('error', (data: { error: string }) => {
      console.error('Socket error:', data);
      set({ error: data.error, isProcessing: false });
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  reset: () => {
    get().disconnectSocket();
    set({
      sessionId: null,
      status: 'pending',
      progress: 0,
      currentMessage: '等待开始',
      imageUrl: null,
      result: null,
      error: null,
      isProcessing: false,
    });
  },
}));
